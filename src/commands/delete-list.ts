import { confirm, select } from '@inquirer/prompts';
import { Command } from 'commander';

import { deleteList, getAllLists } from '../services/tmdb';

export function deleteListCommand(program: Command): void {
    program
        .command('delete-list')
        .description('Select a TMDB list and delete it')
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
                message: 'Select a list to delete:',
                choices: lists.map(list => ({
                    name: `[${list.id}]  ${list.name}  (${list.item_count} items)`,
                    value: list,
                })),
            });

            const confirmed = await confirm({
                message: `Delete "${selectedList.name}" (ID: ${selectedList.id})?`,
                default: false,
            });

            if (!confirmed) {
                console.log('Aborted.');
                return;
            }

            await deleteList(token, selectedList.id);
            console.log(`Deleted "${selectedList.name}" (ID: ${selectedList.id}).`);
        });
}
