// ============================================================
// FILE: src/App.jsx
// MỤC ĐÍCH: Định nghĩa toàn bộ hệ thống điều hướng của app.
// Sử dụng react-router-dom v6.
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

// ---- TRANG ADMIN ----
import AdminOrdersPage from "./pages/Admin/AdminOrdersPage";
import AdminInventoryPage from "./pages/Admin/AdminInventoryPage";
import AdminProductsPage from "./pages/Admin/AdminProductsPage";
import AdminVouchersPage from "./pages/Admin/AdminVouchersPage";

// ---- TRANG HỖ TRỢ ----
import {
  ReturnPolicyPage,
  ShippingPolicyPage,
  PrivacyPolicyPage,
} from "./pages/SupportPages/PolicyPages";

import {
  ContactPage,
  FAQPage,
} from "./pages/SupportPages/ContactFAQPages";

// ---- LAYOUT WRAPPER ----
function MainLayout({ children }) {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* PUBLIC */}
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />

        <Route
          path="/products"
          element={
            <MainLayout>
              <ProductsPage />
            </MainLayout>
          }
        />

        <Route
          path="/products/:productId"
          element={
            <MainLayout>
              <ProductDetailPage />
            </MainLayout>
          }
        />

        <Route
          path="/categories"
          element={
            <MainLayout>
              <CategoriesPage />
            </MainLayout>
          }
        />

        {/* CUSTOMER */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CartPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CheckoutPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MainLayout>
                <OrdersPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ADMIN / STAFF */}
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requiredRole="staff">
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute requiredRole="staff">
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/vouchers"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminVouchersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute requiredRole="staff">
              <AdminInventoryPage />
            </ProtectedRoute>
          }
        />

        {/* SUPPORT */}
        <Route
          path="/faq"
          element={
            <MainLayout>
              <FAQPage />
            </MainLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <MainLayout>
              <ContactPage />
            </MainLayout>
          }
        />

        <Route
          path="/policy/return"
          element={
            <MainLayout>
              <ReturnPolicyPage />
            </MainLayout>
          }
        />

        <Route
          path="/policy/shipping"
          element={
            <MainLayout>
              <ShippingPolicyPage />
            </MainLayout>
          }
        />

        <Route
          path="/policy/privacy"
          element={
            <MainLayout>
              <PrivacyPolicyPage />
            </MainLayout>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}