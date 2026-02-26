// One-off script: batch-search TMDB for all Lego titles and write entries_lego.json
// Run: node scripts/batch-lego.mjs
import 'dotenv/config';
import fs from 'fs';

const TOKEN = process.env.TMDB_USER_ACCESS_TOKEN;
if (!TOKEN) { console.error('TMDB_USER_ACCESS_TOKEN not set'); process.exit(1); }

const OUT = 'entries_lego.json';

const TITLES = [
  { title: "A Lego Brickumentary", type: "movie" },
  { title: "Bionicle: Mask of Light", type: "movie" },
  { title: "Bionicle 2: Legends of Metru Nui", type: "movie" },
  { title: "Bionicle 3: Web of Shadows", type: "movie" },
  { title: "Bionicle: The Legend Reborn", type: "movie" },
  { title: "Galidor: Defenders of the Outer Dimension", type: "tv" },
  { title: "Lego: The Adventures of Clutch Powers", type: "movie" },
  { title: "Lego Batman: The Movie – DC Super Heroes Unite", type: "movie" },
  { title: "Lego DC Comics: Batman Be-Leaguered", type: "movie" },
  { title: "Lego DC Comics Super Heroes: Justice League vs. Bizarro League", type: "movie" },
  { title: "Lego DC Super Heroes: Justice League – Attack of the Legion of Doom", type: "movie" },
  { title: "Lego DC Super Heroes: Justice League – Cosmic Clash", type: "movie" },
  { title: "Lego DC Super Heroes: Justice League – Gotham City Breakout", type: "movie" },
  { title: "Lego DC Super Heroes: The Flash", type: "movie" },
  { title: "Lego DC Super Heroes: Aquaman – Rage of Atlantis", type: "movie" },
  { title: "Lego DC Super Hero Girls: Brain Drain", type: "movie" },
  { title: "Lego DC Super Hero Girls: Super-Villain High", type: "movie" },
  { title: "Lego DC Super Hero Girls: Galactic Wonder", type: "movie" },
  { title: "Lego DC Batman: Family Matters", type: "movie" },
  { title: "Lego DC Shazam! Magic and Monsters", type: "movie" },
  { title: "Lego Marvel Super Heroes: Maximum Overload", type: "movie" },
  { title: "Lego Marvel Super Heroes: Avengers Reassembled!", type: "movie" },
  { title: "Lego Marvel Super Heroes - Guardians of the Galaxy: The Thanos Threat", type: "movie" },
  { title: "Lego Marvel Super Heroes - Black Panther: Trouble in Wakanda", type: "movie" },
  { title: "Lego Marvel Spider-Man: Vexed by Venom", type: "movie" },
  { title: "Lego Marvel Avengers: Climate Conundrum", type: "movie" },
  { title: "Lego Marvel Avengers: Loki in Training", type: "movie" },
  { title: "Lego Marvel Avengers: Time Twisted", type: "movie" },
  { title: "Lego Marvel Avengers: Mission Demolition", type: "movie" },
  { title: "Lego Marvel Avengers: Code Red", type: "movie" },
  { title: "Lego Star Wars: The Quest for R2-D2", type: "movie" },
  { title: "Lego Star Wars: The Padawan Menace", type: "movie" },
  { title: "Lego Star Wars: The Empire Strikes Out", type: "movie" },
  { title: "Lego Star Wars: Revenge of the Brick", type: "movie" },
  { title: "Lego Star Wars: Bombad Bounty", type: "movie" },
  { title: "The Lego Star Wars Holiday Special", type: "movie" },
  { title: "Lego Star Wars: Terrifying Tales", type: "movie" },
  { title: "Lego Star Wars: Summer Vacation", type: "movie" },
  { title: "Lego Star Wars: The Yoda Chronicles", type: "tv" },
  { title: "Lego Star Wars: Droid Tales", type: "tv" },
  { title: "Lego Star Wars: The Freemaker Adventures", type: "tv" },
  { title: "Lego Star Wars: All Stars", type: "tv" },
  { title: "Lego Star Wars: Rebuild the Galaxy", type: "tv" },
  { title: "The Lego Movie", type: "movie" },
  { title: "The Lego Batman Movie", type: "movie" },
  { title: "The Lego Ninjago Movie", type: "movie" },
  { title: "The Lego Movie 2: The Second Part", type: "movie" },
  { title: "Ninjago", type: "tv" },
  { title: "Ninjago: Day of the Departed", type: "movie" },
  { title: "Ninjago: Dragons Rising", type: "tv" },
  { title: "Legends of Chima", type: "tv" },
  { title: "Nexo Knights", type: "tv" },
  { title: "Lego Elves", type: "tv" },
  { title: "Lego Elves: Secret of Elvendale", type: "tv" },
  { title: "Lego Elves: Ragana's Magic Shadow Castle", type: "movie" },
  { title: "Unikitty!", type: "tv" },
  { title: "Lego Hidden Side", type: "tv" },
  { title: "Lego Monkie Kid", type: "tv" },
  { title: "Lego Monkie Kid: A Hero is Born", type: "movie" },
  { title: "Lego Monkie Kid: Revenge of the Spider Queen", type: "movie" },
  { title: "Lego Monkie Kid: The Emperor's Wrath", type: "movie" },
  { title: "Lego Monkie Kid: Embrace Your Destiny", type: "movie" },
  { title: "Lego City Adventures", type: "tv" },
  { title: "Lego Dreamzzz", type: "tv" },
  { title: "Lego Friends: The Next Chapter", type: "tv" },
  { title: "Lego Friends: Girlz 4 Life", type: "movie" },
  { title: "Lego Friends: Girls on a Mission", type: "tv" },
  { title: "Lego Jurassic World: Legend of Isla Nublar", type: "tv" },
  { title: "Lego Jurassic World: The Indominus Escape", type: "movie" },
  { title: "Lego Jurassic World: The Secret Exhibit", type: "movie" },
  { title: "Lego Jurassic World: Double Trouble", type: "movie" },
  { title: "Lego Scooby-Doo! Haunted Hollywood", type: "movie" },
  { title: "Lego Scooby-Doo! Blowout Beach Bash", type: "movie" },
  { title: "Lego Bionicle: The Journey to One", type: "tv" },
  { title: "Hero Factory: Rise of the Rookies", type: "movie" },
  { title: "Lego Hero Factory", type: "tv" },
  { title: "Lego Indiana Jones and the Raiders of the Lost Brick", type: "movie" },
  { title: "Lego Atlantis: The Movie", type: "movie" },
  { title: "Lego Disney Princess: The Castle Quest", type: "movie" },
  { title: "Lego Frozen Northern Lights", type: "movie" },
  { title: "Lego Jurassic Park: The Unofficial Retelling", type: "movie" },
  { title: "Piece by Piece", type: "movie" },
  { title: "The Lego Story", type: "movie" },
  { title: "Mixels", type: "tv" },
  { title: "Lego Pixar: BrickToons", type: "tv" },
];

