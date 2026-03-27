#!/usr/bin/env node
/**
 * 批次抓取每個 repo 的 README 內容
 * 用法：node scripts/fetch-readmes.js
 *
 * 不需要 GITHUB_TOKEN：直接從 raw.githubusercontent.com 抓，走 CDN，無 rate limit 問題
 * 會自動嘗試 main → master → develop 等常見 branch 名稱
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPOS_FILE = join(ROOT, 'data', 'repos.json');
const READMES_DIR = join(ROOT, 'data', 'readmes');

const BRANCHES = ['main', 'master', 'develop', 'gh-pages'];
const README_NAMES = ['README.md', 'readme.md', 'README.MD', 'README.rst', 'README'];

async function fetchRawReadme(owner, repo, branch, filename) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'ronny-memoir-script' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

async function getReadme(repoName) {
  for (const branch of BRANCHES) {
    for (const filename of README_NAMES) {
      const content = await fetchRawReadme('ronnywang', repoName, branch, filename);
      if (content !== null) return content;
    }
  }
  return null;
}

async function main() {
  if (!existsSync(REPOS_FILE)) {
    console.error('找不到 data/repos.json，請先執行：npm run fetch-repos');
    process.exit(1);
  }

  const repos = JSON.parse(readFileSync(REPOS_FILE, 'utf-8'));
  mkdirSync(READMES_DIR, { recursive: true });

  let done = 0, skipped = 0, noReadme = 0, errors = 0;

  for (const repo of repos) {
    const outFile = join(READMES_DIR, `${repo.name}.md`);

    if (existsSync(outFile)) {
      skipped++;
      continue;
    }

    try {
      const content = await getReadme(repo.name);
      writeFileSync(outFile, content || '', 'utf-8');
      repo.has_readme = !!content;
      if (content) {
        done++;
      } else {
        noReadme++;
      }
      process.stdout.write(`\r  ${done + noReadme + skipped}/${repos.length} ${repo.name.padEnd(50)}`);
    } catch (e) {
      console.warn(`\n  錯誤 ${repo.name}: ${e.message}`);
      errors++;
    }

    // 稍作間隔，友善對待 CDN
    await new Promise(r => setTimeout(r, 100));
  }

  writeFileSync(REPOS_FILE, JSON.stringify(repos, null, 2), 'utf-8');

  console.log(`\n\n完成！`);
  console.log(`  有 README：${done} 個`);
  console.log(`  無 README：${noReadme} 個`);
  console.log(`  已跳過（之前已抓）：${skipped} 個`);
  if (errors > 0) console.log(`  錯誤：${errors} 個`);
}

main().catch(err => {
  console.error('錯誤:', err);
  process.exit(1);
});
