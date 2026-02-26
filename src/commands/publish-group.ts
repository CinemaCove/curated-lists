import { checkbox, input, confirm } from '@inquirer/prompts';
import { Command } from 'commander';

import { findGroupByName, getNextOrder, publishGroup } from '../services/mongodb';
import { getAllLists } from '../services/tmdb';
import { CuratedGroupList } from '../types';

export function publishGroupCommand(program: Command): void {
    program
        .command('publish-group')
        .description('Select TMDB lists and publish them as a group to MongoDB')
        .action(async () => {
            const token = process.env.TMDB_USER_ACCESS_TOKEN;
            const accountId = process.env.TMDB_ACCOUNT_ID;
            const mongoUri = process.env.MONGODB_URI;
            const dbName = process.env.MONGODB_DB_NAME ?? 'cinemacove';
            const collectionName = process.env.MONGODB_GROUPS_COLLECTION ?? 'curatedgroups';

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

            const selectedLists = await checkbox({
                message: 'Select lists for this group:',
                choices: lists.map(list => ({
                    name: `[${list.id}]  ${list.name}  (${list.item_count} items)`,
                    value: list,
                })),
                validate: val => val.length > 0 || 'Select at least one list',
            });

            const groupLists: CuratedGroupList[] = [];
            for (const list of selectedLists) {
                const unified = await confirm({
                    message: `Is "${list.name}" unified?`,
                    default: false,
                });
                groupLists.push({
                    name: list.name,
                    tmdbListId: String(list.id),
                    unified,
                });
            }

            const name = await input({
                message: 'Group name:',
            });

            const descriptionInput = await input({
                message: 'Description (leave blank to omit):',
                default: '',
            });

            const icon = await input({
                message: 'Material icon name:',
                default: 'movie_filter',
            });

            const imagePathInput = await input({
                message: 'Image path (leave blank to omit):',
                default: '',
            });

            const nextOrder = await getNextOrder(mongoUri, dbName, collectionName);

            const orderInput = await input({
                message: 'Order:',
                default: String(nextOrder),
                validate: val => {
                    const n = Number(val);
                    return Number.isFinite(n) || 'Must be a number';
                },
            });

            const record = {
                name,
                ...(descriptionInput ? { description: descriptionInput } : {}),
                icon,
                ...(imagePathInput ? { imagePath: imagePathInput } : {}),
                order: Number(orderInput),
                lists: [...groupLists].sort((a, b) => a.name.localeCompare(b.name)),
            };

            const exists = await findGroupByName(mongoUri, dbName, collectionName, name);
            if (exists) {
                const overwrite = await confirm({
                    message: `A group named "${name}" already exists. Overwrite it?`,
                    default: false,
                });
                if (!overwrite) {
                    console.log('Aborted.');
                    return;
                }
            }

            console.log('\nPublishing group to MongoDB...');
            await publishGroup(mongoUri, dbName, collectionName, record);

            console.log(`Done! Group "${name}" saved to ${dbName}.${collectionName}`);
        });
}
