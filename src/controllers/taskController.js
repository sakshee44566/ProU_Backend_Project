const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../services/taskService');

const buildError = (message, status = 400) => ({ message, status });

const create = async (req, res, next) => {
  try {
    if (!req.body.title) {
      throw buildError('Missing required field: title');
    }
    const task = await createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const tasks = await getTasks(req.query);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

const retrieve = async (req, res, next) => {
  try {
    const task = await getTaskById(req.params.id);
    if (!task) {
      return next(buildError('Task not found', 404));
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const updated = await updateTask(req.params.id, req.body);
    if (!updated) {
      return next(buildError('Task not found', 404));
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await deleteTask(req.params.id);
    if (!deleted) {
      return next(buildError('Task not found', 404));
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
