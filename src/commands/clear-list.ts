import { confirm, select } from '@inquirer/prompts';
import { Command } from 'commander';

import { getAllLists, getListItems, removeItemsFromList } from '../services/tmdb';

export function clearListCommand(program: Command): void {
    program
        .command('clear-list')
        .description('Remove all items from a TMDB list without deleting the list')
        .action(async () => {
            const token = process.env.TMDB_USER_ACCESS_TOKEN;
            const accountId = process.env.TMDB_ACCOUNT_ID;

            if (!token || !accountId) {
                console.error('Error: TMDB credentials not set. Run `curated-lists login` first.');
                process.exit(1);
            }

            console.log('Loading TMDB lists...');
            const lists = await getAllLists(token, accountId);

            if (lists.length === 0) {
                console.log('No lists found.');
                return;
            }

            const selectedList = await select({
                message: 'Select a list to clear:',
                choices: lists.map(list => ({
                    name: `[${list.id}]  ${list.name}  (${list.item_count} items)`,
                    value: list,
                })),
            });

            if (selectedList.item_count === 0) {
                console.log('List is already empty.');
                return;
            }

            const confirmed = await confirm({
                message: `Remove all ${selectedList.item_count} items from "${selectedList.name}"?`,
                default: false,
            });

            if (!confirmed) {
                console.log('Aborted.');
                return;
            }

            console.log('Fetching items...');
            const items = await getListItems(token, selectedList.id);

            console.log(`Removing ${items.length} items...`);
            await removeItemsFromList(token, selectedList.id, items);

            console.log(`Done! "${selectedList.name}" is now empty.`);
        });
}
