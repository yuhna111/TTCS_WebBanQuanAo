const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:productId', reviewController.getProductReviews);
router.post('/', authMiddleware.authenticateToken, reviewController.createReview);

module.exports = router;