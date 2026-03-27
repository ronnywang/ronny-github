#!/usr/bin/env node
/**
 * AI 訪談 CLI：針對每個 repo，Claude 問問題，你回答，Claude 生成故事
 *
 * 用法：
 *   node scripts/interview.js              # 按優先順序訪談下一個 repo
 *   node scripts/interview.js --list       # 列出未完成的 repo
 *   node scripts/interview.js --repo NAME  # 訪談指定 repo
 *   node scripts/interview.js --skip NAME  # 跳過指定 repo
 *   node scripts/interview.js --redo NAME  # 重新訪談（覆蓋已有故事）
 *
 * 環境變數：
 *   ANTHROPIC_API_KEY  （必要）
 *   GITHUB_TOKEN       （可選，用於 fetch scripts）
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPOS_FILE = join(ROOT, 'data', 'repos.json');
const READMES_DIR = join(ROOT, 'data', 'readmes');
const STORIES_DIR = join(ROOT, 'content', 'stories');
const SKIPPED_FILE = join(ROOT, 'data', 'skipped.json');

// --- helpers ---

function loadRepos() {
  if (!existsSync(REPOS_FILE)) {
    console.error('找不到 data/repos.json，請先執行：npm run fetch-repos');
    process.exit(1);
  }
  return JSON.parse(readFileSync(REPOS_FILE, 'utf-8'));
}

function loadSkipped() {
  if (!existsSync(SKIPPED_FILE)) return [];
  return JSON.parse(readFileSync(SKIPPED_FILE, 'utf-8'));
}

function saveSkipped(list) {
  writeFileSync(SKIPPED_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

function storyPath(repoName) {
  return join(STORIES_DIR, `${repoName}.md`);
}

function hasStory(repoName) {
  return existsSync(storyPath(repoName));
}

function readReadme(repoName) {
  const p = join(READMES_DIR, `${repoName}.md`);
  if (!existsSync(p)) return '';
  const content = readFileSync(p, 'utf-8');
  // 截斷到前 3000 字，避免 token 爆炸
  return content.slice(0, 3000);
}

function repoYear(repo) {
  return new Date(repo.created_at).getFullYear();
}

/** 優先排序：先看 stars+forks，再看年份（較早的先做，故事更豐富） */
function prioritize(repos, skipped) {
  const skippedSet = new Set(skipped);
  return repos
    .filter(r => !hasStory(r.name) && !skippedSet.has(r.name))
    .sort((a, b) => {
      const scoreA = a.stars * 3 + a.forks * 2;
      const scoreB = b.stars * 3 + b.forks * 2;
      return scoreB - scoreA;
    });
}

// --- readline helpers ---

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

/** 多行輸入：輸入空行結束 */
async function askMultiline(rl, prompt) {
  console.log(prompt);
  console.log('（輸入完畢後，按 Enter 兩次繼續）\n');
  const lines = [];
  return new Promise(resolve => {
    rl.on('line', function handler(line) {
      if (line === '' && lines.length > 0 && lines[lines.length - 1] === '') {
        rl.removeListener('line', handler);
        resolve(lines.slice(0, -1).join('\n').trim());
      } else {
        lines.push(line);
      }
    });
  });
}

// --- Claude API ---

async function generateQuestions(client, repo, readme) {
  const context = `
repo 名稱: ${repo.name}
描述: ${repo.description || '（無）'}
主要語言: ${repo.language || '不明'}
Topics: ${repo.topics.join(', ') || '（無）'}
Stars: ${repo.stars}，Forks: ${repo.forks}
建立時間: ${repo.created_at.slice(0, 10)}
最後更新: ${repo.pushed_at.slice(0, 10)}
是否 Fork: ${repo.is_fork ? '是（來自 ' + (repo.forked_from || '不明') + '）' : '否'}
GitHub 連結: ${repo.html_url}
${repo.homepage ? '網站: ' + repo.homepage : ''}

README（前 3000 字）：
${readme || '（無 README）'}
`.trim();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `你是一位幫忙整理台灣公民科技開發者作品集的訪談員。
以下是一個 GitHub repo 的資訊，請根據這些資訊，提出 3~5 個**有針對性**的訪談問題（用繁體中文），幫助這位開發者講出這個 repo 背後的故事。

問題要具體、有意義，不要問太泛泛的問題（例如「你為什麼做這個？」太空洞）。
如果是 g0v 相關，可以問黑客松提案背景。
如果是資料抓取工具，可以問遇到哪些技術挑戰。
如果是 fork 改造，可以問改了什麼、為什麼原版不夠用。
如果 stars 很多，可以問有沒有人來回報 issue 或貢獻。

直接列出問題，每題一行，前面加數字，不要有其他說明文字。

---
${context}`
    }]
  });

  return message.content[0].text.trim();
}

