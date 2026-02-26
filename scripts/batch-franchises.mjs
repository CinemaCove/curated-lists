import 'dotenv/config';
import fs from 'fs';

const TOKEN = process.env.TMDB_USER_ACCESS_TOKEN;

const FRANCHISES = {
  entries_halloween: [
    { title: "Halloween", type: "movie", year: 1978 },
    { title: "Halloween II", type: "movie", year: 1981 },
    { title: "Halloween III: Season of the Witch", type: "movie", year: 1982 },
    { title: "Halloween 4: The Return of Michael Myers", type: "movie", year: 1988 },
    { title: "Halloween 5: The Revenge of Michael Myers", type: "movie", year: 1989 },
    { title: "Halloween: The Curse of Michael Myers", type: "movie", year: 1995 },
    { title: "Halloween H20: 20 Years Later", type: "movie", year: 1998 },
    { title: "Halloween: Resurrection", type: "movie", year: 2002 },
    { title: "Halloween", type: "movie", year: 2007 },
    { title: "Halloween II", type: "movie", year: 2009 },
    { title: "Halloween", type: "movie", year: 2018 },
    { title: "Halloween Kills", type: "movie", year: 2021 },
    { title: "Halloween Ends", type: "movie", year: 2022 },
  ],
  entries_nightmare: [
    { title: "A Nightmare on Elm Street", type: "movie", year: 1984 },
    { title: "A Nightmare on Elm Street 2: Freddy's Revenge", type: "movie", year: 1985 },
    { title: "A Nightmare on Elm Street 3: Dream Warriors", type: "movie", year: 1987 },
    { title: "A Nightmare on Elm Street 4: The Dream Master", type: "movie", year: 1988 },
    { title: "A Nightmare on Elm Street 5: The Dream Child", type: "movie", year: 1989 },
    { title: "Freddy's Dead: The Final Nightmare", type: "movie", year: 1991 },
    { title: "Wes Craven's New Nightmare", type: "movie", year: 1994 },
    { title: "Freddy vs. Jason", type: "movie", year: 2003 },
    { title: "A Nightmare on Elm Street", type: "movie", year: 2010 },
  ],
  entries_friday13th: [
    { title: "Friday the 13th", type: "movie", year: 1980 },
    { title: "Friday the 13th Part 2", type: "movie", year: 1981 },
    { title: "Friday the 13th Part III", type: "movie", year: 1982 },
    { title: "Friday the 13th: The Final Chapter", type: "movie", year: 1984 },
    { title: "Friday the 13th: A New Beginning", type: "movie", year: 1985 },
    { title: "Friday the 13th Part VI: Jason Lives", type: "movie", year: 1986 },
    { title: "Friday the 13th Part VII: The New Blood", type: "movie", year: 1988 },
    { title: "Friday the 13th Part VIII: Jason Takes Manhattan", type: "movie", year: 1989 },
    { title: "Jason Goes to Hell: The Final Friday", type: "movie", year: 1993 },
    { title: "Jason X", type: "movie", year: 2001 },
    { title: "Freddy vs. Jason", type: "movie", year: 2003 },
    { title: "Friday the 13th", type: "movie", year: 2009 },
  ],
  entries_saw: [
    { title: "Saw", type: "movie", year: 2004 },
    { title: "Saw II", type: "movie", year: 2005 },
    { title: "Saw III", type: "movie", year: 2006 },
    { title: "Saw IV", type: "movie", year: 2007 },
    { title: "Saw V", type: "movie", year: 2008 },
    { title: "Saw VI", type: "movie", year: 2009 },
    { title: "Saw 3D", type: "movie", year: 2010 },
    { title: "Jigsaw", type: "movie", year: 2017 },
    { title: "Spiral: From the Book of Saw", type: "movie", year: 2021 },
    { title: "Saw X", type: "movie", year: 2023 },
  ],
  entries_scream: [
    { title: "Scream", type: "movie", year: 1996 },
    { title: "Scream 2", type: "movie", year: 1997 },
    { title: "Scream 3", type: "movie", year: 2000 },
    { title: "Scream 4", type: "movie", year: 2011 },
    { title: "Scream", type: "tv", year: 2015 },
    { title: "Scream", type: "movie", year: 2022 },
    { title: "Scream VI", type: "movie", year: 2023 },
  ],
  entries_alien: [
    { title: "Alien", type: "movie", year: 1979 },
    { title: "Aliens", type: "movie", year: 1986 },
    { title: "Alien 3", type: "movie", year: 1992 },
    { title: "Alien: Resurrection", type: "movie", year: 1997 },
    { title: "Alien vs. Predator", type: "movie", year: 2004 },
    { title: "Aliens vs. Predator: Requiem", type: "movie", year: 2007 },
    { title: "Prometheus", type: "movie", year: 2012 },
    { title: "Alien: Covenant", type: "movie", year: 2017 },
    { title: "Alien: Romulus", type: "movie", year: 2024 },
  ],
  entries_finaldestination: [
    { title: "Final Destination", type: "movie", year: 2000 },
    { title: "Final Destination 2", type: "movie", year: 2003 },
    { title: "Final Destination 3", type: "movie", year: 2006 },
    { title: "The Final Destination", type: "movie", year: 2009 },
    { title: "Final Destination 5", type: "movie", year: 2011 },
    { title: "Final Destination Bloodlines", type: "movie", year: 2025 },
  ],
  entries_romero_dead: [
    { title: "Night of the Living Dead", type: "movie", year: 1968 },
    { title: "Dawn of the Dead", type: "movie", year: 1978 },
    { title: "Day of the Dead", type: "movie", year: 1985 },
    { title: "Land of the Dead", type: "movie", year: 2005 },
    { title: "Diary of the Dead", type: "movie", year: 2007 },
    { title: "Survival of the Dead", type: "movie", year: 2009 },
  ],
  entries_predator: [
    { title: "Predator", type: "movie", year: 1987 },
    { title: "Predator 2", type: "movie", year: 1990 },
    { title: "Alien vs. Predator", type: "movie", year: 2004 },
    { title: "Aliens vs. Predator: Requiem", type: "movie", year: 2007 },
    { title: "Predators", type: "movie", year: 2010 },
    { title: "The Predator", type: "movie", year: 2018 },
    { title: "Prey", type: "movie", year: 2022 },
  ],
  entries_evildead: [
    { title: "The Evil Dead", type: "movie", year: 1981 },
    { title: "Evil Dead II", type: "movie", year: 1987 },
    { title: "Army of Darkness", type: "movie", year: 1992 },
    { title: "Evil Dead", type: "movie", year: 2013 },
    { title: "Ash vs Evil Dead", type: "tv", year: 2015 },
    { title: "Evil Dead Rise", type: "movie", year: 2023 },
  ],
  entries_hannibal: [
    { title: "Manhunter", type: "movie", year: 1986 },
    { title: "The Silence of the Lambs", type: "movie", year: 1991 },
    { title: "Hannibal", type: "movie", year: 2001 },
    { title: "Red Dragon", type: "movie", year: 2002 },
    { title: "Hannibal Rising", type: "movie", year: 2007 },
    { title: "Hannibal", type: "tv", year: 2013 },
  ],
  entries_walkingdead: [
    { title: "The Walking Dead", type: "tv", year: 2010 },
    { title: "Fear the Walking Dead", type: "tv", year: 2015 },
    { title: "The Walking Dead: World Beyond", type: "tv", year: 2020 },
    { title: "Tales of the Walking Dead", type: "tv", year: 2022 },
    { title: "The Walking Dead: Dead City", type: "tv", year: 2023 },
    { title: "The Walking Dead: Daryl Dixon", type: "tv", year: 2023 },
    { title: "The Walking Dead: The Ones Who Live", type: "tv", year: 2024 },
  ],
  entries_matrix: [
    { title: "The Matrix", type: "movie", year: 1999 },
    { title: "The Matrix Reloaded", type: "movie", year: 2003 },
    { title: "The Matrix Revolutions", type: "movie", year: 2003 },
    { title: "The Matrix Resurrections", type: "movie", year: 2021 },
  ],
  entries_meninblack: [
    { title: "Men in Black", type: "movie", year: 1997 },
    { title: "Men in Black II", type: "movie", year: 2002 },
    { title: "Men in Black 3", type: "movie", year: 2012 },
    { title: "Men in Black: International", type: "movie", year: 2019 },
  ],
  entries_avatar: [
    { title: "Avatar", type: "movie", year: 2009 },
    { title: "Avatar: The Way of Water", type: "movie", year: 2022 },
    { title: "Avatar: Fire and Ash", type: "movie", year: 2025 },
    { title: "Avatar 4", type: "movie", year: 2029 },
  ],
};

