import 'dotenv/config';

import dns from 'dns';
import { Command } from 'commander';

// Node.js (c-ares) picks up 127.0.0.1 from WSL/Docker instead of the system
// DNS, which doesn't support SRV records needed for mongodb+srv:// URIs.
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { addToListCommand } from './commands/add-to-list';
import { createListCommand } from './commands/create-list';
import { deleteListCommand } from './commands/delete-list';
import { searchCommand } from './commands/search';
import { listsCommand } from './commands/lists';
import { loginCommand } from './commands/login';
import { publishCommand } from './commands/publish';
import { publishGroupCommand } from './commands/publish-group';

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
publishGroupCommand(program);
deleteListCommand(program);
searchCommand(program);

program.parseAsync().catch(err => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
