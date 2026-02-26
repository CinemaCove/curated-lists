import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.TMDB_USER_ACCESS_TOKEN;
if (!TOKEN) { console.error('TMDB_USER_ACCESS_TOKEN not set'); process.exit(1); }

const OUT_DIR = 'entries/directors';
fs.mkdirSync(OUT_DIR, { recursive: true });

// Directors: { name, slug, mergeWith? (for co-directors like Coens) }
const DIRECTORS = [
  { name: 'Alfred Hitchcock',      slug: 'hitchcock' },
  { name: 'Orson Welles',          slug: 'orson_welles' },
  { name: 'Stanley Kubrick',       slug: 'kubrick' },
  { name: 'Akira Kurosawa',        slug: 'kurosawa' },
  { name: 'Federico Fellini',      slug: 'fellini' },
  { name: 'Ingmar Bergman',        slug: 'bergman' },
  { name: 'Jean-Luc Godard',       slug: 'godard' },
  { name: 'Charlie Chaplin',       slug: 'chaplin' },
  { name: 'Billy Wilder',          slug: 'billy_wilder' },
  { name: 'Francis Ford Coppola',  slug: 'coppola' },
  { name: 'Martin Scorsese',       slug: 'scorsese' },
  { name: 'Woody Allen',           slug: 'woody_allen' },
  { name: 'Brian De Palma',        slug: 'de_palma' },
  { name: 'Steven Spielberg',      slug: 'spielberg' },
  { name: 'Ridley Scott',          slug: 'ridley_scott' },
  { name: 'James Cameron',         slug: 'james_cameron' },
  { name: 'Tim Burton',            slug: 'tim_burton' },
  { name: 'Robert Zemeckis',       slug: 'zemeckis' },
  { name: 'David Lynch',           slug: 'lynch' },
  { name: 'John Carpenter',        slug: 'john_carpenter' },
  { name: 'David Cronenberg',      slug: 'cronenberg' },
  { name: 'George Romero',         slug: 'romero' },
  { name: 'Sam Raimi',             slug: 'sam_raimi' },
  { name: 'Clint Eastwood',        slug: 'clint_eastwood' },
  { name: 'Paul Thomas Anderson',  slug: 'pta' },
  { name: 'Darren Aronofsky',      slug: 'aronofsky' },
  { name: 'Quentin Tarantino',     slug: 'tarantino' },
  { name: 'Christopher Nolan',     slug: 'nolan' },
  { name: 'Wes Anderson',          slug: 'wes_anderson' },
  { name: 'Peter Jackson',         slug: 'peter_jackson' },
  { name: 'Guillermo del Toro',    slug: 'del_toro' },
  { name: 'Denis Villeneuve',      slug: 'villeneuve' },
  { name: 'Michael Bay',           slug: 'michael_bay' },
  { name: 'J. J. Abrams',          slug: 'jj_abrams' },
  { name: 'James Gunn',            slug: 'james_gunn' },
  { name: 'Joel Coen',             slug: 'coen_brothers', mergeSlug: 'ethan_coen_merge' },
  { name: 'Ethan Coen',            slug: 'ethan_coen_merge', skip: true }, // merged into coen_brothers
  // ZAZ trio
  { name: 'Jerry Zucker',          slug: 'jerry_zucker' },
  { name: 'Jim Abrahams',          slug: 'jim_abrahams' },
  { name: 'David Zucker',          slug: 'david_zucker' },
];

async function searchPerson(name) {
  const url = `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(name)}&page=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Search failed ${res.status}`);
  const data = await res.json();
  // Sort by popularity descending to avoid picking placeholder entries
  const sorted = (data.results ?? []).sort((a, b) => b.popularity - a.popularity);
  return sorted[0] ?? null;
}

async function getCredits(personId) {
  const url = `https://api.themoviedb.org/3/person/${personId}/combined_credits`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Credits failed ${res.status}`);
  return await res.json();
}

function extractDirected(credits) {
  const movies = (credits.crew ?? [])
    .filter(c => c.media_type === 'movie' && c.job === 'Director' && c.release_date)
    .map(c => ({
      name: c.title || c.name || '',
      tmdbId: c.id,
      mediaType: 'movie',
      backdropPath: c.backdrop_path || '',
      _sort: c.release_date,
    }));

  // TV: deduplicate by show id, keep only where job = Director
  const tvMap = new Map();
  for (const c of (credits.crew ?? [])) {
    if (c.media_type === 'tv' && c.job === 'Director' && !tvMap.has(c.id)) {
      tvMap.set(c.id, {
        name: c.name || c.title || '',
        tmdbId: c.id,
        mediaType: 'tv',
        backdropPath: c.backdrop_path || '',
        _sort: c.first_air_date || '',
      });
    }
  }

  const all = [...movies, ...tvMap.values()];
  // deduplicate by tmdbId+mediaType
  const seen = new Set();
  const deduped = all.filter(item => {
    const key = `${item.mediaType}:${item.tmdbId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => (a._sort || '').localeCompare(b._sort || ''));
  return deduped.map(({ _sort, ...rest }) => rest);
}

// Handle Coen Brothers merge
async function getCoenBrothers() {
  const [joel, ethan] = await Promise.all([
    searchPerson('Joel Coen'),
    searchPerson('Ethan Coen'),
  ]);
  const [c1, c2] = await Promise.all([
    getCredits(joel.id),
    getCredits(ethan.id),
  ]);
  const combined = {
    crew: [...(c1.crew ?? []), ...(c2.crew ?? [])],
  };
  return extractDirected(combined);
}

for (const director of DIRECTORS) {
  if (director.skip) continue;

  const outFile = path.join(OUT_DIR, `entries_director_${director.slug}.json`);
  process.stdout.write(`${director.name}... `);

  try {
    let entries;

    if (director.slug === 'coen_brothers') {
      entries = await getCoenBrothers();
    } else {
      const person = await searchPerson(director.name);
      if (!person) {
        console.log('✗  Not found on TMDB');
        continue;
      }
      const credits = await getCredits(person.id);
      entries = extractDirected(credits);
    }

    fs.writeFileSync(outFile, JSON.stringify(entries, null, 4));
    console.log(`✓  ${entries.length} titles`);
  } catch (err) {
    console.log(`✗  ${err.message}`);
  }

  await new Promise(r => setTimeout(r, 400));
}

console.log('\nAll done.');
