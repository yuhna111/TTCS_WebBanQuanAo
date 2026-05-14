const pool = require('../config/db');

exports.applyVoucher = async (req, res) => {
    const { voucher_code, order_total } = req.body; 

    try {
        const [vouchers] = await pool.query(
            'SELECT * FROM Voucher WHERE voucher_code = ? AND start_date <= NOW() AND end_date >= NOW()',
            [voucher_code]
        );

        if (vouchers.length === 0) {
            return res.status(400).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn!' });
        }

        const voucher = vouchers[0];
        if (order_total < voucher.min_order_value) {
            return res.status(400).json({ success: false, message: `Cần mua thêm để đạt tối thiểu ${voucher.min_order_value}đ` });
        }

        const [pendingOrders] = await pool.query(
            `SELECT COUNT(*) as so_luong_giam 
             FROM \`order\` 
             WHERE voucher_id = ? 
             AND status = 'pending' 
             AND order_date >= NOW() - INTERVAL 15 MINUTE`,
            [voucher.voucher_id]
        );

        const usedCount = voucher.used_count || 0;
        const tongDaChiemDung = usedCount + pendingOrders[0].so_luong_giam;

        if (tongDaChiemDung >= voucher.usage_limit) {
            return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng!' });
        }

        res.status(200).json({
            success: true,
            message: 'Áp dụng mã thành công! Bạn có 15 phút để hoàn tất thanh toán.',
            voucher: {
                voucher_id: voucher.voucher_id,
                voucher_code: voucher.voucher_code,
                discount_type: voucher.discount_type,
                discount_value: voucher.discount_value,
                min_order_value: voucher.min_order_value
            }
        });

    } catch (error) {
        console.error('Lỗi Voucher:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.createVoucher = async (req, res) => {
    const { 
        voucher_code, 
        discount_type, 
        discount_value, 
        min_order_value, 
        usage_limit, 
        start_date, 
        end_date 
    } = req.body;

    try {
        const [existing] = await pool.query('SELECT voucher_code FROM Voucher WHERE voucher_code = ?', [voucher_code]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Mã giảm giá này đã tồn tại trong hệ thống!' });
        }

        await pool.query(
            `INSERT INTO Voucher 
            (voucher_code, discount_type, discount_value, min_order_value, usage_limit, start_date, end_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [voucher_code, discount_type, discount_value, min_order_value || 0, usage_limit || 1, start_date, end_date]
        );

        res.status(201).json({ success: true, message: 'Tạo mã giảm giá mới thành công!' });

    } catch (error) {
        console.error('Lỗi khi tạo Voucher:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo Voucher mới' });
    }
};

exports.getAllVouchers = async (req, res) => {
    try {
        const [vouchers] = await pool.query('SELECT * FROM Voucher ORDER BY start_date DESC');
        res.status(200).json({ success: true, data: vouchers });
    } catch (error) {
        console.error('Lỗi lấy danh sách Voucher:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};