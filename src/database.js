const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : false,
});

const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      position TEXT NOT NULL,
      salary NUMERIC NOT NULL CHECK (salary >= 0),
      hired_date DATE NOT NULL DEFAULT CURRENT_DATE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      due_date DATE,
      employee_id INTEGER,
      FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    );
  `);
};

module.exports = {
  query: (...args) => pool.query(...args),
  initializeDatabase,
};
