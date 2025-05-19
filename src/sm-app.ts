import env from 'dotenv';
import server from './server';

env.config();

server().catch((e) => {
  console.error('error: ', e);
  process.exit(1);
});
