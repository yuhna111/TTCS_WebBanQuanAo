const pool = require('../config/db');

exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM Category');
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error('Lỗi lấy danh mục:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.createCategory = async (req, res) => {
    const { category_name, description } = req.body;
    try {
        await pool.query(
            'INSERT INTO Category (category_name, description) VALUES (?, ?)',
            [category_name, description]
        );
        res.status(201).json({ success: true, message: 'Thêm danh mục thành công!' });
    } catch (error) {
        console.error('Lỗi thêm danh mục:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};