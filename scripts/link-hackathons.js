#!/usr/bin/env node
/**
 * 把 g0v 黑客松提案資料和 repos 做交叉連結
 * 策略：
 *   1. 從 CSV 找出 ronnywang 的提案
 *   2. 用提案中的 GitHub URL 直接比對 repo 名稱
 *   3. 用提案日期（±90 天）比對 repo 建立時間（作為備援）
 *   4. 把結果存到 data/hackathon-links.json
 *
 * 用法：node scripts/link-hackathons.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- 解析 CSV ---
function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim(); });
    return obj;
  });
}

function parseCSVLine(line) {
  const result = [];
  let cur = '', inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      result.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

// --- 從文字中抽出 ronnywang 的 GitHub repo 名稱 ---
function extractRonnyRepos(text) {
  const repos = new Set();
  // 直接的 ronnywang repo URL
  const re1 = /github\.com\/ronnywang\/([a-zA-Z0-9_\-\.]+)/gi;
  let m;
  while ((m = re1.exec(text)) !== null) {
    repos.add(m[1].replace(/\.git$/, '').replace(/\/.*/, ''));
  }
  // ronnywang.github.io/{repo} → repo 名稱
  const re2 = /ronnywang\.github\.io\/([a-zA-Z0-9_\-\.]+)/gi;
  while ((m = re2.exec(text)) !== null) {
    repos.add(m[1].replace(/\/.*/, ''));
  }
  // {repo}.g0v.ronny.tw → repo 名稱（e.g. govmoney.g0v.ronny.tw → govmoney）
  const re3 = /([a-zA-Z0-9_\-]+)\.g0v\.ronny\.tw/gi;
  while ((m = re3.exec(text)) !== null) {
    repos.add(m[1]);
  }
  return [...repos];
}

// --- 主程式 ---
async function main() {
  const csvPath = join(ROOT, 'data', 'g0v-hackathons.csv');
  const reposPath = join(ROOT, 'data', 'repos.json');

  if (!existsSync(csvPath)) { console.error('找不到 data/g0v-hackathons.csv'); process.exit(1); }
  if (!existsSync(reposPath)) { console.error('找不到 data/repos.json'); process.exit(1); }

  const rows = parseCSV(readFileSync(csvPath, 'utf-8'));
  const repos = JSON.parse(readFileSync(reposPath, 'utf-8'));

  // 找出 ronnywang 的提案
  const myProposals = rows.filter(r => {
    const owner = (r['owner name'] || '').toLowerCase();
    return owner.includes('ronny');
  });

  console.log(`找到 ${myProposals.length} 筆 ronnywang 的 g0v 提案\n`);

  // 建立 repo 名稱 → hackathon 的對應表
  const repoToHackathon = {};

  // 方法 1：從提案文字直接找 github.com/ronnywang/xxx
  for (const p of myProposals) {
    const allText = [p['guideline'], p['other document'], p['other document 2'], p['other document 3']].join(' ');
    const foundRepos = extractRonnyRepos(allText);

    for (const repoName of foundRepos) {
      if (!repoToHackathon[repoName]) repoToHackathon[repoName] = [];
      repoToHackathon[repoName].push({
        method: 'url_match',
        term: p['term'],
        eventName: p['event name'],
        date: p['date'],
        project: p['project'],
        brief: p['three brief'],
        guideline: p['guideline'],
        slides: [p['other document'], p['other document 2'], p['other document 3']].filter(Boolean),
        video: p['video link'],
      });
    }
  }

  // 方法 2：日期比對（提案日期前後 180 天內建立的 repo，作為候選）
  const dateMatches = {};
  for (const p of myProposals) {
    if (!p['date']) continue;
    const hackDate = new Date(p['date'].replace(/\//g, '-'));
    if (isNaN(hackDate)) continue;

    for (const repo of repos) {
      const repoDate = new Date(repo.created_at);
      const diffDays = Math.abs((repoDate - hackDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 180) {
        if (!dateMatches[repo.name]) dateMatches[repo.name] = [];
        dateMatches[repo.name].push({
          method: 'date_proximity',
          diffDays: Math.round(diffDays),
          term: p['term'],
          eventName: p['event name'],
          date: p['date'],
          project: p['project'],
          brief: p['three brief'],
          guideline: p['guideline'],
          slides: [p['other document'], p['other document 2'], p['other document 3']].filter(Boolean),
          video: p['video link'],
        });
      }
    }
  }

  // 合併結果，日期比對只作為輔助（不覆蓋 URL 比對）
  for (const [repoName, matches] of Object.entries(dateMatches)) {
    if (!repoToHackathon[repoName]) {
      // 只取最接近的一筆日期比對
      const best = matches.sort((a, b) => a.diffDays - b.diffDays)[0];
      repoToHackathon[repoName] = [best];
    }
  }

  // 輸出結果
  const outputPath = join(ROOT, 'data', 'hackathon-links.json');
  writeFileSync(outputPath, JSON.stringify(repoToHackathon, null, 2), 'utf-8');

  // 統計
  const urlMatched = Object.values(repoToHackathon).filter(v => v[0].method === 'url_match').length;
  const dateMatched = Object.values(repoToHackathon).filter(v => v[0].method === 'date_proximity').length;

  console.log(`連結結果：`);
  console.log(`  URL 精確比對：${urlMatched} 個 repo`);
  console.log(`  日期鄰近（候選）：${dateMatched} 個 repo`);
  console.log(`\n  儲存到 data/hackathon-links.json\n`);

  // 顯示 URL 精確比對的結果
  console.log('【URL 精確比對】');
  for (const [repo, matches] of Object.entries(repoToHackathon)) {
    if (matches[0].method !== 'url_match') continue;
    const m = matches[0];
    console.log(`  ${repo}`);
    console.log(`    黑客松：第 ${m.term} 次（${m.date}）${m.eventName}`);
    console.log(`    提案：${m.project}`);
    if (m.video) console.log(`    影片：${m.video}`);
    console.log();
  }
}

main().catch(err => {
  console.error('錯誤:', err);
  process.exit(1);
});
