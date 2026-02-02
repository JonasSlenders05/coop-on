import {
  MySqlContainer,
  type StartedMySqlContainer,
} from '@testcontainers/mysql';
import { execSync } from 'child_process';

declare global {
  var mySQLContainer: StartedMySqlContainer;
}

export default async () => {
  console.log('🚢 Pulling and starting MySQL container');
  const container = await new MySqlContainer('mysql:8.0').start();
  process.env.DATABASE_URL = container
    .getConnectionUri()
    .replace('localhost', '127.0.0.1');
  globalThis.mySQLContainer = container;

  console.log('✅ MySQL container started');

  console.log('⏳ Running migrations...');

  execSync('pnpm db:migrate', { stdio: 'pipe' });

  console.log('✅ Migrations completed!');
};
