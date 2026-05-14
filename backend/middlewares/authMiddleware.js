const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Truy cập bị từ chối! Bạn cần đăng nhập để thực hiện chức năng này.' 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'khoa_bi_mat_du_phong');
        

        req.user = decoded; 
        
        next(); 
    } catch (error) {
        console.error('Lỗi xác thực JWT:', error.message);
        return res.status(403).json({ 
            success: false, 
            message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn!' 
        });
    }
};

const roleMap = { 1: 'admin', 2: 'customer', 3: 'staff' };

exports.requireRole = (requiredRole) => {
    return (req, res, next) => {
        const userRole = req.user && (req.user.role || roleMap[req.user.role_id]);
        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: `Bạn không có quyền ${requiredRole} để thực hiện hành động này!`
            });
        }

        if (requiredRole === 'staff') {
            if (userRole === 'staff' || userRole === 'admin') {
                return next();
            }
        } else if (userRole === requiredRole) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Bạn không có quyền ${requiredRole} để thực hiện hành động này!`
        });
    };
};

exports.isAdmin = (req, res, next) => {
    const userRole = req.user && (req.user.role || roleMap[req.user.role_id]);
    if (userRole === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Bạn không có quyền quản trị để thực hiện hành động này!' 
        });
    }
};