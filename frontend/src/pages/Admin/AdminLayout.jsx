// ============================================================
// FILE: src/pages/Admin/AdminLayout.jsx
// MỤC ĐÍCH: Layout dùng chung cho tất cả trang admin.
// ============================================================

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

const ADMIN_NAV = [
  { to: "/admin/orders",    icon: "◳", label: "Đơn hàng" },
  { to: "/admin/products",  icon: "◫", label: "Sản phẩm" },
  { to: "/admin/vouchers",  icon: "◇", label: "Voucher" },
  { to: "/admin/inventory", icon: "◱", label: "Nhật ký kho" },
];

export default function AdminLayout({ children }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__label">AvQ Admin</div>
        {ADMIN_NAV.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => "admin-nav-link" + (isActive ? " active" : "")}>
            <span className="admin-nav-link__icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <div style={{ marginTop:"auto", padding:"20px 20px 0", borderTop:"1px solid var(--color-gray-5)" }}>
          <div style={{ fontSize:12, color:"var(--color-gray-3)", marginBottom:4 }}>{user?.full_name}</div>
          <div style={{ fontSize:10, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--color-accent)", marginBottom:12 }}>
            {isAdmin ? "Admin" : "Nhân viên"}
          </div>
          <button className="admin-nav-link" onClick={handleLogout} style={{ padding:"8px 0", color:"var(--color-gray-4)" }}>
            ← Đăng xuất
          </button>
        </div>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
