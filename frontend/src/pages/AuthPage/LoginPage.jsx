// ============================================================
// FILE: src/pages/AuthPage/LoginPage.jsx
// MỤC ĐÍCH: Trang đăng nhập.
// Luồng:
//   1. User nhập email + password → submit form
//   2. Gọi API POST /api/auth/login
//   3. Nếu thành công: lưu vào AuthContext (và localStorage qua hàm login())
//   4. Chuyển hướng về trang chủ hoặc trang admin tùy role
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/api";
import "./AuthPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // --- LOCAL STATE ---
  // Dữ liệu form
  const [formData, setFormData] = useState({ email: "", password: "" });
  // Trạng thái loading (disable nút submit khi đang gọi API)
  const [isLoading, setIsLoading] = useState(false);
  // Thông báo lỗi (nếu có)
  const [error, setError] = useState("");

  // Xử lý khi user gõ vào input
  // [e.target.name]: computed property — tự cập nhật đúng trường
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); // Xóa lỗi khi user bắt đầu gõ lại
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trang reload khi submit

    // Validation cơ bản phía client
    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    setError("");
   

    try {
      // Gọi API đăng nhập (hàm loginUser từ services/api.js)
      // Backend trả về: { token, user: {...}, role: "customer"|"admin"|"staff" }
      const data = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      // Lưu thông tin vào AuthContext + localStorage
      // (hàm login() trong AuthContext tự lo việc này)
      login(data.user, data.token, data.role);

      // Chuyển hướng tùy theo role
      if (data.role === "admin" || data.role === "staff") {
        navigate("/admin/products");
      } else {
        navigate("/"); // Customer về trang chủ
      }
    } catch (err) {
      // Hiện thông báo lỗi từ backend (ví dụ: "Sai mật khẩu")
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ---- CỘT TRÁI: Visual branding ---- */}
      <div className="auth-page__visual">
        <div className="auth-page__visual-logo">Av<span>Q</span></div>
        <div className="auth-page__visual-quote">
          <blockquote>
            "Phong cách là cách bạn nói với thế giới bạn là ai."
          </blockquote>
          <cite>— AvQ Fashion</cite>
        </div>
      </div>

      {/* ---- CỘT PHẢI: Form đăng nhập ---- */}
      <div className="auth-page__form-col">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className="auth-form__header">
            <h1 className="auth-form__title">Đăng nhập</h1>
            <p className="auth-form__subtitle">
              Chưa có tài khoản?{" "}
              <Link to="/register">Đăng ký ngay</Link>
            </p>
          </div>

          <div className="auth-form__body">
            {/* Hiện lỗi nếu có */}
            {error && <div className="msg-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"        // phải khớp với key trong formData
                type="email"
                placeholder="ten@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-form__submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
