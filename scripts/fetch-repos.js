#!/usr/bin/env node
/**
 * 從 GitHub API 抓取 ronnywang 的所有 public repo 資料
 * 用法：node scripts/fetch-repos.js
 * 環境變數：GITHUB_TOKEN（可選，避免 rate limit）
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT = join(ROOT, 'data', 'repos.json');
const USERNAME = 'ronnywang';

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ronny-memoir-script',
};
if (process.env.GITHUB_TOKEN) {
  headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
}

async function fetchAllRepos() {
  const allRepos = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/users/${USERNAME}/repos?per_page=100&page=${page}&type=public&sort=created&direction=desc`;
    console.log(`正在抓取第 ${page} 頁...`);

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GitHub API 錯誤 (${res.status}): ${err}`);
    }

    const repos = await res.json();
    if (repos.length === 0) break;

    for (const repo of repos) {
      allRepos.push({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || '',
        html_url: repo.html_url,
        homepage: repo.homepage || '',
        language: repo.language || '',
        topics: repo.topics || [],
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        is_fork: repo.fork,
        forked_from: repo.fork ? repo.parent?.full_name || '' : '',
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        size: repo.size,
        default_branch: repo.default_branch,
        has_readme: false, // 之後由 fetch-readmes.js 更新
      });
    }

    // 如果 fork 的 repo 需要取得 parent 名稱，需額外 API call
    // 這裡先用簡化版，parent 資訊在基本 API 回傳中不含
    page++;
    if (repos.length < 100) break;
  }

  return allRepos;
}

async function enrichForksWithParent(repos) {
  const forks = repos.filter(r => r.is_fork && !r.forked_from);
  if (forks.length === 0) return repos;

  console.log(`\n正在取得 ${forks.length} 個 fork 的來源 repo...`);
  for (const repo of forks) {
    try {
      const url = `https://api.github.com/repos/${repo.full_name}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        repo.forked_from = data.parent?.full_name || '';
      }
      // 避免 rate limit
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.warn(`  無法取得 ${repo.name} 的 fork 來源: ${e.message}`);
    }
  }
  return repos;
}

async function main() {
  console.log(`開始抓取 ${USERNAME} 的 public repos...\n`);

  let repos = await fetchAllRepos();
  repos = await enrichForksWithParent(repos);

  // 依建立時間排序（新到舊）
  repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  mkdirSync(join(ROOT, 'data'), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(repos, null, 2), 'utf-8');

  console.log(`\n✓ 完成！共抓到 ${repos.length} 個 repo`);
  console.log(`  儲存到 ${OUTPUT}`);

  // 統計
  const languages = {};
  for (const r of repos) {
    if (r.language) languages[r.language] = (languages[r.language] || 0) + 1;
  }
  const topLangs = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5);
  console.log(`\n  語言分佈（前五）：`);
  for (const [lang, count] of topLangs) {
    console.log(`    ${lang}: ${count} 個`);
  }
  console.log(`\n  Fork 數量：${repos.filter(r => r.is_fork).length}`);
  console.log(`  自建 repo：${repos.filter(r => !r.is_fork).length}`);
  console.log(`  總 stars：${repos.reduce((s, r) => s + r.stars, 0)}`);
}

main().catch(err => {
  console.error('錯誤:', err);
  process.exit(1);
});
