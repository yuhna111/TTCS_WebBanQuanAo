const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/apply', authMiddleware.authenticateToken, voucherController.applyVoucher);
router.get('/', authMiddleware.authenticateToken, authMiddleware.requireRole('admin'), voucherController.getAllVouchers);
router.post('/', authMiddleware.authenticateToken, authMiddleware.requireRole('admin'), voucherController.createVoucher);

module.exports = router;