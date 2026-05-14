// ============================================================
// FILE: src/components/ProtectedRoute/ProtectedRoute.jsx
// MỤC ĐÍCH: Bảo vệ các trang cần đăng nhập hoặc phân quyền.
//
// Cách hoạt động:
//   - Nếu chưa đăng nhập → chuyển về /login
//   - Nếu đã đăng nhập nhưng không đúng role → chuyển về /
//   - Nếu hợp lệ → render component con bình thường
//
// Cách dùng trong App.jsx:
//   <Route path="/cart" element={
//     <ProtectedRoute><CartPage /></ProtectedRoute>
//   }/>
//
//   <Route path="/admin" element={
//     <ProtectedRoute requiredRole="staff"><AdminPage /></ProtectedRoute>
//   }/>
// ============================================================

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, isAdmin, isStaff } = useAuth();

  // BƯỚC 1: Kiểm tra đăng nhập
  if (!isLoggedIn) {
    // Chưa đăng nhập → đưa về trang login
    // replace: true để không lưu trang bị chặn vào lịch sử điều hướng
    return <Navigate to="/login" replace />;
  }

  // BƯỚC 2: Kiểm tra quyền (nếu route yêu cầu role cụ thể)
  if (requiredRole === "admin" && !isAdmin) {
    // Trang chỉ dành cho admin, nhưng user không phải admin
    return <Navigate to="/" replace />;
  }

  if (requiredRole === "staff" && !isStaff) {
    // Trang dành cho admin hoặc nhân viên
    return <Navigate to="/" replace />;
  }

  // BƯỚC 3: Hợp lệ → render nội dung
  return children;
}
