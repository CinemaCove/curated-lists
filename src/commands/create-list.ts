import fs from 'fs';

import { input } from '@inquirer/prompts';
import { Command } from 'commander';

import { createList, addItemsToList } from '../services/tmdb';
import { MediaItem } from '../types';

export function createListCommand(program: Command): void {
    program
        .command('create-list <json-file>')
        .description('Create a new TMDB list and populate it from a JSON file')
        .option(
            '-t, --media-type <type>',
            'Default media type for items without one (movie|tv)',
            'movie'
        )
        .action(async (jsonFile: string, options: { mediaType: string }) => {
            const token = process.env.TMDB_USER_ACCESS_TOKEN;
            if (!token) {
                console.error(
                    'Error: TMDB_USER_ACCESS_TOKEN not set. Run `curated-lists login` first.'
                );
                process.exit(1);
            }

            let items: MediaItem[];
            try {
                const raw = fs.readFileSync(jsonFile, 'utf-8');
                items = JSON.parse(raw) as MediaItem[];
            } catch {
                console.error(`Error: could not read or parse JSON file: ${jsonFile}`);
                process.exit(1);
            }

            const name = await input({ message: 'List name:' });
            const description = await input({ message: 'List description:' });

            console.log('\nCreating list...');
            const listId = await createList(token, name, description);
            console.log(`List created  — ID: ${listId}`);

            const itemsWithType = items.map(item => ({
                ...item,
                mediaType: item.mediaType ?? (options.mediaType as 'movie' | 'tv'),
            }));

            console.log(`Adding ${items.length} item(s)...`);
            await addItemsToList(token, listId, itemsWithType);
            console.log(`Done! List ${listId} is ready with ${items.length} item(s).`);
        });
}
