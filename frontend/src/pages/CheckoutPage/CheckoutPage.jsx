// ============================================================
// FILE: src/pages/CheckoutPage/CheckoutPage.jsx
// MỤC ĐÍCH: Trang thanh toán — trọng tâm logic nghiệp vụ.
//
// LUỒNG HOẠT ĐỘNG (theo báo cáo):
//   1. Nhập địa chỉ giao hàng, chọn phương thức thanh toán
//   2. Nhập mã voucher → gọi API kiểm tra → đếm ngược 15 phút
//   3. Toggle dùng điểm thưởng → trừ thêm vào tổng tiền
//   4. Bấm "Đặt hàng" → đóng gói payload đúng chuẩn backend
//      (quan trọng: unit_price = base_price tại thời điểm mua)
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { applyVoucher as applyVoucherAPI, createOrder } from "../../services/api";
import { formatPrice } from "../../data/mockData";
import "./CheckoutPage.css";

// Hằng số: 1 điểm = 1.000đ (có thể cấu hình tùy dự án)
const POINTS_TO_VND = 1000;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cartItems, subtotal, discountAmount, shippingFee, finalAmount,
    appliedVoucher, applyVoucher, removeVoucher,
    voucherCountdown, formatCountdown,
    clearCart,
  } = useCart();
  const { user, token } = useAuth();

  // ---- STATE FORM GIAO HÀNG ----
  const [shippingInfo, setShippingInfo] = useState({
    full_name: user?.full_name || "",
    phone_number: user?.phone_number || "",
    address: user?.address || "",
    city: "",
  });

  // ---- STATE VOUCHER ----
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  // ---- STATE ĐIỂM THƯỞNG ----
  // usePoints: user có muốn dùng điểm không
  const [usePoints, setUsePoints] = useState(false);
  const availablePoints = user?.reward_points || 0;
  // Tính số tiền giảm từ điểm (không được giảm quá tổng tiền sau voucher)
  const pointsDiscount = usePoints
    ? Math.min(availablePoints * POINTS_TO_VND, finalAmount - shippingFee)
    : 0;

  // ---- STATE THANH TOÁN ----
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // ---- STATE ĐẶT HÀNG ----
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null); // lưu orderId sau khi đặt thành công

  // ---- TỔNG TIỀN CUỐI SAU KHI TRỪ ĐIỂM ----
  const grandTotal = Math.max(finalAmount - pointsDiscount, 0);

  // ============================================================
  // XỬ LÝ ÁP DỤNG VOUCHER
  // ============================================================
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherError("");

    try {
      // Gọi API POST /api/vouchers/apply
      // Backend kiểm tra: còn hiệu lực? đủ điều kiện đơn tối thiểu?
      // Nếu hợp lệ: backend "tạm giữ" mã 15 phút
      const data = await applyVoucherAPI(voucherCode.trim().toUpperCase(), subtotal, token);

      // Lưu voucher vào CartContext và bắt đầu đếm ngược
      applyVoucher(data.voucher);
      setVoucherCode("");
    } catch (err) {
      setVoucherError(err.message || "Mã giảm giá không hợp lệ hoặc đã hết lượt dùng.");
    } finally {
      setVoucherLoading(false);
    }
  };

  // ============================================================
  // XỬ LÝ ĐẶT HÀNG
  // Đây là phần QUAN TRỌNG NHẤT — đóng gói payload đúng chuẩn
  // ============================================================
  const handleSubmitOrder = async () => {
    // Validation địa chỉ
    if (!shippingInfo.full_name || !shippingInfo.phone_number || !shippingInfo.address) {
      setOrderError("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    setIsSubmitting(true);
    setOrderError("");

    // -------------------------------------------------------
    // ĐÓNG GÓI PAYLOAD GỬI LÊN BACKEND (POST /api/orders)
    //
    // Điểm quan trọng trong báo cáo:
    //   - unit_price: "chốt giá" tại thời điểm mua
    //     (không lấy từ DB sau này vì sản phẩm có thể đã đổi giá)
    //   - points_used: số điểm đã dùng (backend sẽ trừ vào user)
    //   - voucher_id: ID voucher để backend trừ usage_limit
    // -------------------------------------------------------
    const orderPayload = {
      // Địa chỉ giao hàng cụ thể
      shipping_address: `${shippingInfo.full_name}, ${shippingInfo.phone_number}, ${shippingInfo.address}, ${shippingInfo.city}`,

      // Phương thức thanh toán
      payment_method: paymentMethod,

      // Voucher (nếu có)
      voucher_id: appliedVoucher?.voucher_id || null,

      // Điểm tích lũy đã dùng
      // Backend sẽ dùng con số này để trừ reward_points của user
      points_used: usePoints ? availablePoints : 0,


      // -------------------------------------------------------
      // ITEMS — quan trọng: mỗi item có unit_price riêng
      // unit_price = base_price TẠI THỜI ĐIỂM ĐẶT HÀNG
      // Không để backend tự lấy giá từ bảng Product
      // vì sản phẩm có thể tăng/giảm giá sau này
      // -------------------------------------------------------
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.base_price, // "chốt giá" — quan trọng!
        color: item.color,
        size: item.size,
      })),
    };

    try {
      // Gọi API POST /api/orders
      const data = await createOrder(orderPayload, token);

      // Đặt hàng thành công
      setOrderSuccess(data.order_id || "AvQ-" + Date.now());
      clearCart(); // Xóa giỏ hàng
    } catch (err) {
      setOrderError(err.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- HIỆN MÀN HÌNH THÀNH CÔNG ----
  if (orderSuccess) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-success">
            <div className="checkout-success__icon">✓</div>
            <h2 className="checkout-success__title display">Đặt hàng thành công!</h2>
            <p className="checkout-success__sub">
              Mã đơn hàng: <strong>#{orderSuccess}</strong>
              <br />
              Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link to="/orders" className="btn btn-primary">Xem đơn hàng</Link>
              <Link to="/products" className="btn btn-outline">Tiếp tục mua sắm</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-page__title display">Thanh toán</h1>

        <div className="checkout-page__body">

          {/* ================================================
              CỘT TRÁI: CÁC SECTION NHẬP LIỆU
          ================================================ */}
          <div>

            {/* ---- 1. THÔNG TIN GIAO HÀNG ---- */}
            <section className="checkout-section">
              <div className="checkout-section__title">Thông tin giao hàng</div>
              <div className="checkout-form-grid">
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    value={shippingInfo.full_name}
                    onChange={(e) => setShippingInfo(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    value={shippingInfo.phone_number}
                    onChange={(e) => setShippingInfo(p => ({ ...p, phone_number: e.target.value }))}
                    placeholder="0912 345 678"
                  />
                </div>
                <div className="form-group full">
                  <label>Địa chỉ</label>
                  <input
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo(p => ({ ...p, address: e.target.value }))}
                    placeholder="Số nhà, tên đường, phường/xã"
                  />
                </div>
                <div className="form-group full">
                  <label>Tỉnh / Thành phố</label>
                  <input
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo(p => ({ ...p, city: e.target.value }))}
                    placeholder="TP. Hồ Chí Minh"
                  />
                </div>
              </div>
            </section>

            {/* ---- 2. MÃ GIẢM GIÁ ---- */}
            <section className="checkout-section">
              <div className="checkout-section__title">Mã giảm giá</div>

              {!appliedVoucher ? (
                <>
                  <div className="voucher-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <input
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value.toUpperCase());
                          setVoucherError("");
                        }}
                        placeholder="Nhập mã voucher (vd: SALE20)"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                      />
                    </div>
                    <button
                      className="btn btn-outline"
                      onClick={handleApplyVoucher}
                      disabled={voucherLoading || !voucherCode.trim()}
                    >
                      {voucherLoading ? "..." : "Áp dụng"}
                    </button>
                  </div>
                  {voucherError && (
                    <div className="msg-error" style={{ marginTop: 8 }}>{voucherError}</div>
                  )}
                </>
              ) : (
                // Đã áp dụng voucher thành công
                <div>
                  <div className="voucher-applied">
                    <div>
                      <div className="voucher-applied__code">{appliedVoucher.voucher_code}</div>
                      <div className="voucher-applied__info">
                        Giảm {appliedVoucher.discount_type === "percent"
                          ? `${appliedVoucher.discount_value}%`
                          : formatPrice(appliedVoucher.discount_value)
                        }
                      </div>
                    </div>
                    <button className="voucher-applied__remove" onClick={removeVoucher}>
                      Hủy mã
                    </button>
                  </div>
                  {/* ĐỒNG HỒ ĐẾM NGƯỢC 15 PHÚT */}
                  {/* Theo báo cáo: mã giảm giá được "giữ" 15 phút */}
                  {/* Nếu hết giờ mà chưa thanh toán → backend tự trả mã về kho */}
                  <div className={`voucher-countdown ${voucherCountdown < 120 ? "voucher-countdown--urgent" : ""}`}>
                    <span>⏱</span>
                    <span>Mã hết hiệu lực sau</span>
                    <span className="voucher-countdown__time">{formatCountdown()}</span>
                  </div>
                </div>
              )}
            </section>

            {/* ---- 3. ĐIỂM THƯỞNG ---- */}
            {availablePoints > 0 && (
              <section className="checkout-section">
                <div className="checkout-section__title">Điểm tích lũy</div>
                <div className="points-section">
                  <div className="points-info">
                    <span className="points-info__label">Điểm hiện có</span>
                    <span className="points-info__value">
                      {availablePoints.toLocaleString("vi-VN")} điểm
                      ({formatPrice(availablePoints * POINTS_TO_VND)})
                    </span>
                  </div>
                  <label className="points-toggle">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                    />
                    <span className="points-toggle__text">
                      Dùng toàn bộ điểm để giảm giá
                    </span>
                    {usePoints && (
                      <span className="points-toggle__discount">
                        −{formatPrice(pointsDiscount)}
                      </span>
                    )}
                  </label>
                </div>
              </section>
            )}

            {/* ---- 4. PHƯƠNG THỨC THANH TOÁN ---- */}
            <section className="checkout-section">
              <div className="checkout-section__title">Phương thức thanh toán</div>
              <div className="payment-options">
                {[
                  { value: "COD", label: "Thanh toán khi nhận hàng", desc: "COD" },
                  { value: "bank_transfer", label: "Chuyển khoản ngân hàng", desc: "QR Pay" },
                  { value: "e_wallet", label: "Ví điện tử", desc: "Momo / ZaloPay" },
                ].map((opt) => (
                  <label key={opt.value} className="payment-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                    />
                    <span className="payment-option__label">{opt.label}</span>
                    <span className="payment-option__desc">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Lỗi đặt hàng */}
            {orderError && <div className="msg-error">{orderError}</div>}

          </div>

          {/* ================================================
              CỘT PHẢI: TÓM TẮT ĐƠN HÀNG
          ================================================ */}
          <aside className="checkout-summary">
            <div className="checkout-summary__title">
              Đơn hàng ({cartItems.length} sản phẩm)
            </div>

            {/* Danh sách sản phẩm nhỏ */}
            <div className="checkout-summary__items">
              {cartItems.map((item) => (
                <div
                  key={`${item.product_id}-${item.color}-${item.size}`}
                  className="checkout-summary__item"
                >
                  <div>
                    <div className="checkout-summary__item-name">
                      {item.product_name}
                    </div>
                    <div className="checkout-summary__item-meta">
                      {item.color} · Size {item.size} · x{item.quantity}
                    </div>
                  </div>
                  <div className="checkout-summary__item-price">
                    {/* unit_price tại thời điểm mua — khớp với payload */}
                    {formatPrice(item.base_price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Tính tiền */}
            <div className="checkout-summary__row">
              <span>Tạm tính</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="checkout-summary__row discount">
                <span>Voucher ({appliedVoucher?.voucher_code})</span>
                <span>−{formatPrice(discountAmount)}</span>
              </div>
            )}

            {pointsDiscount > 0 && (
              <div className="checkout-summary__row points-used">
                <span>Điểm tích lũy</span>
                <span>−{formatPrice(pointsDiscount)}</span>
              </div>
            )}

            <div className="checkout-summary__row">
              <span>Phí vận chuyển</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>

            <div className="checkout-summary__row total">
              <span>Tổng thanh toán</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>

            <button
              className="btn btn-primary checkout-submit"
              onClick={handleSubmitOrder}
              disabled={isSubmitting || cartItems.length === 0}
            >
              {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
            </button>

            <p style={{ fontSize: 11, color: "var(--color-gray-4)", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
              Bấm "Đặt hàng" đồng nghĩa bạn đồng ý với điều khoản dịch vụ của AvQ
            </p>
          </aside>

        </div>
      </div>
    </div>
  );
}
