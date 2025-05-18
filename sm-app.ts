import env from 'dotenv';
import server from './src/server';

env.config();

server().catch((e) => {
  console.error('error: ', e);
  process.exit(1);
});
