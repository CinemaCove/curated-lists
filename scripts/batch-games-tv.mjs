import * as fs from 'fs';
import * as dns from 'dns';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { execSync } from 'child_process';

const require = createRequire(import.meta.url);
require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

const TOKEN = process.env.TMDB_USER_ACCESS_TOKEN;

// Fetch the Wikipedia page via curl
console.log('Fetching Wikipedia page...');
const raw = execSync(
  `curl -s -A "Mozilla/5.0" "https://en.wikipedia.org/w/api.php?action=parse&page=List_of_television_series_based_on_video_games&prop=text&format=json"`,
  { maxBuffer: 20 * 1024 * 1024 }
).toString();

const json = JSON.parse(raw);
const html = json.parse.text['*'];

// Extract all list items
const itemMatches = html.match(/<li[\s\S]*?<\/li>/g) || [];

// Decode HTML entities and strip tags
function decode(str) {
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8202;/g, '')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#[0-9]+;/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract title + year from a string like "Some Title (2005)" or "Some Title (2005–2010)"
function extractTitleYear(text) {
  const match = text.match(/^(.+?)\s*\((\d{4})(?:[–\-]\d{4}|[–\-]present)?\)/);
  if (!match) return null;
  const title = match[1].trim();
  const year = parseInt(match[2]);
  if (year > 2027) return null;
  if (title.length < 2) return null;
  // Skip navigation/footer items (these tend to be very short or common words)
  if (/^(v|t|e|See also|Notes|References|External links)$/i.test(title)) return null;
  return { title, year };
}

// Parse all list items and collect unique title+year pairs
const seen = new Set();
const series = [];

for (const item of itemMatches) {
  const text = decode(item);
  // Some items have multiple entries on one line (franchise groupings)
  // Split on – or newline-like patterns between entries
  // Each sub-entry usually looks like "Title (year)"
  const segments = text.split(/(?<=\))\s+(?=[A-Z])/);
  for (const seg of segments) {
    const parsed = extractTitleYear(seg);
    if (parsed && !seen.has(parsed.title.toLowerCase())) {
      seen.add(parsed.title.toLowerCase());
      series.push(parsed);
    }
  }
}

// Also include the live-action series from the table (not in <li> tags)
const liveAction = [
  { year: 1989, title: 'The Super Mario Bros. Super Show!' },
  { year: 1990, title: 'Maniac Mansion' },
  { year: 1997, title: 'Shin Megami Tensei: Devil Summoner' },
  { year: 1998, title: 'Mortal Kombat: Conquest' },
  { year: 2010, title: 'Kurohyō: Ryū ga Gotoku Shinshō' },
  { year: 2020, title: 'Gangs of London' },
  { year: 2022, title: 'Halo' },
  { year: 2022, title: 'Resident Evil' },
  { year: 2023, title: 'The Last of Us' },
  { year: 2023, title: 'Twisted Metal' },
  { year: 2024, title: 'Knuckles' },
  { year: 2024, title: 'Like a Dragon: Yakuza' },
  { year: 2024, title: 'Fallout' },
];
for (const s of liveAction) {
  if (!seen.has(s.title.toLowerCase())) {
    seen.add(s.title.toLowerCase());
    series.push(s);
  }
}

console.log(`Found ${series.length} series to search.`);

async function searchTV(title, year) {
  const url = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(title)}&first_air_date_year=${year}&page=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const data = await res.json();
  if (data.results?.length > 0) return data.results[0];

  // Retry without year
  const url2 = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(title)}&page=1`;
  const res2 = await fetch(url2, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const data2 = await res2.json();
  return data2.results?.length > 0 ? data2.results[0] : null;
}

const entries = [];
const notFound = [];
const seenIds = new Set();

for (const show of series) {
  const result = await searchTV(show.title, show.year);
  if (result) {
    if (seenIds.has(result.id)) {
      console.log(`  (duplicate skipped: ${result.name})`);
      continue;
    }
    seenIds.add(result.id);
    entries.push({
      name: result.name,
      tmdbId: result.id,
      mediaType: 'tv',
      backdropPath: result.backdrop_path || null,
    });
    console.log(`✓ ${result.name} (${result.id})`);
  } else {
    notFound.push(show.title);
    console.log(`✗ NOT FOUND: ${show.title} (${show.year})`);
  }
  await new Promise(r => setTimeout(r, 120));
}

const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../entries/curated-lists/entries_games_tv.json');
fs.writeFileSync(outPath, JSON.stringify(entries, null, 4));

console.log(`\nDone! ${entries.length} entries saved to entries_games_tv.json`);
if (notFound.length > 0) {
  console.log(`\nNot found (${notFound.length}):`);
  notFound.forEach(t => console.log(' -', t));
}
