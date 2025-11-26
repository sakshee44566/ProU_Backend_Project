const { query } = require('../database');

const createTask = async (payload) => {
  const { title, description, status = 'pending', due_date, employee_id } = payload;
  const { rows } = await query(
    `INSERT INTO tasks (title, description, status, due_date, employee_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, description, status, due_date, employee_id]
  );
  return rows[0];
};

const getTasks = async (filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  if (filters.employee_id) {
    params.push(filters.employee_id);
    conditions.push(`employee_id = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT t.*, CONCAT(e.first_name, ' ', e.last_name) AS assigned_to
     FROM tasks t
     LEFT JOIN employees e ON e.id = t.employee_id
     ${whereClause}
     ORDER BY t.id DESC`,
    params
  );
  return rows;
};

const getTaskById = async (id) => {
  const { rows } = await query(
    `SELECT t.*, CONCAT(e.first_name, ' ', e.last_name) AS assigned_to
     FROM tasks t
     LEFT JOIN employees e ON e.id = t.employee_id
     WHERE t.id = $1`,
    [id]
  );
  return rows[0];
};

const updateTask = async (id, payload) => {
  const fields = [];
  const params = [];

  ['title', 'description', 'status', 'due_date', 'employee_id'].forEach((key) => {
    if (payload[key] !== undefined) {
      params.push(payload[key]);
      fields.push(`${key} = $${params.length}`);
    }
  });

  if (!fields.length) {
    return getTaskById(id);
  }

  params.push(id);
  const { rows } = await query(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
};

const deleteTask = async (id) => {
  const res = await query('DELETE FROM tasks WHERE id = $1', [id]);
  return res.rowCount > 0;
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