async function search(query) {
  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&page=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return (await res.json()).results ?? [];
}

function normalize(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

function bestMatch(results, title, type, year) {
  const tmdbType = type === 'tv' ? 'tv' : 'movie';
  const norm = normalize(title);
  const candidates = results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');

  let m = candidates.find(r => {
    const rYear = parseInt((r.release_date || r.first_air_date || '').substring(0, 4));
    return normalize(r.title || r.name || '') === norm && r.media_type === tmdbType && rYear === year;
  });
  if (m) return m;

  m = candidates.find(r => normalize(r.title || r.name || '') === norm && r.media_type === tmdbType);
  if (m) return m;

  m = candidates.find(r => {
    const rYear = parseInt((r.release_date || r.first_air_date || '').substring(0, 4));
    return normalize(r.title || r.name || '') === norm && rYear === year;
  });
  if (m) return m;

  const ofType = candidates.filter(r => r.media_type === tmdbType);
  if (ofType.length) {
    ofType.sort((a, b) => {
      const ay = Math.abs(parseInt((a.release_date || a.first_air_date || '0').substring(0, 4)) - year);
      const by = Math.abs(parseInt((b.release_date || b.first_air_date || '0').substring(0, 4)) - year);
      return ay - by;
    });
    return ofType[0];
  }
  return candidates[0] ?? null;
}

for (const [file, titles] of Object.entries(FRANCHISES)) {
  const out = `${file}.json`;
  console.log(`\n── ${out} ──`);
  const entries = [];
  const skipped = [];

  for (const { title, type, year } of titles) {
    try {
      const results = await search(title);
      const match = bestMatch(results, title, type, year);
      if (match) {
        const name = match.title || match.name || title;
        const mediaType = match.media_type === 'tv' ? 'tv' : 'movie';
        const matchYear = (match.release_date || match.first_air_date || '').substring(0, 4);
        entries.push({ name, tmdbId: match.id, mediaType, backdropPath: match.backdrop_path || '' });
        console.log(`  ✓  [${match.id}] ${name} (${mediaType}, ${matchYear})`);
      } else {
        skipped.push(`${title} (${year})`);
        console.log(`  ✗  No match: "${title}" (${year})`);
      }
    } catch (err) {
      skipped.push(`${title} (${year})`);
      console.error(`  ✗  Error for "${title}": ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  fs.writeFileSync(out, JSON.stringify(entries, null, 4));
  console.log(`  → ${entries.length} entries written${skipped.length ? ` | skipped: ${skipped.join(', ')}` : ''}`);
}

console.log('\nAll done.');
