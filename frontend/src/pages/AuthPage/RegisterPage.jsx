// ============================================================
// FILE: src/pages/AuthPage/RegisterPage.jsx
// MỤC ĐÍCH: Trang đăng ký tài khoản mới.
// Luồng:
//   1. User nhập thông tin → submit form
//   2. Gọi API POST /api/auth/register
//   3. Nếu thành công: hiện thông báo → chuyển sang trang đăng nhập
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/api";
import "./AuthPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  // --- LOCAL STATE ---
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "", // chỉ dùng phía client, không gửi lên backend
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- VALIDATION PHÍA CLIENT ---
    if (!formData.full_name.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Email không hợp lệ.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Gửi lên backend (không gửi confirmPassword)
      await registerUser({
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone_number: formData.phone_number.trim(),
        password: formData.password,
      });

      // Đăng ký thành công
      setSuccessMsg("Tạo tài khoản thành công! Đang chuyển hướng...");

      // Chờ 1.5 giây rồi chuyển sang trang đăng nhập
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      // Backend có thể báo "Email đã tồn tại" hoặc lỗi khác
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
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
            "Trang phục không thay đổi thế giới,<br />nhưng thay đổi người mặc nó."
          </blockquote>
          <cite>— Karl Lagerfeld</cite>
        </div>
      </div>

      {/* ---- CỘT PHẢI: Form đăng ký ---- */}
      <div className="auth-page__form-col">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className="auth-form__header">
            <h1 className="auth-form__title">Tạo tài khoản</h1>
            <p className="auth-form__subtitle">
              Đã có tài khoản?{" "}
              <Link to="/login">Đăng nhập</Link>
            </p>
          </div>

          <div className="auth-form__body">
            {error && <div className="msg-error">{error}</div>}
            {successMsg && <div className="msg-success">{successMsg}</div>}

            {/* Hàng: Họ tên + SĐT */}
            <div className="auth-form__row">
              <div className="form-group">
                <label htmlFor="full_name">Họ và tên</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.full_name}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone_number">Số điện thoại</label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="0912 345 678"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="ten@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-form__submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
