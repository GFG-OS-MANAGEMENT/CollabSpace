const createApp = require('./app');
const env = require('./config/env');
const prisma = require('./lib/prisma');

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`CollabSpace API listening on http://localhost:${env.PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown(signal));
}