async function generateStory(client, repo, readme, questionsText, answersText) {
  const context = `
repo 名稱: ${repo.name}
描述: ${repo.description || '（無）'}
主要語言: ${repo.language || '不明'}
Topics: ${repo.topics.join(', ') || '（無）'}
Stars: ${repo.stars}，Forks: ${repo.forks}
建立時間: ${repo.created_at.slice(0, 10)}
是否 Fork: ${repo.is_fork ? '是（來自 ' + (repo.forked_from || '不明') + '）' : '否'}
GitHub: ${repo.html_url}
${repo.homepage ? '網站: ' + repo.homepage : ''}
`.trim();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: `你是一位幫台灣公民科技開發者撰寫作品故事的文字工作者。
請根據以下 repo 資訊和開發者的訪談回答，寫一篇**繁體中文的故事文章**（300~500 字）。

風格要求：
- 第一人稱或敘事體均可，但要有溫度、有故事性
- 說明這個工具的背景（為什麼要做）
- 說明技術挑戰或有趣的過程
- 說明成果或影響（有人用嗎？後來怎樣了？）
- 自然地收尾

不要加標題、不要加 markdown 標題符號（##），直接寫故事內文即可。

---
Repo 基本資訊：
${context}

訪談問題：
${questionsText}

開發者的回答：
${answersText}
`
    }]
  });

  return message.content[0].text.trim();
}

async function generateSummary(client, storyText) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `請用一句話（30字以內）摘要這篇開源故事，繁體中文：\n\n${storyText}`
    }]
  });
  return message.content[0].text.trim();
}

function buildFrontmatter(repo, summary) {
  const topics = [...new Set([...repo.topics])];
  return `---
repo: "${repo.name}"
title: "${repo.description?.replace(/"/g, '\\"') || repo.name}"
date: "${repo.created_at.slice(0, 10)}"
updated: "${repo.pushed_at.slice(0, 10)}"
topics: [${topics.map(t => `"${t}"`).join(', ')}]
language: "${repo.language || ''}"
stars: ${repo.stars}
forks: ${repo.forks}
isFork: ${repo.is_fork}
forkedFrom: "${repo.forked_from || ''}"
homepage: "${repo.homepage || ''}"
githubUrl: "${repo.html_url}"
summary: "${summary.replace(/"/g, '\\"')}"
---
`;
}

// --- commands ---

function cmdList() {
  const repos = loadRepos();
  const skipped = loadSkipped();
  const pending = prioritize(repos, skipped);
  const total = repos.length;
  const done = repos.filter(r => hasStory(r.name)).length;
  const skip = skipped.length;

  console.log(`\n進度：已完成 ${done} / ${total}，跳過 ${skip}\n`);
  console.log('待完成（前 30 筆，依 stars 排序）：\n');
  for (const r of pending.slice(0, 30)) {
    const year = repoYear(r);
    const fork = r.is_fork ? ' [fork]' : '';
    console.log(`  ${r.name.padEnd(45)} ${year}  ★${r.stars}${fork}`);
    if (r.description) console.log(`    ${r.description.slice(0, 80)}`);
  }
  if (pending.length > 30) {
    console.log(`\n  ... 還有 ${pending.length - 30} 個`);
  }
}

function cmdSkip(repoName) {
  const skipped = loadSkipped();
  if (!skipped.includes(repoName)) {
    skipped.push(repoName);
    saveSkipped(skipped);
    console.log(`已標記跳過：${repoName}`);
  } else {
    console.log(`${repoName} 已在跳過清單中`);
  }
}

