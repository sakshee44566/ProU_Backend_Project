const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require('../services/employeeService');

const buildError = (message, status = 400) => ({ message, status });

const requireFields = (body, fields) => {
  const missing = fields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ''
  );
  if (missing.length) {
    throw buildError(`Missing required fields: ${missing.join(', ')}`);
  }
};

const create = async (req, res, next) => {
  try {
    requireFields(req.body, ['first_name', 'last_name', 'email', 'position', 'salary']);
    const employee = await createEmployee(req.body);
    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const employees = await getEmployees(req.query);
    res.json(employees);
  } catch (err) {
    next(err);
  }
};

const retrieve = async (req, res, next) => {
  try {
    const employee = await getEmployeeById(req.params.id);
    if (!employee) {
      return next(buildError('Employee not found', 404));
    }
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const updated = await updateEmployee(req.params.id, req.body);
    if (!updated) {
      return next(buildError('Employee not found', 404));
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await deleteEmployee(req.params.id);
    if (!deleted) {
      return next(buildError('Employee not found', 404));
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  list,
  retrieve,
  update,
  remove,
};
