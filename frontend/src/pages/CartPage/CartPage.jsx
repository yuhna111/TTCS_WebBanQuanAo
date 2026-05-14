// ============================================================
// FILE: src/pages/CartPage/CartPage.jsx
// MỤC ĐÍCH: Trang giỏ hàng — xem, tăng/giảm số lượng, xóa.
// ============================================================

import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../data/mockData";
import "./CartPage.css";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    shippingFee,
    finalAmount,
    appliedVoucher,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="cart-page__title display">Giỏ hàng</h1>
          <div className="cart-empty">
            Giỏ hàng trống
            <p>Hãy khám phá bộ sưu tập của chúng tôi</p>
            <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-page__title display">
          Giỏ hàng ({cartItems.length} sản phẩm)
        </h1>

        <div className="cart-page__body">

          {/* ---- DANH SÁCH SẢN PHẨM ---- */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={`${item.product_id}-${item.color}-${item.size}`} className="cart-item">

                {/* Ảnh */}
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="cart-item__image"
                  onError={(e) => { e.target.src = "https://placehold.co/96x120/e8e5e0/6b6b6b?text=AvQ"; }}
                />

                {/* Thông tin */}
                <div>
                  <div className="cart-item__name">{item.product_name}</div>
                  <div className="cart-item__meta">
                    {item.color} · Size {item.size}
                  </div>
                  {/* Điều khiển số lượng */}
                  <div className="qty-control">
                    <button
                      className="qty-control__btn"
                      onClick={() => updateQuantity(item.product_id, item.color, item.size, item.quantity - 1)}
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span className="qty-control__num">{item.quantity}</span>
                    <button
                      className="qty-control__btn"
                      onClick={() => updateQuantity(item.product_id, item.color, item.size, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_quantity}
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Giá + xóa */}
                <div className="cart-item__right">
                  <div className="cart-item__price">
                    {formatPrice(item.base_price * item.quantity)}
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeFromCart(item.product_id, item.color, item.size)}
                  >
                    Xóa
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* ---- TÓM TẮT ĐƠN HÀNG ---- */}
          <aside className="cart-summary">
            <div className="cart-summary__title">Tóm tắt đơn hàng</div>

            <div className="cart-summary__row">
              <span>Tạm tính</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="cart-summary__row discount">
                <span>Giảm giá {appliedVoucher && `(${appliedVoucher.voucher_code})`}</span>
                <span>−{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="cart-summary__row">
              <span>Phí vận chuyển</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>

            <div className="cart-summary__row total">
              <span>Tổng cộng</span>
              <span>{formatPrice(finalAmount)}</span>
            </div>

            <button
              className="btn btn-primary cart-summary__checkout"
              onClick={() => navigate("/checkout")}
            >
              Tiến hành thanh toán
            </button>

            <div style={{ textAlign: "center", marginTop: 14 }}>
              <Link to="/products" style={{ fontSize: 12, color: "var(--color-gray-3)" }}>
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
