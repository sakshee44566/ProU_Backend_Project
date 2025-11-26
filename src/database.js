const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbFilePath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbFilePath);
  }
});

const initializeDatabase = () => {
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    db.run(
      `CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        position TEXT NOT NULL,
        salary REAL NOT NULL CHECK(salary >= 0),
        hired_date TEXT NOT NULL DEFAULT (date('now'))
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        due_date TEXT,
        employee_id INTEGER,
        FOREIGN KEY (employee_id)
          REFERENCES employees(id)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      )`
    );
  });
};

module.exports = {
  db,
  initializeDatabase,
};
