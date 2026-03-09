import * as fs from 'fs';
import * as dns from 'dns';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

const TOKEN = process.env.TMDB_USER_ACCESS_TOKEN;
const IMAGE_PREFIX = 'https://image.tmdb.org/t/p/w500';

async function createList(name, description) {
  const res = await fetch('https://api.themoviedb.org/4/list', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, iso_639_1: 'en', iso_3166_1: 'US', public: true }),
  });
  const data = await res.json();
  if (!data.id) throw new Error(`Failed to create list: ${JSON.stringify(data)}`);
  return String(data.id);
}

async function addItems(listId, entries) {
  const items = entries.map(e => ({ media_type: e.mediaType, media_id: e.tmdbId }));
  for (let i = 0; i < items.length; i += 20) {
    const chunk = items.slice(i, i + 20);
    const res = await fetch(`https://api.themoviedb.org/4/list/${listId}/items`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: chunk }),
    });
    const data = await res.json();
    process.stdout.write('.');
  }
  console.log();
}

const moviesEntries = JSON.parse(fs.readFileSync('./entries/curated-lists/entries_games.json', 'utf8'));
const tvEntries = JSON.parse(fs.readFileSync('./entries/curated-lists/entries_games_tv.json', 'utf8'));
const allEntries = [...moviesEntries, ...tvEntries];

console.log(`Creating: Press Start — Based on Video Games (${allEntries.length} items)`);
const listId = await createList(
  'Press Start — Based on Video Games',
  'Every movie and TV adaptation of a video game — from Super Mario to The Last of Us, Mortal Kombat to Fallout. Some legendary, some infamous, all worth watching.'
);
console.log(`  List ID: ${listId}`);
process.stdout.write('  Adding items: ');
await addItems(listId, allEntries);

console.log(`\nDone! List ID: ${listId}`);
console.log(`imagePath: ${IMAGE_PREFIX}/9n2tJBplPbgR2ca05hS5CKXwP2c.jpg`);
