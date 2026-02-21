import fs from 'fs';
import path from 'path';

import { input } from '@inquirer/prompts';
import { Command } from 'commander';

import { createRequestToken, createAccessToken } from '../services/tmdb';

export function loginCommand(program: Command): void {
    program
        .command('login')
        .description('Authenticate with TMDB and save credentials to .env')
        .action(async () => {
            const appToken = process.env.TMDB_API_READ_ACCESS_TOKEN;
            if (!appToken) {
                console.error('Error: TMDB_API_READ_ACCESS_TOKEN not set in .env');
                process.exit(1);
            }

            try {
                console.log('Creating TMDB request token...');
                const requestToken = await createRequestToken(appToken);

                const approvalUrl = `https://www.themoviedb.org/auth/access?request_token=${requestToken}`;
                console.log('\nOpen this URL in your browser and approve access:\n');
                console.log(`  ${approvalUrl}\n`);

                await input({ message: 'Press Enter once you have approved...' });

                console.log('Fetching user access token...');
                const { accessToken, accountId } = await createAccessToken(appToken, requestToken);

                const envPath = path.resolve(process.cwd(), '.env');
                let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
                envContent = setEnvVar(envContent, 'TMDB_USER_ACCESS_TOKEN', accessToken);
                envContent = setEnvVar(envContent, 'TMDB_ACCOUNT_ID', accountId);
                fs.writeFileSync(envPath, envContent);

                console.log(`\nSuccess! Credentials saved to .env`);
                console.log(`  Account ID : ${accountId}`);
            } catch (err) {
                console.error('Login failed:', err instanceof Error ? err.message : err);
                process.exit(1);
            }
        });
}

function setEnvVar(content: string, key: string, value: string): string {
    const line = `${key}=${value}`;
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
        return content.replace(regex, line);
    }
    const base = content.trimEnd();
    return base ? `${base}\n${line}\n` : `${line}\n`;
}
