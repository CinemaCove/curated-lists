import { Command } from 'commander';
import fs from 'fs';
import { addItemsToList } from '../services/tmdb';
import { MediaItem } from '../types';

export function addToListCommand(program: Command): void {
    program
        .command('add-to-list <list-id> <json-file>')
        .description('Add items from a JSON file to an existing TMDB list')
        .option('-t, --media-type <type>', 'Default media type for items without one (movie|tv)', 'movie')
        .action(async (listIdStr: string, jsonFile: string, options: { mediaType: string }) => {
            const token = process.env.TMDB_USER_ACCESS_TOKEN;
            if (!token) {
                console.error('Error: TMDB_USER_ACCESS_TOKEN not set. Run `curated-lists login` first.');
                process.exit(1);
            }

            const listId = parseInt(listIdStr, 10);
            if (isNaN(listId)) {
                console.error('Error: list-id must be a number');
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

            const itemsWithType = items.map((item) => ({
                ...item,
                mediaType: item.mediaType ?? (options.mediaType as 'movie' | 'tv'),
            }));

            console.log(`Adding ${items.length} item(s) to list ${listId}...`);
            await addItemsToList(token, listId, itemsWithType);
            console.log(`Done! Added ${items.length} item(s) to list ${listId}.`);
        });
}
