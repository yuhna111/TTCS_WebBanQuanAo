// ============================================================
// FILE: src/main.jsx
// MỤC ĐÍCH: Entry point của ứng dụng React.
// Bọc toàn bộ app bằng AuthProvider và CartProvider
// để mọi component con đều có thể dùng useAuth() và useCart().
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import App from "./App";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* AuthProvider bọc ngoài: quản lý đăng nhập */}
    <AuthProvider>
      {/* CartProvider bọc trong: CartContext có thể đọc AuthContext nếu cần */}
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);

// ============================================================
// LƯU Ý VỀ THỨ TỰ PROVIDER:
// AuthProvider bọc ngoài CartProvider vì trong tương lai,
// CartContext có thể cần đọc token từ AuthContext
// (ví dụ: tự động gọi API khi user đăng nhập).
// Nếu đảo ngược, CartContext sẽ không thể dùng useAuth().
// ============================================================
