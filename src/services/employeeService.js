const { query } = require('../database');

const createEmployee = async (payload) => {
  const { first_name, last_name, email, position, salary, hired_date } = payload;
  const { rows } = await query(
    `INSERT INTO employees (first_name, last_name, email, position, salary, hired_date)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE))
     RETURNING *`,
    [first_name, last_name, email, position, salary, hired_date]
  );
  return rows[0];
};

const getEmployees = async (filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.position) {
    params.push(filters.position);
    conditions.push(`position = $${params.length}`);
  }

  if (filters.search) {
    const like = `%${filters.search}%`;
    params.push(like, like, like);
    const baseIndex = params.length - 2;
    conditions.push(
      `(first_name ILIKE $${baseIndex + 1} OR last_name ILIKE $${baseIndex + 2} OR email ILIKE $${baseIndex + 3})`
    );
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT * FROM employees ${whereClause} ORDER BY id DESC`,
    params
  );
  return rows;
};

const getEmployeeById = async (id) => {
  const { rows } = await query('SELECT * FROM employees WHERE id = $1', [id]);
  return rows[0];
};

const updateEmployee = async (id, payload) => {
  const fields = [];
  const params = [];

  ['first_name', 'last_name', 'email', 'position', 'salary', 'hired_date'].forEach((key) => {
    if (payload[key] !== undefined) {
      params.push(payload[key]);
      fields.push(`${key} = $${params.length}`);
    }
  });

  if (!fields.length) {
    return getEmployeeById(id);
  }

  params.push(id);
  const { rows } = await query(
    `UPDATE employees SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
};

const deleteEmployee = async (id) => {
  const res = await query('DELETE FROM employees WHERE id = $1', [id]);
  return res.rowCount > 0;
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
