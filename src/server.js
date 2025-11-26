require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./database');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database', err);
    process.exit(1);
  }
};

start();
