const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware.authenticateToken, orderController.createOrder);
router.get('/history/:userId', authMiddleware.authenticateToken, orderController.getOrderHistory);
router.put('/:id/status', authMiddleware.authenticateToken, authMiddleware.requireRole('admin'), orderController.updateOrderStatus);
module.exports = router;