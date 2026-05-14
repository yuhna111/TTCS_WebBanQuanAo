const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', categoryController.getAllCategories);
router.post('/', authMiddleware.authenticateToken, authMiddleware.requireRole('admin'), categoryController.createCategory);

module.exports = router;