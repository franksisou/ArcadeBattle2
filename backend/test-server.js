const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Test server working' });
});

app.get('/test', (req, res) => {
  console.log('✅ Request received at /test');
  res.json({ test: true });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});

// Mantener el proceso vivo
setInterval(() => {
  console.log(`[${new Date().toLocaleTimeString()}] Server still running...`);
}, 5000);

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
