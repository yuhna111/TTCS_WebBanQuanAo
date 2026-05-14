// ============================================================
// FILE: src/pages/OrdersPage/OrdersPage.jsx
// MỤC ĐÍCH: Trang lịch sử đơn hàng của khách hàng.
// Gọi API GET /api/orders/history/:userId và hiển thị kết quả.
// ============================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getOrderHistory } from "../../services/api";
import { formatPrice } from "../../data/mockData";
import "./OrdersPage.css";

// Cấu hình hiển thị cho từng trạng thái
const STATUS_CONFIG = {
  pending:   { label: "Chờ xác nhận", icon: "○" },
  confirmed: { label: "Đã xác nhận",  icon: "◎" },
  shipping:  { label: "Đang giao",    icon: "→" },
  completed: { label: "Hoàn thành",   icon: "✓" },
  cancelled: { label: "Đã hủy",       icon: "✕" },
};

export default function OrdersPage() {
  const { user, token } = useAuth();

  // ---- STATE ----
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- LẤY DỮ LIỆU ĐƠN HÀNG ----
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getOrderHistory(user.user_id, token);
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || "Không thể tải đơn hàng");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.user_id) {
      fetchOrders();
    }
  }, [user, token]);

  if (isLoading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="orders-loading">Đang tải đơn hàng...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">

        <h1 className="orders-page__title display">Đơn hàng của tôi</h1>
        <p className="orders-page__sub">
          Xin chào <strong>{user?.full_name}</strong> — bạn có {orders.length} đơn hàng
        </p>

        {orders.length === 0 ? (
          <div className="orders-empty">
            Chưa có đơn hàng nào
            <p>Hãy khám phá và đặt hàng ngay hôm nay</p>
            <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <OrderCard key={order.order_id} order={order} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ============================================================
// COMPONENT CON: OrderCard
// ============================================================
function OrderCard({ order }) {
  const status = STATUS_CONFIG[order.status] || { label: order.status, icon: "·" };
  const finalAmount = order.total_amount - order.discount_amount + order.shipping_fee;

  return (
    <div className="order-card">

      {/* Header */}
      <div className="order-card__header">
        <span className="order-card__id">#{order.order_id}</span>
        <span className="order-card__date">
          {new Date(order.order_date).toLocaleDateString("vi-VN")}
        </span>
        <span className={`order-status order-status--${order.status}`}>
          {status.icon} {status.label}
        </span>
        <span className="order-card__total">{formatPrice(finalAmount)}</span>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="order-card__body">
        <div className="order-card__items">
          {order.items.map((item) => (
            <div key={item.order_detail_id} className="order-card__item">
              <img
                src={item.image_url}
                alt={item.product_name}
                className="order-card__item-img"
                onError={(e) => { e.target.src = "https://placehold.co/56x70/e8e5e0/6b6b6b?text=AvQ"; }}
              />
              <div>
                <div className="order-card__item-name">{item.product_name}</div>
                <div className="order-card__item-meta">
                  {item.color} · Size {item.size} · x{item.quantity}
                </div>
              </div>
              {/* unit_price: giá đã "chốt" lúc đặt — không đổi dù sản phẩm tăng giá */}
              <div className="order-card__item-price">
                {formatPrice(item.unit_price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="order-card__footer">
        <span className="order-card__footer-note">
          {order.status === "completed" && order.completed_at &&
            `Giao thành công ngày ${new Date(order.completed_at).toLocaleDateString("vi-VN")}`}
          {order.status === "cancelled" && order.cancellation_reason &&
            `Lý do hủy: ${order.cancellation_reason}`}
          {order.status === "shipping" && "Đơn hàng đang trên đường giao"}
          {order.status === "pending"   && "Đang chờ nhân viên xác nhận"}
          {order.status === "confirmed" && "Đơn đã xác nhận, chuẩn bị giao"}
        </span>
        <span className="order-card__footer-note">{order.payment_method}</span>
      </div>

    </div>
  );
}
