const express = require('express');
const controller = require('../controllers/taskController');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.retrieve);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
