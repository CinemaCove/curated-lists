import 'dotenv/config';
import fs from 'fs';

const TOKEN = process.env.TMDB_USER_ACCESS_TOKEN;
if (!TOKEN) { console.error('TMDB_USER_ACCESS_TOKEN not set'); process.exit(1); }

const BASE = 'https://api.themoviedb.org/4';

const LISTS = [
  { file: 'entries_lego.json',           name: 'LEGO',                         description: 'Every LEGO movie, series, and special — from Bionicle to The Lego Movie.' },
  { file: 'entries_batman.json',         name: 'Batman',                        description: 'The Dark Knight across every screen, from 1943 to today.' },
  { file: 'entries_spiderman.json',      name: 'Spider-Man',                    description: 'Your friendly neighborhood Spider-Man in every film and series.' },
  { file: 'entries_tmnt.json',           name: 'Teenage Mutant Ninja Turtles',  description: 'Heroes in a half shell — every TMNT film and series.' },
  { file: 'entries_dragonball.json',     name: 'Dragon Ball',                   description: "Goku's complete journey from Dragon Ball to Super and beyond." },
  { file: 'entries_conjuring.json',      name: 'The Conjuring Universe',        description: "Ed and Lorraine Warren's paranormal investigations and every spin-off." },
  { file: 'entries_insidious.json',      name: 'Insidious',                     description: 'The Further is closer than you think.' },
  { file: 'entries_halloween.json',      name: 'Halloween',                     description: 'Michael Myers and the complete Halloween franchise across all timelines.' },
  { file: 'entries_nightmare.json',      name: 'A Nightmare on Elm Street',     description: "Freddy Krueger's reign of terror across every dream." },
  { file: 'entries_friday13th.json',     name: 'Friday the 13th',               description: 'Jason Voorhees and the Camp Crystal Lake legacy.' },
  { file: 'entries_saw.json',            name: 'Saw',                           description: "The Jigsaw Killer's twisted games, from the original to Saw X." },
  { file: 'entries_scream.json',         name: 'Scream',                        description: 'Ghostface and the Woodsboro murders — every film and the TV series.' },
  { file: 'entries_alien.json',          name: 'Alien',                         description: 'Xenomorphs, androids, and deep space horror across the full saga.' },
  { file: 'entries_finaldestination.json', name: 'Final Destination',           description: "Death's design can't be cheated. The complete Final Destination franchise." },
  { file: 'entries_romero_dead.json',    name: "George Romero's Dead",          description: 'The godfather of zombie cinema — six films that defined the genre.' },
  { file: 'entries_predator.json',       name: 'Predator',                      description: "The galaxy's greatest hunter, from the jungle to Prey." },
  { file: 'entries_evildead.json',       name: 'Evil Dead',                     description: 'Deadites, the Necronomicon, and Ash Williams — the complete Evil Dead saga.' },
  { file: 'entries_hannibal.json',       name: 'Hannibal Lecter',               description: 'The complete Dr. Hannibal Lecter saga — films and the TV series.' },
  { file: 'entries_walkingdead.json',    name: 'The Walking Dead Universe',     description: "AMC's post-apocalyptic world — every series in the Walking Dead franchise." },
  { file: 'entries_matrix.json',         name: 'The Matrix',                    description: 'Follow the white rabbit. The complete Matrix saga.' },
  { file: 'entries_meninblack.json',     name: 'Men in Black',                  description: 'The secret agency keeping Earth safe from aliens — every film.' },
  { file: 'entries_avatar.json',         name: 'Avatar',                        description: "James Cameron's epic journey to Pandora." },
];

async function createList(name, description) {
  const res = await fetch(`${BASE}/list`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, iso_639_1: 'en', iso_3166_1: 'US', public: true }),
  });
  if (!res.ok) throw new Error(`Create list failed ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.id;
}

async function addItems(listId, items) {
  const body = {
    items: items.map(item => ({
      media_type: item.mediaType === 'tv' ? 'tv' : 'movie',
      media_id: item.tmdbId,
    })),
  };
  const res = await fetch(`${BASE}/list/${listId}/items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Add items failed ${res.status}: ${await res.text()}`);
}

for (const { file, name, description } of LISTS) {
  if (!fs.existsSync(file)) {
    console.log(`⚠  Skipping ${file} (not found)`);
    continue;
  }

  const items = JSON.parse(fs.readFileSync(file, 'utf-8'));
  process.stdout.write(`Creating "${name}" (${items.length} items)... `);

  try {
    const listId = await createList(name, description);
    await addItems(listId, items);
    console.log(`✓  ID: ${listId}`);
  } catch (err) {
    console.log(`✗  ${err.message}`);
  }

  await new Promise(r => setTimeout(r, 500));
}

console.log('\nAll done.');
