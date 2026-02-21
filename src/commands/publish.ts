import { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { getAllLists } from '../services/tmdb';
import { publishCuratedList } from '../services/mongodb';

export function publishCommand(program: Command): void {
    program
        .command('publish')
        .description('Select a TMDB list and publish it to MongoDB')
        .action(async () => {
            const token = process.env.TMDB_USER_ACCESS_TOKEN;
            const accountId = process.env.TMDB_ACCOUNT_ID;
            const mongoUri = process.env.MONGODB_URI;
            const dbName = process.env.MONGODB_DB_NAME ?? 'cinemacove';
            const collectionName = process.env.MONGODB_COLLECTION ?? 'curatedLists';

            if (!token || !accountId) {
                console.error('Error: TMDB credentials not set. Run `curated-lists login` first.');
                process.exit(1);
            }

            if (!mongoUri) {
                console.error('Error: MONGODB_URI not set in .env');
                process.exit(1);
            }

            console.log('Loading TMDB lists...');
            const lists = await getAllLists(token, accountId);

            if (lists.length === 0) {
                console.log('No lists found.');
                return;
            }

            const selectedList = await select({
                message: 'Select a list to publish:',
                choices: lists.map((list) => ({
                    name: `[${list.id}]  ${list.name}  (${list.item_count} items)`,
                    value: list,
                })),
            });

            const icon = await input({
                message: 'Material icon name:',
                default: 'movie_filter',
            });

            const orderInput = await input({
                message: 'Order:',
                default: '0',
                validate: (val) => {
                    const n = Number(val);
                    return Number.isFinite(n) || 'Must be a number';
                },
            });

            const imagePath = await input({
                message: 'Image path:',
            });

            const record = {
                tmdbListId: selectedList.id,
                name: selectedList.name,
                description: selectedList.description ?? '',
                icon,
                order: Number(orderInput),
                imagePath,
            };

            console.log('\nPublishing to MongoDB...');
            await publishCuratedList(mongoUri, dbName, collectionName, record);

            console.log(
                `Done! "${selectedList.name}" (ID: ${selectedList.id}) saved to ${dbName}.${collectionName}`,
            );
        });
}
