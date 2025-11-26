require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./database');

const PORT = process.env.PORT || 3000;

initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
