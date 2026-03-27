#!/usr/bin/env node
/**
 * 訪談管理工具（問答本身在 Claude Code 對話中進行）
 *
 * 用法：
 *   node scripts/interview.js --list            # 列出未完成的 repo（按 stars 排序）
 *   node scripts/interview.js --list --all       # 列出全部（含已完成）
 *   node scripts/interview.js --skip REPO        # 標記跳過
 *   node scripts/interview.js --unskip REPO      # 取消跳過
 *   node scripts/interview.js --stats            # 進度統計
 *   node scripts/interview.js --info REPO        # 顯示單一 repo 的完整資訊（供 Claude Code 訪談使用）
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REPOS_FILE        = join(ROOT, 'data', 'repos.json');
const OPENFUN_FILE      = join(ROOT, 'data', 'openfunltd-repos.json');
const G0V_FILE          = join(ROOT, 'data', 'g0v-ronnywang-repos.json');
const READMES_DIR       = join(ROOT, 'data', 'readmes');
const STORIES_DIR       = join(ROOT, 'content', 'stories');
const SKIPPED_FILE      = join(ROOT, 'data', 'skipped.json');
const HACKATHON_FILE    = join(ROOT, 'data', 'hackathon-links.json');

function loadRepos() {
  // 合併三個來源，統一格式
  const ronnywang = JSON.parse(readFileSync(REPOS_FILE, 'utf-8'));

  const openfun = existsSync(OPENFUN_FILE)
    ? JSON.parse(readFileSync(OPENFUN_FILE, 'utf-8')).map(r => ({
        ...r,
        stars: r.stars ?? r.stargazers_count ?? 0,
        org: 'openfunltd',
      }))
    : [];

  const g0v = existsSync(G0V_FILE)
    ? JSON.parse(readFileSync(G0V_FILE, 'utf-8')).map(r => ({
        name: r.name || r.repo?.split('/')[1] || r.repo,
        full_name: r.full_name || r.repo,
        org: 'g0v',
        description: r.description || '',
        html_url: r.html_url || `https://github.com/${r.repo || r.full_name}`,
        homepage: r.homepage || '',
        language: r.language || '',
        topics: r.topics || [],
        stars: r.stars ?? 0,
        forks: r.forks ?? 0,
        is_fork: r.is_fork ?? false,
        forked_from: r.forked_from || '',
        created_at: r.created_at || '',
        updated_at: r.updated_at || '',
        pushed_at: r.pushed_at || '',
        commits_by_ronnywang: r.commits_by_ronnywang,
      }))
    : [];

  return [...ronnywang, ...openfun, ...g0v];
}
function loadSkipped()    { return existsSync(SKIPPED_FILE) ? JSON.parse(readFileSync(SKIPPED_FILE, 'utf-8')) : []; }
function saveSkipped(arr) { writeFileSync(SKIPPED_FILE, JSON.stringify(arr, null, 2), 'utf-8'); }
function hasStory(name)   { return existsSync(join(STORIES_DIR, `${name}.md`)); }
function readReadme(name) {
  const p = join(READMES_DIR, `${name}.md`);
  return existsSync(p) ? readFileSync(p, 'utf-8').slice(0, 2000) : '';
}
function loadHackathonLinks() {
  return existsSync(HACKATHON_FILE) ? JSON.parse(readFileSync(HACKATHON_FILE, 'utf-8')) : {};
}

// -------

function cmdStats() {
  const repos   = loadRepos();
  const skipped = loadSkipped();
  const done    = repos.filter(r => hasStory(r.name)).length;
  const skip    = skipped.length;
  const pending = repos.length - done - skip;
  const pct     = Math.round(done / repos.length * 100);

  console.log(`\n進度：${done} / ${repos.length}  (${pct}%)`);
  console.log(`  已完成：${done}`);
  console.log(`  跳過：${skip}`);
  console.log(`  待訪談：${pending}\n`);

  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const doneStars  = repos.filter(r => hasStory(r.name)).reduce((s, r) => s + r.stars, 0);
  console.log(`Stars 覆蓋率：${doneStars} / ${totalStars} (${Math.round(doneStars/totalStars*100)}%)`);
}

function cmdList(showAll = false) {
  const repos   = loadRepos();
  const skipped = new Set(loadSkipped());
  const hackLinks = loadHackathonLinks();

  let list = repos.filter(r => {
    if (showAll) return true;
    return !hasStory(r.name) && !skipped.has(r.name);
  });

  // 依 stars 排序
  list.sort((a, b) => (b.stars * 3 + b.forks) - (a.stars * 3 + a.forks));

  const done  = repos.filter(r => hasStory(r.name)).length;
  console.log(`\n${showAll ? '全部' : '待完成'} ${list.length} 個（已完成 ${done} / ${repos.length}）\n`);

  for (const r of list.slice(0, 50)) {
    const year    = r.created_at.slice(0, 4);
    const status  = hasStory(r.name) ? '✓' : skipped.has(r.name) ? 'skip' : '    ';
    const fork    = r.is_fork ? '[fork]' : '';
    const hack    = hackLinks[r.name] ? ` [g0v第${hackLinks[r.name][0].term}次]` : '';
    console.log(`${status} ${r.name.padEnd(45)} ${year}  ★${String(r.stars).padStart(4)}${fork}${hack}`);
    if (r.description) console.log(`     ${r.description.slice(0, 80)}`);
  }
  if (list.length > 50) console.log(`\n  ... 還有 ${list.length - 50} 個`);
}

function cmdSkip(name, unskip = false) {
  const skipped = loadSkipped();
  if (unskip) {
    const idx = skipped.indexOf(name);
    if (idx >= 0) { skipped.splice(idx, 1); saveSkipped(skipped); console.log(`已取消跳過：${name}`); }
    else console.log(`${name} 不在跳過清單`);
  } else {
    if (!skipped.includes(name)) { skipped.push(name); saveSkipped(skipped); console.log(`已標記跳過：${name}`); }
    else console.log(`${name} 已在跳過清單`);
  }
}

function cmdInfo(name) {
  const repos = loadRepos();
  const repo  = repos.find(r => r.name === name);
  if (!repo) { console.error(`找不到 repo：${name}`); process.exit(1); }

  const readme   = readReadme(name);
  const hackLinks = loadHackathonLinks();
  const hacks    = hackLinks[name] || [];

  console.log('\n' + '='.repeat(60));
  console.log(`repo:        ${repo.name}`);
  console.log(`描述:        ${repo.description || '（無）'}`);
  console.log(`語言:        ${repo.language || '不明'}`);
  console.log(`stars:       ${repo.stars}  forks: ${repo.forks}`);
  console.log(`建立:        ${repo.created_at.slice(0, 10)}`);
  console.log(`最後更新:    ${repo.pushed_at.slice(0, 10)}`);
  console.log(`fork:        ${repo.is_fork ? '是（來自 ' + repo.forked_from + '）' : '否'}`);
  console.log(`topics:      ${repo.topics.join(', ') || '（無）'}`);
  console.log(`GitHub:      ${repo.html_url}`);
  if (repo.homepage) console.log(`網站:        ${repo.homepage}`);

  if (hacks.length > 0) {
    console.log('\n【關聯 g0v 黑客松提案】');
    for (const h of hacks) {
      console.log(`  第 ${h.term} 次（${h.date}）${h.eventName}`);
      console.log(`  提案：${h.project}`);
      if (h.brief) console.log(`  摘要：${h.brief}`);
      if (h.guideline) console.log(`  提案文件：${h.guideline}`);
      if (h.slides?.length) console.log(`  簡報：${h.slides.join(', ')}`);
      if (h.video) console.log(`  影片：${h.video}`);
      console.log(`  比對方法：${h.method === 'url_match' ? 'URL 精確比對' : `日期鄰近（差 ${h.diffDays} 天）`}`);
    }
  }

  if (readme) {
    console.log('\n【README（前 2000 字）】');
    console.log(readme);
  }
  console.log('='.repeat(60));
}

// --- main ---
const args = process.argv.slice(2);

if (args.includes('--stats')) {
  cmdStats();
} else if (args.includes('--list')) {
  cmdList(args.includes('--all'));
} else if (args.includes('--skip')) {
  const n = args[args.indexOf('--skip') + 1];
  if (!n) { console.error('請指定 repo 名稱'); process.exit(1); }
  cmdSkip(n);
} else if (args.includes('--unskip')) {
  const n = args[args.indexOf('--unskip') + 1];
  if (!n) { console.error('請指定 repo 名稱'); process.exit(1); }
  cmdSkip(n, true);
} else if (args.includes('--info')) {
  const n = args[args.indexOf('--info') + 1];
  if (!n) { console.error('請指定 repo 名稱'); process.exit(1); }
  cmdInfo(n);
} else {
  console.log(`
用法：
  npm run interview -- --list           列出待訪談 repo（按 stars 排序）
  npm run interview -- --list --all     列出全部
  npm run interview -- --stats          進度統計
  npm run interview -- --skip REPO      跳過某個 repo
  npm run interview -- --unskip REPO    取消跳過
  npm run interview -- --info REPO      顯示 repo 完整資訊（供 Claude Code 訪談）

訪談本身請在 Claude Code 對話中進行：
  告訴 Claude：「訪談 REPO」，Claude 會讀取資料、問問題、寫故事。
  `);
}