async function search(query) {
  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&page=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`TMDB ${res.status} for "${query}"`);
  const data = await res.json();
  return data.results ?? [];
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function bestMatch(results, title, type) {
  const tmdbType = type === 'tv' ? 'tv' : 'movie';
  const norm = normalize(title);

  // 1. Exact title + correct type
  let match = results.find(r => {
    const rTitle = r.title || r.name || '';
    return normalize(rTitle) === norm && r.media_type === tmdbType;
  });
  if (match) return match;

  // 2. Exact title, any type
  match = results.find(r => normalize(r.title || r.name || '') === norm);
  if (match) return match;

  // 3. First result of correct type
  match = results.find(r => r.media_type === tmdbType);
  if (match) return match;

  // 4. First result (movie or tv)
  return results.find(r => r.media_type === 'movie' || r.media_type === 'tv') ?? null;
}

const entries = [];
const skipped = [];

for (const { title, type } of TITLES) {
  try {
    const results = await search(title);
    const match = bestMatch(results, title, type);
    if (match) {
      const name = match.title || match.name || title;
      const mediaType = match.media_type === 'tv' ? 'tv' : 'movie';
      const year = (match.release_date || match.first_air_date || '').substring(0, 4);
      entries.push({ name, tmdbId: match.id, mediaType, backdropPath: match.backdrop_path || '' });
      console.log(`✓  [${match.id}] ${name} (${mediaType}, ${year || '?'})`);
    } else {
      skipped.push(title);
      console.log(`✗  No match: "${title}"`);
    }
  } catch (err) {
    skipped.push(title);
    console.error(`✗  Error for "${title}": ${err.message}`);
  }
  // small delay to be kind to the API
  await new Promise(r => setTimeout(r, 250));
}

fs.writeFileSync(OUT, JSON.stringify(entries, null, 4));
console.log(`\nWrote ${entries.length} entries to ${OUT}`);
if (skipped.length) console.log(`Skipped (no match): ${skipped.join(', ')}`);
