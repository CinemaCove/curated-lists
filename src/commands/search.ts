import fs from 'fs';

import { input, select } from '@inquirer/prompts';
import { Command } from 'commander';

import { searchMedia } from '../services/tmdb';
import { MediaItem } from '../types';

interface EntryWithBackdrop extends MediaItem {
    backdropPath: string;
}

export function searchCommand(program: Command): void {
    program
        .command('search <json-file>')
        .description('Search TMDB and interactively append picks to a JSON file')
        .action(async (jsonFile: string) => {
            const token = process.env.TMDB_USER_ACCESS_TOKEN;
            if (!token) {
                console.error(
                    'Error: TMDB_USER_ACCESS_TOKEN not set. Run `curated-lists login` first.'
                );
                process.exit(1);
            }

            let entries: EntryWithBackdrop[] = [];
            if (fs.existsSync(jsonFile)) {
                try {
                    entries = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
                } catch {
                    console.error(`Error: could not parse ${jsonFile}`);
                    process.exit(1);
                }
            }

            console.log(
                `Appending to ${jsonFile} (${entries.length} existing entries). Empty query or Ctrl+C to exit.\n`
            );

            while (true) {
                let query: string;
                try {
                    query = await input({ message: 'Search:' });
                } catch {
                    break;
                }

                if (!query.trim()) break;

                let results;
                try {
                    results = await searchMedia(token, query);
                } catch (err) {
                    console.error('Search failed:', err instanceof Error ? err.message : err);
                    continue;
                }

                if (results.length === 0) {
                    console.log('No results.\n');
                    continue;
                }

                let chosen;
                try {
                    chosen = await select({
                        message: 'Select to add:',
                        choices: [
                            ...results.map(r => ({
                                name: `[${r.tmdbId}]  ${r.name}  (${r.mediaType})  ${r.releaseDate.substring(0, 4) || '?'}  ⭐ ${r.voteAverage.toFixed(1)}\n${r.overview.substring(0, 400)}\n`,
                                value: r,
                            })),
                            { name: '— Skip', value: null },
                        ],
                    });
                } catch {
                    break;
                }

                if (chosen) {
                    entries.push({
                        name: chosen.name,
                        tmdbId: chosen.tmdbId,
                        mediaType: chosen.mediaType,
                        backdropPath: chosen.backdropPath,
                    });
                    fs.writeFileSync(jsonFile, JSON.stringify(entries, null, 4));
                    console.log(`Added "${chosen.name}" → ${jsonFile} (${entries.length} total)\n`);
                }
            }

            console.log(`Done. ${jsonFile} has ${entries.length} entries.`);
        });
}
