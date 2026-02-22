import { Command } from 'commander';

import { getAllLists } from '../services/tmdb';

export function listsCommand(program: Command): void {
    program
        .command('lists')
        .description('Display all your TMDB lists (loads all pages)')
        .action(async () => {
            const token = process.env.TMDB_USER_ACCESS_TOKEN;
            const accountId = process.env.TMDB_ACCOUNT_ID;

            if (!token || !accountId) {
                console.error('Error: TMDB credentials not set. Run `curated-lists login` first.');
                process.exit(1);
            }

            console.log('Loading lists...');
            const lists = await getAllLists(token, accountId);

            if (lists.length === 0) {
                console.log('No lists found.');
                return;
            }

            console.log(`\nFound ${lists.length} list(s):\n`);

            const COL_ID = 10;
            const COL_NAME = 42;
            const COL_ITEMS = 8;

            const header =
                'ID'.padEnd(COL_ID) +
                'Name'.padEnd(COL_NAME) +
                'Items'.padEnd(COL_ITEMS) +
                'Description';

            console.log(header);
            console.log('─'.repeat(header.length + 20));

            for (const list of lists) {
                const desc = (list.description ?? '').replace(/\n/g, ' ');
                console.log(
                    String(list.id).padEnd(COL_ID) +
                        list.name.substring(0, COL_NAME - 2).padEnd(COL_NAME) +
                        String(list.item_count).padEnd(COL_ITEMS) +
                        desc.substring(0, 50)
                );
            }
        });
}
