const pool = require('../config/db');

const VOUCHER_TABLE = '`voucher`';

function normalizeVoucherPayload(body) {
    const voucher_code = String(body.voucher_code || '').trim().toUpperCase();
    const discount_type = String(body.discount_type || '').trim();
    const discount_value = Number(body.discount_value);
    const min_order_value = Number(body.min_order_value || 0);
    const usage_limit = Number(body.usage_limit || 1);
    const start_date = body.start_date;
    const end_date = body.end_date;

    return {
        voucher_code,
        discount_type,
        discount_value,
        min_order_value,
        usage_limit,
        start_date,
        end_date,
    };
}

function validateVoucher(data) {
    if (!data.voucher_code) return 'Vui lòng nhập mã voucher.';
    if (!['percent', 'fixed'].includes(data.discount_type)) return 'Loại giảm giá không hợp lệ.';
    if (!Number.isFinite(data.discount_value) || data.discount_value <= 0) return 'Giá trị giảm phải lớn hơn 0.';
    if (data.discount_type === 'percent' && data.discount_value > 100) return 'Voucher phần trăm không được vượt quá 100%.';
    if (!Number.isFinite(data.min_order_value) || data.min_order_value < 0) return 'Giá trị đơn tối thiểu không hợp lệ.';
    if (!Number.isInteger(data.usage_limit) || data.usage_limit < 1) return 'Số lượt sử dụng phải là số nguyên lớn hơn 0.';
    if (!data.start_date || !data.end_date) return 'Vui lòng chọn ngày bắt đầu và ngày kết thúc.';
    if (new Date(data.start_date) >= new Date(data.end_date)) return 'Ngày kết thúc phải sau ngày bắt đầu.';
    return null;
}

async function getVoucherById(voucherId) {
    const [rows] = await pool.query(
        `SELECT * FROM ${VOUCHER_TABLE} WHERE voucher_id = ?`,
        [voucherId]
    );
    return rows[0] || null;
}

exports.applyVoucher = async (req, res) => {
    const { voucher_code, order_total } = req.body;

    try {
        const [vouchers] = await pool.query(
            `SELECT * FROM ${VOUCHER_TABLE} 
             WHERE voucher_code = ? 
             AND start_date <= NOW() 
             AND end_date >= NOW()`,
            [String(voucher_code || '').trim().toUpperCase()]
        );

        if (vouchers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã giảm giá không tồn tại hoặc đã hết hạn!'
            });
        }

        const voucher = vouchers[0];

        if (Number(order_total) < Number(voucher.min_order_value || 0)) {
            return res.status(400).json({
                success: false,
                message: `Cần mua thêm để đạt tối thiểu ${voucher.min_order_value}đ`
            });
        }

        const [pendingOrders] = await pool.query(
            `SELECT COUNT(*) as so_luong_giam
             FROM \`order\`
             WHERE voucher_id = ?
             AND status = 'pending'
             AND order_date >= NOW() - INTERVAL 15 MINUTE`,
            [voucher.voucher_id]
        );

        const usedCount = Number(voucher.used_count || 0);
        const reservedCount = Number(pendingOrders[0].so_luong_giam || 0);

        if (usedCount + reservedCount >= Number(voucher.usage_limit || 0)) {
            return res.status(400).json({
                success: false,
                message: 'Mã giảm giá đã hết lượt sử dụng!'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Áp dụng mã thành công!',
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

exports.getAllVouchers = async (req, res) => {
    try {
        const [vouchers] = await pool.query(
            `SELECT * FROM ${VOUCHER_TABLE} 
             ORDER BY start_date DESC, voucher_id DESC`
        );

        res.status(200).json({
            success: true,
            data: vouchers
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách Voucher:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách voucher'
        });
    }
};

exports.createVoucher = async (req, res) => {
    const data = normalizeVoucherPayload(req.body);
    const validationError = validateVoucher(data);

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    try {
        const [existing] = await pool.query(
            `SELECT voucher_id FROM ${VOUCHER_TABLE} WHERE voucher_code = ?`,
            [data.voucher_code]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã giảm giá này đã tồn tại trong hệ thống!'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO ${VOUCHER_TABLE}
            (voucher_code, discount_type, discount_value, min_order_value, usage_limit, used_count, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
            [
                data.voucher_code,
                data.discount_type,
                data.discount_value,
                data.min_order_value,
                data.usage_limit,
                data.start_date,
                data.end_date,
            ]
        );

        const voucher = await getVoucherById(result.insertId);

        res.status(201).json({
            success: true,
            message: 'Tạo voucher thành công!',
            voucher
        });

    } catch (error) {
        console.error('Lỗi khi tạo Voucher:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo voucher mới'
        });
    }
};

exports.updateVoucher = async (req, res) => {
    const voucherId = Number(req.params.id);
    const data = normalizeVoucherPayload(req.body);
    const validationError = validateVoucher(data);

    if (!Number.isInteger(voucherId) || voucherId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'ID voucher không hợp lệ.'
        });
    }

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    try {
        const currentVoucher = await getVoucherById(voucherId);

        if (!currentVoucher) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy voucher cần sửa.'
            });
        }

        const [existing] = await pool.query(
            `SELECT voucher_id FROM ${VOUCHER_TABLE} 
             WHERE voucher_code = ? AND voucher_id <> ?`,
            [data.voucher_code, voucherId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã voucher đã tồn tại, vui lòng chọn mã khác.'
            });
        }

        if (Number(currentVoucher.used_count || 0) > data.usage_limit) {
            return res.status(400).json({
                success: false,
                message: `Số lượt giới hạn không được nhỏ hơn số lượt đã dùng (${currentVoucher.used_count}).`
            });
        }

        await pool.query(
            `UPDATE ${VOUCHER_TABLE}
             SET voucher_code = ?, 
                 discount_type = ?, 
                 discount_value = ?, 
                 min_order_value = ?, 
                 usage_limit = ?, 
                 start_date = ?, 
                 end_date = ?
             WHERE voucher_id = ?`,
            [
                data.voucher_code,
                data.discount_type,
                data.discount_value,
                data.min_order_value,
                data.usage_limit,
                data.start_date,
                data.end_date,
                voucherId,
            ]
        );

        const voucher = await getVoucherById(voucherId);

        res.status(200).json({
            success: true,
            message: 'Cập nhật voucher thành công!',
            voucher
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật Voucher:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật voucher'
        });
    }
};

exports.deleteVoucher = async (req, res) => {
    const voucherId = Number(req.params.id);

    if (!Number.isInteger(voucherId) || voucherId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'ID voucher không hợp lệ.'
        });
    }

    try {
        const currentVoucher = await getVoucherById(voucherId);

        if (!currentVoucher) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy voucher cần xóa.'
            });
        }

        await pool.query(
            `DELETE FROM ${VOUCHER_TABLE} WHERE voucher_id = ?`,
            [voucherId]
        );

        res.status(200).json({
            success: true,
            message: 'Xóa voucher thành công!'
        });

    } catch (error) {
        console.error('Lỗi khi xóa Voucher:', error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(400).json({
                success: false,
                message: 'Voucher này đã được dùng trong đơn hàng nên không thể xóa. Bạn có thể sửa ngày kết thúc để ngừng sử dụng.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa voucher'
        });
    }
};