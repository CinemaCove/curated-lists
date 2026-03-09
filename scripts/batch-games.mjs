import * as fs from 'fs';
import * as dns from 'dns';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

const TOKEN = process.env.TMDB_USER_ACCESS_TOKEN;

const films = [
  { year: 1986, title: 'Colorful Stage! The Movie: A Miku Who Can\'t Sing' },
  { year: 1988, title: 'Mirai Ninja' },
  { year: 1990, title: 'Tengai Makyō Jiraia Oboro Hen' },
  { year: 1991, title: 'Dragon Quest: Dai no Daibōken' },
  { year: 1991, title: 'Ninja Gaiden' },
  { year: 1992, title: 'Dragon Quest: Dai no Daibōken Buchiya bure!! Shinsei Rokudai Shoguo' },
  { year: 1992, title: 'Dragon Quest: Dai no Daibōken Tachiagare!! Aban no Shito' },
  { year: 1992, title: 'Fatal Fury: Legend of the Hungry Wolf' },
  { year: 1993, title: 'Art of Fighting' },
  { year: 1993, title: 'Fatal Fury 2: The New Battle' },
  { year: 1993, title: 'Super Mario Bros.' },
  { year: 1994, title: 'Double Dragon' },
  { year: 1994, title: 'Fatal Fury: The Motion Picture' },
  { year: 1994, title: 'Samurai Shodown: The Motion Picture' },
  { year: 1994, title: 'Street Fighter' },
  { year: 1995, title: 'Mortal Kombat' },
  { year: 1995, title: 'Mortal Kombat: The Journey Begins' },
  { year: 1996, title: 'Battle Arena Toshinden' },
  { year: 1996, title: 'Sonic the Hedgehog' },
  { year: 1997, title: 'Mortal Kombat Annihilation' },
  { year: 1997, title: 'Tokimeki Memorial' },
  { year: 1998, title: 'Voltage Fighters: Gowcaizer the Movie' },
  { year: 1999, title: 'Grand Theft Auto 2: The Movie' },
  { year: 1999, title: 'Samurai Spirits 2: Asura Zanmaden' },
  { year: 1999, title: 'Wing Commander' },
  { year: 2000, title: 'Street Fighter Alpha: The Animation' },
  { year: 2001, title: 'Lara Croft: Tomb Raider' },
  { year: 2001, title: 'Sakura Wars: The Movie' },
  { year: 2001, title: 'Zone of the Enders: 2167 Idolo' },
  { year: 2002, title: 'Resident Evil' },
  { year: 2002, title: 'Nakoruru: Ano Hito kara no Okurimono' },
  { year: 2003, title: 'House of the Dead' },
  { year: 2003, title: 'Lara Croft: Tomb Raider – The Cradle of Life' },
  { year: 2004, title: 'Resident Evil: Apocalypse' },
  { year: 2004, title: 'Galerians: Rion' },
  { year: 2005, title: 'Alone in the Dark' },
  { year: 2005, title: 'Doom' },
  { year: 2005, title: 'Final Fantasy VII: Advent Children' },
  { year: 2005, title: 'Last Order: Final Fantasy VII' },
  { year: 2005, title: 'Street Fighter Alpha: Generations' },
  { year: 2006, title: 'BloodRayne' },
  { year: 2006, title: 'DOA: Dead or Alive' },
  { year: 2006, title: 'Forbidden Siren' },
  { year: 2006, title: 'Silent Hill' },
  { year: 2006, title: 'Like a Dragon: Prologue' },
  { year: 2007, title: 'BloodRayne 2: Deliverance' },
  { year: 2007, title: 'Hitman' },
  { year: 2007, title: 'Postal' },
  { year: 2007, title: 'Resident Evil: Extinction' },
  { year: 2007, title: 'Heavenly Sword' },
  { year: 2007, title: 'Like a Dragon' },
  { year: 2008, title: 'Alone in the Dark II' },
  { year: 2008, title: 'Dead Space: Downfall' },
  { year: 2008, title: 'Far Cry' },
  { year: 2008, title: 'Max Payne' },
  { year: 2008, title: 'Resident Evil: Degeneration' },
  { year: 2008, title: 'OneChanbara' },
  { year: 2009, title: 'Street Fighter: The Legend of Chun-Li' },
  { year: 2009, title: 'The King of Fighters' },
  { year: 2009, title: 'Professor Layton and the Eternal Diva' },
  { year: 2009, title: 'Tales of Vesperia: The First Strike' },
  { year: 2009, title: 'Assassin\'s Creed: Lineage' },
  { year: 2010, title: 'Dante\'s Inferno: An Animated Epic' },
  { year: 2010, title: 'Halo Legends' },
  { year: 2010, title: 'Tekken' },
  { year: 2010, title: 'Resident Evil: Afterlife' },
  { year: 2010, title: 'Fate/stay night: Unlimited Blade Works' },
  { year: 2011, title: 'BloodRayne: The Third Reich' },
  { year: 2011, title: 'Dead Space: Aftermath' },
  { year: 2011, title: 'In the Name of the King 2: Two Worlds' },
  { year: 2011, title: 'Sengoku Basara: The Last Party' },
  { year: 2011, title: 'Tekken: Blood Vengeance' },
  { year: 2012, title: 'Ace Attorney' },
  { year: 2012, title: 'Dragon Age: Dawn of the Seeker' },
  { year: 2012, title: 'Halo 4: Forward Unto Dawn' },
  { year: 2012, title: 'Mass Effect: Paragon Lost' },
  { year: 2012, title: 'Resident Evil: Damnation' },
  { year: 2012, title: 'Resident Evil: Retribution' },
  { year: 2012, title: 'Silent Hill: Revelation' },
  { year: 2012, title: 'Ghost Recon: Alpha' },
  { year: 2013, title: 'Bayonetta: Bloody Fate' },
  { year: 2013, title: 'Company of Heroes' },
  { year: 2013, title: 'Moshi Monsters: The Movie' },
  { year: 2013, title: 'Persona 3 The Movie: No. 1, Spring of Birth' },
  { year: 2014, title: 'Batman: Assault on Arkham' },
  { year: 2014, title: 'Heavenly Sword' },
  { year: 2014, title: 'In the Name of the King 3: The Last Mission' },
  { year: 2014, title: 'Need for Speed' },
  { year: 2014, title: 'Persona 3 The Movie: No. 2, Midsummer Knight\'s Dream' },
  { year: 2014, title: 'Street Fighter: Assassin\'s Fist' },
  { year: 2014, title: 'Tekken 2: Kazuya\'s Revenge' },
  { year: 2015, title: 'Corpse Party' },
  { year: 2015, title: 'Dead Rising: Watchtower' },
  { year: 2015, title: 'Hitman: Agent 47' },
  { year: 2015, title: 'Persona 3 The Movie: No. 3, Falling Down' },
  { year: 2016, title: 'Assassin\'s Creed' },
  { year: 2016, title: 'Dead Rising: Endgame' },
  { year: 2016, title: 'Kingsglaive: Final Fantasy XV' },
  { year: 2016, title: 'Ratchet & Clank' },
  { year: 2016, title: 'The Angry Birds Movie' },
  { year: 2016, title: 'Warcraft' },
  { year: 2016, title: 'Persona 3 The Movie: No. 4, Winter of Rebirth' },
  { year: 2017, title: 'Resident Evil: The Final Chapter' },
  { year: 2017, title: 'Resident Evil: Vendetta' },
  { year: 2018, title: 'Rampage' },
  { year: 2018, title: 'Tomb Raider' },
  { year: 2018, title: 'It Came from the Desert' },
  { year: 2018, title: 'Papers, Please: The Short Film' },
  { year: 2019, title: 'Doom: Annihilation' },
  { year: 2019, title: 'Dragon Quest: Your Story' },
  { year: 2019, title: 'NiNoKuni' },
  { year: 2019, title: 'Pokémon Detective Pikachu' },
  { year: 2019, title: 'The Angry Birds Movie 2' },
  { year: 2019, title: 'Dead Trigger' },
  { year: 2019, title: 'Detention' },
  { year: 2020, title: 'Monster Hunter' },
  { year: 2020, title: 'Sonic the Hedgehog' },
  { year: 2020, title: 'Fate/stay night: Heaven\'s Feel III. spring song' },
  { year: 2021, title: 'Mortal Kombat' },
  { year: 2021, title: 'Resident Evil: Welcome to Raccoon City' },
  { year: 2021, title: 'Werewolves Within' },
  { year: 2021, title: 'Dynasty Warriors: Destiny of an Emperor' },
  { year: 2022, title: 'Sonic the Hedgehog 2' },
  { year: 2022, title: 'Uncharted' },
  { year: 2022, title: 'Injustice' },
  { year: 2022, title: 'Deemo: Memorial Keys' },
  { year: 2023, title: 'The Super Mario Bros. Movie' },
  { year: 2023, title: 'Resident Evil: Death Island' },
  { year: 2023, title: 'Five Nights at Freddy\'s' },
  { year: 2023, title: 'Mortal Kombat Legends: Cage Match' },
  { year: 2024, title: 'Borderlands' },
  { year: 2024, title: 'Exit 8' },
  { year: 2024, title: 'Sonic the Hedgehog 3' },
  { year: 2025, title: 'A Minecraft Movie' },
  { year: 2025, title: 'Until Dawn' },
  { year: 2025, title: 'Colorful Stage! The Movie: A Miku Who Can\'t Sing' },
  { year: 2025, title: 'Rabbids Invasion: Mission to Mars' },
];

async function searchMovie(title, year) {
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&year=${year}&page=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const data = await res.json();
  if (data.results && data.results.length > 0) return data.results[0];

  // Retry without year
  const url2 = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&page=1`;
  const res2 = await fetch(url2, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const data2 = await res2.json();
  return data2.results && data2.results.length > 0 ? data2.results[0] : null;
}

const entries = [];
const notFound = [];

for (const film of films) {
  const result = await searchMovie(film.title, film.year);
  if (result) {
    entries.push({
      name: result.title,
      tmdbId: result.id,
      mediaType: 'movie',
      backdropPath: result.backdrop_path || null,
    });
    console.log(`✓ ${result.title} (${result.id})`);
  } else {
    notFound.push(film.title);
    console.log(`✗ NOT FOUND: ${film.title} (${film.year})`);
  }
  await new Promise(r => setTimeout(r, 100));
}

const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../entries/curated-lists/entries_games.json');
fs.writeFileSync(outPath, JSON.stringify(entries, null, 4));

console.log(`\nDone! ${entries.length} entries saved to entries_games.json`);
if (notFound.length > 0) {
  console.log(`\nNot found (${notFound.length}):`);
  notFound.forEach(t => console.log(' -', t));
}
