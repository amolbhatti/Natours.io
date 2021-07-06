//uncaughtException handle
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! ✨ SHUTTING DOWN');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

// 1)  port
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`server is up and running at ${PORT} on this server   `);
});

//unhandledRejection handle
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT REJECTION! ✨ SHUTTING DOWN');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recieved! ✨✨✨. SHUTTING DOWN...');
  server.close(() => {
    console.log('✨✨✨ Process Terminated');
  });
});
