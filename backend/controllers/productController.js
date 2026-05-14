const pool = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.category_name 
            FROM Product p 
            LEFT JOIN Category c ON p.category_id = c.category_id
        `); 
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy sản phẩm' });
    }
};

exports.getProductById = async (req, res) => {
    const productId = req.params.id;
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.category_name 
            FROM Product p 
            LEFT JOIN Category c ON p.category_id = c.category_id 
            WHERE p.product_id = ?
        `, [productId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy sản phẩm' });
    }
};

exports.createProduct = async (req, res) => {
    const { product_name, product_description, base_price, color, size, stock_quantity, category_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;  
    const adminId = req.user.user_id || req.user.id;

    try {
        if (!image_url) {
            return res.status(400).json({ success: false, message: 'Vui lòng tải lên hình ảnh sản phẩm!' });
        }

        if (!category_id) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn danh mục sản phẩm!' });
        }

        // Kiểm tra category_id có tồn tại không
        const [categoryCheck] = await pool.query('SELECT category_id FROM Category WHERE category_id = ?', [category_id]);
        if (categoryCheck.length === 0) {
            return res.status(400).json({ success: false, message: 'Danh mục không tồn tại!' });
        }

        const [result] = await pool.query(
            `INSERT INTO Product 
            (product_name, product_description, base_price, color, size, stock_quantity, image_url, category_id, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [product_name, product_description, base_price, color, size, stock_quantity, image_url, category_id, adminId]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Thêm sản phẩm thành công!',
            product: {
                product_id: result.insertId,
                product_name,
                product_description,
                base_price,
                color,
                size,
                stock_quantity,
                image_url,
                category_id
            }
        });

    } catch (error) {
        console.error('Lỗi thêm sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ---- ADMIN APIs ----

exports.getAdminProducts = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.category_name 
            FROM Product p 
            LEFT JOIN Category c ON p.category_id = c.category_id 
            ORDER BY p.product_id DESC
        `);
        res.status(200).json({
            success: true,
            products: rows
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách sản phẩm (admin):', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { product_name, product_description, base_price, color, size, stock_quantity, category_id } = req.body;

    try {
        // Lấy sản phẩm hiện tại
        const [existingProduct] = await pool.query('SELECT * FROM Product WHERE product_id = ?', [id]);
        if (existingProduct.length === 0) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        // Chuẩn bị dữ liệu cập nhật
        const updates = [];
        const values = [];
        
        if (product_name) {
            updates.push('product_name = ?');
            values.push(product_name);
        }
        if (product_description !== undefined) {
            updates.push('product_description = ?');
            values.push(product_description);
        }
        if (base_price) {
            updates.push('base_price = ?');
            values.push(base_price);
        }
        if (color) {
            updates.push('color = ?');
            values.push(color);
        }
        if (size) {
            updates.push('size = ?');
            values.push(size);
        }
        if (stock_quantity !== undefined) {
            updates.push('stock_quantity = ?');
            values.push(stock_quantity);
        }
        if (category_id) {
            // Kiểm tra category_id có tồn tại không
            const [categoryCheck] = await pool.query('SELECT category_id FROM Category WHERE category_id = ?', [category_id]);
            if (categoryCheck.length === 0) {
                return res.status(400).json({ success: false, message: 'Danh mục không tồn tại!' });
            }
            updates.push('category_id = ?');
            values.push(category_id);
        }

        // Nếu có file ảnh mới
        if (req.file) {
            updates.push('image_url = ?');
            values.push(`/uploads/${req.file.filename}`);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có dữ liệu để cập nhật' });
        }

        // Thêm product_id vào cuối mảng values
        values.push(id);

        // Thực hiện UPDATE
        const updateQuery = `UPDATE Product SET ${updates.join(', ')} WHERE product_id = ?`;
        await pool.query(updateQuery, values);

        res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công'
        });
    } catch (error) {
        console.error('Lỗi cập nhật sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM Product WHERE product_id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        await pool.query('DELETE FROM Product WHERE product_id = ?', [id]);

        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error) {
        console.error('Lỗi xóa sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
