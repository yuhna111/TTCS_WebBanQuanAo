const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { full_name, email, password, phone_number } = req.body;

    try {
        const [existingUser] = await pool.query('SELECT * FROM `user` WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'Email này đã được sử dụng!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query(
            'INSERT INTO `user` (full_name, email, password, phone_number, created_at) VALUES (?, ?, ?, ?, CURDATE())',
            [full_name, email, hashedPassword, phone_number]
        );

        res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
    } catch (error) {
        console.error('❌ Lỗi đăng ký:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM `user` WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng!' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng!' });
        }

        const roleMap = { 1: "admin", 2: "customer", 3: "staff" };
        const userRole = roleMap[user.role_id] || "customer";

        const token = jwt.sign(
            { user_id: user.user_id, role_id: user.role_id, role: userRole },
            process.env.JWT_SECRET || 'khoa_bi_mat_du_phong', 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            token: token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                reward_points: user.reward_points
            },
            role: userRole
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi đăng nhập' });
    }
};