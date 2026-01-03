require('dotenv').config();

const app = require('./app');
const { connectDb } = require('./db');

const port = Number(process.env.PORT || 4000);

async function start() {
  try {
    const conn = await connectDb();
    const host = conn && typeof conn.host === 'string' ? conn.host : '';
    const name = conn && typeof conn.name === 'string' ? conn.name : '';
    const state = conn && typeof conn.readyState === 'number' ? conn.readyState : null;
    console.log(`MongoDB connected (readyState=${state}) ${host}${name ? `/${name}` : ''}`);

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

start();
