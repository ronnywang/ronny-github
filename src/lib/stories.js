/**
 * 讀取 content/stories/ 下所有故事檔案
 * 在 Astro build 時呼叫（Node.js 環境）
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// 解析簡易 YAML frontmatter
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const yamlStr = match[1];
  const content = match[2].trim();
  const data = {};

  for (const line of yamlStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    // 去除引號
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // 數字
    else if (/^\d+$/.test(val)) val = parseInt(val);
    // boolean
    else if (val === 'true') val = true;
    else if (val === 'false') val = false;
    // array: ["a", "b"]
    else if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }

    data[key] = val;
  }

  return { data, content };
}

export function getAllStories() {
  const storiesDir = join(process.cwd(), 'content', 'stories');
  if (!existsSync(storiesDir)) return [];

  const files = readdirSync(storiesDir).filter(f => f.endsWith('.md'));
  const stories = [];

  for (const file of files) {
    const raw = readFileSync(join(storiesDir, file), 'utf-8');
    const { data, content } = parseFrontmatter(raw);
    stories.push({
      slug: file.replace('.md', ''),
      ...data,
      content,
    });
  }

  // 依日期排序（新到舊）
  stories.sort((a, b) => new Date(b.date) - new Date(a.date));
  return stories;
}

export function getStoryBySlug(slug) {
  const p = join(process.cwd(), 'content', 'stories', `${slug}.md`);
  if (!existsSync(p)) return null;
  const raw = readFileSync(p, 'utf-8');
  const { data, content } = parseFrontmatter(raw);
  return { slug, ...data, content };
}

export function getAllTopics(stories) {
  const map = {};
  for (const s of stories) {
    const topics = Array.isArray(s.topics) ? s.topics : [];
    for (const t of topics) {
      if (!map[t]) map[t] = [];
      map[t].push(s);
    }
    // 也用語言當 topic
    if (s.language) {
      const lang = s.language;
      if (!map[lang]) map[lang] = [];
      map[lang].push(s);
    }
  }
  // 依數量排序
  return Object.entries(map)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([topic, stories]) => ({ topic, stories }));
}

export function groupByYear(stories) {
  const map = {};
  for (const s of stories) {
    const year = s.date ? s.date.slice(0, 4) : 'unknown';
    if (!map[year]) map[year] = [];
    map[year].push(s);
  }
  return Object.entries(map)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, stories]) => ({ year, stories }));
}
