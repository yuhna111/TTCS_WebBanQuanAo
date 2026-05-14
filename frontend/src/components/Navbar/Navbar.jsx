// ============================================================
// FILE: src/components/Navbar/Navbar.jsx
// MỤC ĐÍCH: Thanh điều hướng cố định trên cùng.
// - Hiện link khác nhau tùy role (customer vs admin)
// - Hiện badge số lượng giỏ hàng
// - Nút đăng nhập/đăng xuất
// ============================================================

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, isLoggedIn, isStaff, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  // Xử lý đăng xuất: xóa context → chuyển về trang chủ
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Thanh điều hướng chính">
      <div className="navbar__inner">

        {/* ---- LOGO ---- */}
        <NavLink to="/" className="navbar__logo">
          Av<span>Q</span>
        </NavLink>

        {/* ---- LINKS GIỮA ---- */}
        <div className="navbar__links">
          {/* Link cho khách hàng thông thường */}
          {!isStaff && (
            <>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " active" : "")
                }
              >
                Sản phẩm
              </NavLink>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " active" : "")
                }
              >
                Danh mục
              </NavLink>
            </>
          )}

          {/* Link dành riêng cho Admin/Staff */}
          {isStaff && (
            <>
              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " active" : "")
                }
              >
                Sản phẩm
              </NavLink>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " active" : "")
                }
              >
                Đơn hàng
              </NavLink>
              <NavLink
                to="/admin/vouchers"
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " active" : "")
                }
              >
                Voucher
              </NavLink>
            </>
          )}
        </div>

        {/* ---- ACTIONS PHẢI ---- */}
        <div className="navbar__actions">
          {/* Giỏ hàng — chỉ hiện với customer */}
          {isLoggedIn && !isStaff && (
            <NavLink to="/cart" className="navbar__cart" aria-label="Giỏ hàng">
              {/* Icon túi mua sắm bằng SVG inline */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {/* Badge số lượng — chỉ hiện khi > 0 */}
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </NavLink>
          )}

          {isLoggedIn ? (
            <>
              <div className="navbar__divider" />
              {/* Hiện tên user đang đăng nhập */}
              <span className="navbar__user">
                <strong>{user?.full_name?.split(" ").pop()}</strong>
                {/* Chỉ lấy tên cuối để gọn */}
              </span>
              <button className="navbar__logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              {/* Chưa đăng nhập → hiện nút đăng nhập/đăng ký */}
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " active" : "")
                }
              >
                Đăng nhập
              </NavLink>
              <NavLink to="/register" className="btn btn-primary" style={{ padding: "8px 18px", fontSize: "11px" }}>
                Đăng ký
              </NavLink>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
