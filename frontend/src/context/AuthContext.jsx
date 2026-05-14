// ============================================================
// FILE: src/context/AuthContext.jsx
// MỤC ĐÍCH: Quản lý trạng thái đăng nhập toàn cục cho toàn bộ app.
// Bất kỳ component nào cũng có thể đọc thông tin user, token, role
// mà không cần truyền props qua nhiều tầng (prop drilling).
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";

// -------------------------------------------------------
// BƯỚC 1: Tạo Context
// createContext() tạo ra một "kênh truyền dữ liệu" toàn cục.
// null là giá trị mặc định khi chưa có Provider bao bên ngoài.
// -------------------------------------------------------
const AuthContext = createContext(null);

// -------------------------------------------------------
// BƯỚC 2: Tạo Provider Component
// AuthProvider là component bao bọc toàn bộ app (trong main.jsx).
// Mọi component con bên trong đều có thể đọc dữ liệu từ đây.
// -------------------------------------------------------
export function AuthProvider({ children }) {
  // --- STATE ---
  // user: lưu thông tin người dùng (null = chưa đăng nhập)
  // Ví dụ: { user_id: 1, full_name: "Nguyen Van A", email: "a@mail.com" }
  const [user, setUser] = useState(null);

  // token: chuỗi JWT nhận được từ backend sau khi đăng nhập thành công
  // Dùng để gửi kèm trong header các request cần xác thực
  const [token, setToken] = useState(null);

  // role: vai trò của người dùng — "admin", "staff", hoặc "customer"
  // Dùng để phân quyền truy cập các trang (ví dụ: chỉ admin mới thấy trang quản lý)
  const [role, setRole] = useState(null);

  // -------------------------------------------------------
  // BƯỚC 3: Khôi phục phiên đăng nhập khi tải lại trang
  // useEffect chạy 1 lần khi component mount.
  // Nếu user đã đăng nhập trước đó, localStorage vẫn còn lưu token
  // → tự động set lại state để user không bị đăng xuất khi F5.
  // -------------------------------------------------------
  useEffect(() => {
    const savedToken = localStorage.getItem("avq_token");
    const savedUser = localStorage.getItem("avq_user");
    const savedRole = localStorage.getItem("avq_role");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser)); // parse vì localStorage lưu dạng string
      setRole(savedRole);
    }
  }, []); // [] = chỉ chạy 1 lần lúc khởi động

  // -------------------------------------------------------
  // BƯỚC 4: Hàm đăng nhập
  // Được gọi sau khi backend trả về dữ liệu thành công.
  // Nhận vào: userData (thông tin user), jwtToken (chuỗi JWT), userRole (vai trò)
  // -------------------------------------------------------
  const login = (userData, jwtToken, userRole) => {
    // Lưu vào state để UI cập nhật ngay lập tức
    setUser(userData);
    setToken(jwtToken);
    setRole(userRole);

    // Lưu vào localStorage để giữ phiên khi tải lại trang
    localStorage.setItem("avq_token", jwtToken);
    localStorage.setItem("avq_user", JSON.stringify(userData));
    localStorage.setItem("avq_role", userRole);
  };

  // -------------------------------------------------------
  // BƯỚC 5: Hàm đăng xuất
  // Xóa toàn bộ state và localStorage → app quay về trạng thái khách
  // -------------------------------------------------------
  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);

    localStorage.removeItem("avq_token");
    localStorage.removeItem("avq_user");
    localStorage.removeItem("avq_role");
  };

  // -------------------------------------------------------
  // BƯỚC 6: Các giá trị tiện ích
  // isLoggedIn: kiểm tra nhanh xem user đã đăng nhập chưa
  // isAdmin: true nếu là quản trị viên
  // isStaff: true nếu là nhân viên
  // -------------------------------------------------------
  const isLoggedIn = !!user; // !! chuyển object/null thành true/false
  const isAdmin = role === "admin";
  const isStaff = role === "staff" || role === "admin"; // admin cũng có quyền staff

  // -------------------------------------------------------
  // BƯỚC 7: Đưa tất cả dữ liệu và hàm vào value của Provider
  // Các component con gọi useAuth() sẽ nhận được object này
  // -------------------------------------------------------
  const value = {
    user,       // thông tin người dùng
    token,      // JWT token (gửi kèm API request)
    role,       // vai trò: "admin" | "staff" | "customer"
    isLoggedIn, // boolean: đã đăng nhập chưa
    isAdmin,    // boolean: có phải admin không
    isStaff,    // boolean: có phải nhân viên/admin không
    login,      // hàm đăng nhập
    logout,     // hàm đăng xuất
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// -------------------------------------------------------
// BƯỚC 8: Custom Hook useAuth()
// Thay vì gọi useContext(AuthContext) mỗi lần,
// ta bọc lại thành useAuth() cho gọn và dễ đọc hơn.
//
// Cách dùng trong component:
//   const { user, isLoggedIn, login, logout } = useAuth();
// -------------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);

  // Nếu useAuth() được gọi bên ngoài AuthProvider → báo lỗi rõ ràng
  if (!context) {
    throw new Error("useAuth() phải được dùng bên trong <AuthProvider>");
  }

  return context;
}

export default AuthContext;