async function cmdInterview(repoName, redo = false) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('請設定 ANTHROPIC_API_KEY 環境變數');
    process.exit(1);
  }

  const repos = loadRepos();
  let repo;

  if (repoName) {
    repo = repos.find(r => r.name === repoName);
    if (!repo) {
      console.error(`找不到 repo：${repoName}`);
      process.exit(1);
    }
    if (hasStory(repo.name) && !redo) {
      console.log(`${repo.name} 已有故事，使用 --redo 強制重新訪談`);
      process.exit(0);
    }
  } else {
    const skipped = loadSkipped();
    const pending = prioritize(repos, skipped);
    if (pending.length === 0) {
      console.log('所有 repo 都已完成或跳過！');
      process.exit(0);
    }
    repo = pending[0];
  }

  const client = new Anthropic();
  const readme = readReadme(repo.name);

  // 顯示 repo 資訊
  console.log('\n' + '='.repeat(60));
  console.log(`repo: ${repo.name}`);
  console.log(`說明: ${repo.description || '（無）'}`);
  console.log(`語言: ${repo.language || '不明'}  ★${repo.stars}  🍴${repo.forks}`);
  console.log(`建立: ${repo.created_at.slice(0, 10)}  ${repo.is_fork ? '[fork from ' + repo.forked_from + ']' : ''}`);
  console.log(`連結: ${repo.html_url}`);
  console.log('='.repeat(60) + '\n');

  console.log('正在生成訪談問題...\n');
  const questionsText = await generateQuestions(client, repo, readme);

  console.log('訪談問題：\n');
  console.log(questionsText);
  console.log('\n' + '-'.repeat(60));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  // 逐題收集回答
  const questions = questionsText.split('\n').filter(l => l.trim());
  const answers = [];

  console.log('\n請逐一回答以下問題（每題回答後按 Enter，輸入空行繼續下一題）：\n');

  for (let i = 0; i < questions.length; i++) {
    console.log(`\n${questions[i]}`);
    const answer = await askMultiline(rl, '你的回答：');
    answers.push(`Q: ${questions[i]}\nA: ${answer}`);
  }

  rl.close();

  const answersText = answers.join('\n\n');

  console.log('\n\n正在生成故事...\n');
  const storyText = await generateStory(client, repo, readme, questionsText, answersText);

  console.log('\n' + '='.repeat(60));
  console.log('生成的故事：\n');
  console.log(storyText);
  console.log('='.repeat(60) + '\n');

  // 確認是否儲存
  const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
  const confirm = await ask(rl2, '儲存這篇故事？[Y/n/edit] ');
  rl2.close();

  if (confirm.toLowerCase() === 'n') {
    console.log('已取消，故事未儲存。');
    return;
  }

  console.log('\n正在生成摘要...');
  const summary = await generateSummary(client, storyText);
  console.log(`摘要：${summary}`);

  const frontmatter = buildFrontmatter(repo, summary);
  const fullContent = frontmatter + '\n' + storyText + '\n';

  mkdirSync(STORIES_DIR, { recursive: true });
  writeFileSync(storyPath(repo.name), fullContent, 'utf-8');

  console.log(`\n✓ 故事已儲存：content/stories/${repo.name}.md`);

  const done = repos.filter(r => hasStory(r.name)).length;
  console.log(`進度：${done} / ${repos.length}`);
}

// --- main ---

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    cmdList();
    return;
  }

  if (args.includes('--skip')) {
    const idx = args.indexOf('--skip');
    const name = args[idx + 1];
    if (!name) { console.error('請指定 repo 名稱'); process.exit(1); }
    cmdSkip(name);
    return;
  }

  const repoIdx = args.indexOf('--repo');
  const repoName = repoIdx >= 0 ? args[repoIdx + 1] : null;
  const redo = args.includes('--redo');

  await cmdInterview(repoName, redo);
}

main().catch(err => {
  console.error('錯誤:', err);
  process.exit(1);
});
