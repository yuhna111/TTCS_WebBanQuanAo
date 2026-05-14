// FILE: src/components/Footer/Footer.jsx — cập nhật link trang hỗ trợ

import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__brand-name">Av<span>Q</span></div>
          <p className="footer__tagline">Không theo trend. Tự tạo trend.</p>
        </div>
        <div className="footer__col">
          <div className="footer__col-title">Mua sắm</div>
          <ul>
            <li><Link to="/products">Tất cả sản phẩm</Link></li>
            <li><Link to="/products?category=1">Hoodie</Link></li>
            <li><Link to="/products?category=2">Zip-up</Link></li>
            <li><Link to="/products?category=3">T-Shirt</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <div className="footer__col-title">Hỗ trợ</div>
          <ul>
            <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
            <li><Link to="/policy/return">Chính sách đổi trả</Link></li>
            <li><Link to="/policy/shipping">Chính sách vận chuyển</Link></li>
            <li><Link to="/policy/privacy">Chính sách bảo mật</Link></li>
            <li><Link to="/contact">Liên hệ</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <div className="footer__col-title">Tài khoản</div>
          <ul>
            <li><Link to="/login">Đăng nhập</Link></li>
            <li><Link to="/register">Đăng ký</Link></li>
            <li><Link to="/orders">Lịch sử đơn hàng</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <span className="footer__copy">© {new Date().getFullYear()} AvQ — Bảo lưu mọi quyền</span>
        <span className="footer__copy">Streetwear · Made in Vietnam</span>
      </div>
    </footer>
  );
}
