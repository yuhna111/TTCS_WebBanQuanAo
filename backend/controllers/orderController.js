const pool = require('../config/db');

exports.createOrder = async (req, res) => {
    const userId = req.user.user_id || req.user.id; 
    if (!userId) return res.status(400).json({ success: false, message: 'Lỗi Token!' }); 
    const { items, payment_method, shipping_address, points_used, voucher_id } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        let totalAmount = 0;
        let voucherDiscount = 0;
        let voucherInfo = null;

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Đơn hàng phải có ít nhất một sản phẩm.');
        }

        for (let item of items) {
            const [products] = await connection.query(
                'SELECT base_price, stock_quantity FROM Product WHERE product_id = ? FOR UPDATE',
                [item.product_id]
            );

            if (products.length === 0) throw new Error(`Sản phẩm ${item.product_id} không tồn tại!`);
            if (products[0].stock_quantity < item.quantity) throw new Error(`Sản phẩm ${item.product_id} không đủ số lượng!`);

            const unitPrice = item.unit_price != null
                ? parseFloat(item.unit_price)
                : parseFloat(products[0].base_price);

            if (isNaN(unitPrice) || unitPrice < 0) {
                throw new Error(`Giá sản phẩm không hợp lệ cho sản phẩm ${item.product_id}.`);
            }

            item.unit_price = unitPrice;
            totalAmount += unitPrice * parseInt(item.quantity, 10);
        }

        if (voucher_id) {
            const [vouchers] = await connection.query(
                'SELECT * FROM Voucher WHERE voucher_id = ? AND start_date <= NOW() AND end_date >= NOW()',
                [voucher_id]
            );

            if (vouchers.length === 0) {
                throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
            }

            voucherInfo = vouchers[0];

            if (totalAmount < voucherInfo.min_order_value) {
                throw new Error(`Mã giảm giá yêu cầu đơn tối thiểu ${voucherInfo.min_order_value}đ.`);
            }

            if (voucherInfo.discount_type === 'percent') {
                voucherDiscount = Math.floor((totalAmount * voucherInfo.discount_value) / 100);
            } else {
                voucherDiscount = Math.min(voucherInfo.discount_value, totalAmount);
            }
        }

        const pointsDiscount = (points_used || 0) * 1000;
        let discountAmount = voucherDiscount + pointsDiscount;
        if (discountAmount > totalAmount) discountAmount = totalAmount;

        let finalAmount = totalAmount - discountAmount;
        if (finalAmount < 0) finalAmount = 0;

        const [orderResult] = await connection.query(
            `INSERT INTO \`order\` (total_amount, shipping_address, status, payment_method, points_used, discount_amount, user_id, voucher_id, order_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [totalAmount, shipping_address, 'pending', payment_method, points_used || 0, discountAmount, userId, voucher_id || null]
        );
        const orderId = orderResult.insertId;

        for (let item of items) {
            await connection.query(
                'INSERT INTO order_detail (quantity, unit_price, order_id, product_id) VALUES (?, ?, ?, ?)',
                [item.quantity, item.unit_price, orderId, item.product_id]
            );
            await connection.query(
                'UPDATE Product SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
                [item.quantity, item.product_id]
            );
            await connection.query(
                'INSERT INTO Inventory_Log (transaction_type, quantity, reference_id, product_id, note, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                ['OUT', item.quantity, orderId, item.product_id, 'Xuất kho đặt hàng']
            );
        }

        if (voucherInfo) {
            await connection.query(
                'UPDATE Voucher SET used_count = COALESCE(used_count, 0) + 1 WHERE voucher_id = ?',
                [voucher_id]
            );
        }

        await connection.query(
            'INSERT INTO Payment (payment_method, amount, payment_status, order_id) VALUES (?, ?, ?, ?)',
            [payment_method, finalAmount, 'pending', orderId]
        );

        const pointsEarned = Math.floor(finalAmount / 10000);
        await connection.query(
            'UPDATE `user` SET reward_points = COALESCE(reward_points, 0) - ? + ? WHERE user_id = ?',
            [points_used || 0, pointsEarned, userId]
        );

        await connection.commit();
        res.status(201).json({ success: true, message: 'Đặt hàng thành công!', order_id: orderId });

    } catch (error) {
        await connection.rollback();
        console.error('Lỗi đặt hàng:', error);
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

exports.getOrderHistory = async (req, res) => {
    const userId = req.params.userId;
    try {
        const [orders] = await pool.query(`
    SELECT o.*, od.quantity, od.unit_price, p.product_name, p.color, p.size, p.image_url
    FROM \`order\` o
    JOIN order_detail od ON o.order_id = od.order_id
    JOIN Product p ON od.product_id = p.product_id
    WHERE o.user_id = ? ORDER BY o.order_date DESC
    `, [userId]);

    const groupedOrders = orders.reduce((acc, row) => {
        const order = acc.find((o) => o.order_id === row.order_id);
        if (!order) {
            const { order_detail_id, quantity, unit_price, product_name, color, size, image_url, ...orderFields } = row;
            acc.push({
                ...orderFields,
                shipping_fee: 30000,
                items: [{
                    order_detail_id: row.order_detail_id,
                    product_name: row.product_name,
                    color: row.color,
                    size: row.size,
                    quantity: row.quantity,
                    unit_price: row.unit_price,
                    image_url: row.image_url,
                }],
            });
        } else {
            order.items.push({
                order_detail_id: row.order_detail_id,
                product_name: row.product_name,
                color: row.color,
                size: row.size,
                quantity: row.quantity,
                unit_price: row.unit_price,
                image_url: row.image_url,
            });
        }
        return acc;
    }, []);
        res.status(200).json({ success: true, orders: groupedOrders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử đơn hàng' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const orderId = req.params.id;
    const { status, payment_status } = req.body; 
    const adminId = req.user.user_id || req.user.id; 

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let updateOrderQuery = 'UPDATE `order` SET status = ?, approved_by = ?';
        if (status === 'completed') updateOrderQuery += ', completed_at = NOW()';
        updateOrderQuery += ' WHERE order_id = ?';
        
        await connection.query(updateOrderQuery, [status, adminId, orderId]);

        if (payment_status) {
            await connection.query('UPDATE Payment SET payment_status = ? WHERE order_id = ?', [payment_status, orderId]);
        }

        await connection.commit();
        res.status(200).json({ success: true, message: `Đã cập nhật đơn hàng thành: ${status}` });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};