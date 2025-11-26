const { db } = require('../database');

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function callback(err) {
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

const createTask = async (payload) => {
  const { title, description, status = 'pending', due_date, employee_id } = payload;
  const { id } = await runQuery(
    `INSERT INTO tasks (title, description, status, due_date, employee_id)
     VALUES (?, ?, ?, ?, ?)`,
    [title, description, status, due_date, employee_id]
  );
  return getTaskById(id);
};

const getTasks = async (filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters.employee_id) {
    conditions.push('employee_id = ?');
    params.push(filters.employee_id);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return allQuery(
    `SELECT t.*, e.first_name || ' ' || e.last_name AS assigned_to
     FROM tasks t
     LEFT JOIN employees e ON e.id = t.employee_id
     ${whereClause}
     ORDER BY t.id DESC`,
    params
  );
};

const getTaskById = async (id) => {
  return getQuery(
    `SELECT t.*, e.first_name || ' ' || e.last_name AS assigned_to
     FROM tasks t
     LEFT JOIN employees e ON e.id = t.employee_id
     WHERE t.id = ?`,
    [id]
  );
};

const updateTask = async (id, payload) => {
  const fields = [];
  const params = [];

  ['title', 'description', 'status', 'due_date', 'employee_id'].forEach((key) => {
    if (payload[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(payload[key]);
    }
  });

  if (!fields.length) {
    return getTaskById(id);
  }

  params.push(id);
  const { changes } = await runQuery(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, params);
  return changes ? getTaskById(id) : null;
};

const deleteTask = async (id) => {
  const { changes } = await runQuery('DELETE FROM tasks WHERE id = ?', [id]);
  return changes > 0;
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
