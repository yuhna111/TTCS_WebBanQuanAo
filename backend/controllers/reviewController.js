const pool = require('../config/db');

exports.createReview = async (req, res) => {
    const userId = req.user.user_id; 
    const { product_id, rating, comment } = req.body;

    try {
        const [hasPurchased] = await pool.query(
            `SELECT o.order_id 
             FROM \`order\` o 
             JOIN order_detail od ON o.order_id = od.order_id 
             WHERE o.user_id = ? 
               AND od.product_id = ? 
               AND o.status = 'completed'`,
            [userId, product_id]
        );

        if (hasPurchased.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn phải mua và nhận sản phẩm này thành công mới được phép đánh giá!' 
            });
        }

        const [existingReview] = await pool.query(
            'SELECT review_id FROM review WHERE user_id = ? AND product_id = ?',
            [userId, product_id]
        );

        if (existingReview.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bạn đã đánh giá sản phẩm này rồi!' 
            });
        }

        await pool.query(
            'INSERT INTO review (rating, comment, user_id, product_id, created_at) VALUES (?, ?, ?, ?, NOW())',
            [rating, comment, userId, product_id]
        );

        res.status(201).json({ success: true, message: 'Cảm ơn bạn đã đánh giá sản phẩm!' });

    } catch (error) {
        console.error('Lỗi khi viết đánh giá:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.getProductReviews = async (req, res) => {
    const productId = req.params.productId;

    try {
        const [reviews] = await pool.query(
            `SELECT r.review_id, r.rating, r.comment, r.created_at, u.full_name 
             FROM review r 
             JOIN user u ON r.user_id = u.user_id 
             WHERE r.product_id = ? 
             ORDER BY r.created_at DESC`,
            [productId]
        );

        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error('Lỗi lấy danh sách đánh giá:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};