const { db } = require('../database');

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

const createEmployee = async (payload) => {
  const { first_name, last_name, email, position, salary, hired_date } = payload;
  const { id } = await runQuery(
    `INSERT INTO employees (first_name, last_name, email, position, salary, hired_date)
     VALUES (?, ?, ?, ?, ?, COALESCE(?, date('now')))`,
    [first_name, last_name, email, position, salary, hired_date]
  );
  return getEmployeeById(id);
};

const getEmployees = async (filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.position) {
    conditions.push('position = ?');
    params.push(filters.position);
  }
  if (filters.search) {
    conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
    const like = `%${filters.search}%`;
    params.push(like, like, like);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return allQuery(`SELECT * FROM employees ${whereClause} ORDER BY id DESC`, params);
};

const getEmployeeById = async (id) => {
  return getQuery('SELECT * FROM employees WHERE id = ?', [id]);
};

const updateEmployee = async (id, payload) => {
  const fields = [];
  const params = [];

  ['first_name', 'last_name', 'email', 'position', 'salary', 'hired_date'].forEach((key) => {
    if (payload[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(payload[key]);
    }
  });

  if (!fields.length) {
    return getEmployeeById(id);
  }

  params.push(id);
  const { changes } = await runQuery(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, params);
  return changes ? getEmployeeById(id) : null;
};

const deleteEmployee = async (id) => {
  const { changes } = await runQuery('DELETE FROM employees WHERE id = ?', [id]);
  return changes > 0;
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
