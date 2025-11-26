const serverless = require('serverless-http');
const app = require('../src/app');
const { initializeDatabase } = require('../src/database');

let initialized = false;

const ensureDatabase = async () => {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
};

const serverlessHandler = serverless(app);

module.exports = async (req, res) => {
  await ensureDatabase();
  return serverlessHandler(req, res);
};

