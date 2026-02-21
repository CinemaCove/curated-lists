import 'dotenv/config';

import { Command } from 'commander';
import { loginCommand } from './commands/login';
import { createListCommand } from './commands/create-list';
import { addToListCommand } from './commands/add-to-list';
import { listsCommand } from './commands/lists';
import { publishCommand } from './commands/publish';

const program = new Command();

program
    .name('curated-lists')
    .description('CLI for managing TMDB curated lists for CinemaCove')
    .version('1.0.0');

loginCommand(program);
createListCommand(program);
addToListCommand(program);
listsCommand(program);
publishCommand(program);

program.parseAsync().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
