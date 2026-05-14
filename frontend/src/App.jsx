// ============================================================
// FILE: src/App.jsx
// MỤC ĐÍCH: Định nghĩa toàn bộ hệ thống điều hướng của app.
// Sử dụng react-router-dom v6.
//
// CẤU TRÚC ROUTE:
//   / (public)        → Trang chủ (tất cả đều xem được)
//   /products         → Danh sách sản phẩm (public)
//   /products/:id     → Chi tiết sản phẩm (public)
//   /login            → Đăng nhập
//   /register         → Đăng ký
//   /cart             → Giỏ hàng (cần đăng nhập)
//   /checkout         → Thanh toán (cần đăng nhập)
//   /orders           → Lịch sử đơn hàng (cần đăng nhập)
//   /admin/*          → Khu vực quản trị (cần role staff/admin)
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Components layout
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// ---- TRANG KHÁCH HÀNG ----
import LoginPage from "./pages/AuthPage/LoginPage";
import RegisterPage from "./pages/AuthPage/RegisterPage";
import HomePage from "./pages/HomePage/HomePage";
import CategoriesPage from "./pages/CategoriesPage/CategoriesPage";
import ProductsPage from "./pages/ProductsPage/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage/ProductDetailPage";
import CartPage from "./pages/CartPage/CartPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import OrdersPage from "./pages/OrdersPage/OrdersPage";
import AdminOrdersPage from "./pages/Admin/AdminOrdersPage";
import AdminInventoryPage from "./pages/Admin/AdminInventoryPage";
import AdminProductsPage from "./pages/Admin/AdminProductsPage";
import { ReturnPolicyPage, ShippingPolicyPage, PrivacyPolicyPage } from "./pages/SupportPages/PolicyPages";
import { ContactPage, FAQPage } from "./pages/SupportPages/ContactFAQPages";

// Các trang chưa xây dựng → dùng Placeholder tạm để routing không lỗi
// (Sẽ được thay thế ở các phần tiếp theo của đồ án)
const Placeholder = ({ title }) => (
  <div style={{
    padding: "80px 24px",
    textAlign: "center",
    fontFamily: "var(--font-display)",
    fontSize: "32px",
    fontWeight: 300,
    color: "var(--color-gray-3)"
  }}>
    {title}
    <p style={{
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      marginTop: "12px",
      color: "var(--color-gray-4)"
    }}>
      Trang này sẽ được xây dựng ở phần tiếp theo
    </p>
  </div>
);

// ---- LAYOUT WRAPPER ----
// Dùng cho tất cả trang có Navbar + Footer
// (Trang login/register không dùng vì có layout riêng)
function MainLayout({ children }) {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ======================================================
            NHÓM 1: TRANG KHÔNG CÓ NAVBAR/FOOTER (auth)
            Layout riêng, chiếm toàn màn hình
        ====================================================== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />


        {/* ======================================================
            NHÓM 2: TRANG CÔNG KHAI (public — ai cũng xem được)
        ====================================================== */}
        <Route path="/" element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        } />

        <Route path="/products" element={
          <MainLayout>
            <ProductsPage />
          </MainLayout>
        } />

        <Route path="/products/:productId" element={
          <MainLayout>
            <ProductDetailPage />
          </MainLayout>
        } />

        <Route path="/categories" element={
          <MainLayout>
            <CategoriesPage />
          </MainLayout>
        } />


        {/* ======================================================
            NHÓM 3: TRANG CẦN ĐĂNG NHẬP (customer)
            Bọc bằng <ProtectedRoute> — không truyền requiredRole
            → chỉ cần đăng nhập, không phân biệt role
        ====================================================== */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <MainLayout>
              <CartPage />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <MainLayout>
              <OrdersPage />
            </MainLayout>
          </ProtectedRoute>
        } />


        {/* ======================================================
            NHÓM 4: TRANG ADMIN / NHÂN VIÊN
            Bọc bằng <ProtectedRoute requiredRole="staff">
            → cần role là "staff" hoặc "admin"
        ====================================================== */}
        <Route path="/admin/products" element={
          <ProtectedRoute requiredRole="staff">
            <AdminProductsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/orders" element={
          <ProtectedRoute requiredRole="staff">
            <AdminOrdersPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/vouchers" element={
          <ProtectedRoute requiredRole="staff">
            <MainLayout>
              <Placeholder title="Quản lý Voucher" />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/inventory" element={
          <ProtectedRoute requiredRole="staff">
            <AdminInventoryPage />
          </ProtectedRoute>
        } />


        {/* ======================================================
            NHÓM 6: TRANG HỖ TRỢ (public)
        ====================================================== */}
        <Route path="/faq" element={<MainLayout><FAQPage /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
        <Route path="/policy/return" element={<MainLayout><ReturnPolicyPage /></MainLayout>} />
        <Route path="/policy/shipping" element={<MainLayout><ShippingPolicyPage /></MainLayout>} />
        <Route path="/policy/privacy" element={<MainLayout><PrivacyPolicyPage /></MainLayout>} />


        {/* ======================================================
            NHÓM 7: FALLBACK
            Bất kỳ URL không tồn tại → về trang chủ
        ====================================================== */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
