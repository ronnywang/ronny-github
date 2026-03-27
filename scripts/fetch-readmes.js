#!/usr/bin/env node
/**
 * 批次抓取每個 repo 的 README 內容
 * 用法：node scripts/fetch-readmes.js
 * 環境變數：GITHUB_TOKEN（建議設定，否則 210 個 repo 很容易觸發 rate limit）
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPOS_FILE = join(ROOT, 'data', 'repos.json');
const READMES_DIR = join(ROOT, 'data', 'readmes');

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ronny-memoir-script',
};
if (process.env.GITHUB_TOKEN) {
  headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
}

async function fetchReadme(fullName) {
  const url = `https://api.github.com/repos/${fullName}/readme`;
  const res = await fetch(url, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

async function main() {
  if (!existsSync(REPOS_FILE)) {
    console.error('找不到 data/repos.json，請先執行 npm run fetch-repos');
    process.exit(1);
  }

  const repos = JSON.parse(readFileSync(REPOS_FILE, 'utf-8'));
  mkdirSync(READMES_DIR, { recursive: true });

  let done = 0, skipped = 0, errors = 0;

  for (const repo of repos) {
    const outFile = join(READMES_DIR, `${repo.name}.md`);

    // 已抓過則跳過
    if (existsSync(outFile)) {
      skipped++;
      continue;
    }

    try {
      const content = await fetchReadme(repo.full_name);
      if (content) {
        writeFileSync(outFile, content, 'utf-8');
        // 更新 repos.json 中的 has_readme 欄位
        repo.has_readme = true;
        done++;
        process.stdout.write(`\r✓ ${done + skipped}/${repos.length} - ${repo.name}          `);
      } else {
        writeFileSync(outFile, '', 'utf-8'); // 空檔，標記已查過
        done++;
      }
    } catch (e) {
      console.warn(`\n  錯誤 ${repo.name}: ${e.message}`);
      errors++;
    }

    // 避免 GitHub API rate limit（未登入：60 req/hr，登入：5000 req/hr）
    const delay = process.env.GITHUB_TOKEN ? 200 : 2000;
    await new Promise(r => setTimeout(r, delay));
  }

  // 更新 repos.json 的 has_readme 欄位
  writeFileSync(REPOS_FILE, JSON.stringify(repos, null, 2), 'utf-8');

  console.log(`\n\n✓ 完成！`);
  console.log(`  新抓取：${done} 個`);
  console.log(`  已跳過（之前已抓）：${skipped} 個`);
  if (errors > 0) console.log(`  錯誤：${errors} 個`);
  console.log(`  README 儲存於 data/readmes/`);
}

main().catch(err => {
  console.error('錯誤:', err);
  process.exit(1);
});
