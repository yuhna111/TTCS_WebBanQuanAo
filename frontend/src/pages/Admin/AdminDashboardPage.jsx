// ============================================================
// FILE: src/pages/Admin/AdminDashboardPage.jsx
// MỤC ĐÍCH: Trang tổng quan — thống kê và bảng doanh thu.
// Doanh thu chỉ tính từ đơn status = "completed" (theo báo cáo).
// ============================================================

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import { getAdminStats, getAllOrders } from "../../services/api";
import { formatPrice } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

// Tháng hiển thị (dùng để nhóm doanh thu theo tháng)
const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, ordersRes] = await Promise.all([
          getAdminStats(token),
          getAllOrders(token)
        ]);
        setStats(statsRes);
        setOrders(ordersRes.orders || []);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Nhóm doanh thu theo tháng (chỉ đơn completed)
  const revenueByMonth = useMemo(() => {
    if (!stats?.monthlyRevenue) return {};
    const map = {};
    stats.monthlyRevenue.forEach(r => {
      const monthIndex = new Date(r.month + "-01").getMonth();
      map[monthIndex] = r.revenue;
    });
    return map;
  }, [stats]);

  // Đơn hàng mới nhất (5 đơn) cho bảng phía dưới
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
    .slice(0, 5);

  if (isLoading) {
    return <AdminLayout><div>Đang tải...</div></AdminLayout>;
  }

  if (error) {
    return <AdminLayout><div>Lỗi: {error}</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="admin-page-title display">Tổng quan</h1>
      <p className="admin-page-sub">
        Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
      </p>

      {/* ---- STAT CARDS ---- */}
      <div className="stat-grid">
        <StatCard
          label="Doanh thu (completed)"
          value={formatPrice(stats.totalRevenue)}
          change="Chỉ tính đơn hoàn thành"
        />
        <StatCard
          label="Tổng đơn hàng"
          value={stats.totalOrders}
          change={`${stats.monthlyOrders} đơn tháng này`}
        />
        <StatCard
          label="Đang chờ duyệt"
          value={stats.pendingCount}
          change={stats.pendingCount > 0 ? "Cần xử lý" : "Không có đơn chờ"}
          changeClass={stats.pendingCount > 0 ? "up" : ""}
        />
        <StatCard
          label="Đơn tháng này"
          value={stats.monthlyOrders}
          change="Đơn hàng mới"
        />
      </div>

      {/* ---- BẢNG DOANH THU THEO THÁNG ---- */}
      <div className="admin-section-header">
        <span className="admin-section-title">Doanh thu theo tháng (2025)</span>
      </div>
      <div className="admin-table-wrap" style={{ marginBottom: 36 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tháng</th>
              <th>Doanh thu</th>
              <th>Thanh toán</th>
              {/* Cột minh họa — dữ liệu thực từ bảng Payment theo báo cáo */}
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((label, idx) => {
              const rev = revenueByMonth[idx] || 0;
              return (
                <tr key={idx}>
                  <td><strong>{label}/2025</strong></td>
                  <td>{rev > 0 ? formatPrice(rev) : <span style={{ color: "var(--color-gray-4)" }}>—</span>}</td>
                  <td>
                    {rev > 0
                      ? <span className="badge badge--completed">Đã ghi nhận</span>
                      : <span className="badge badge--pending">Chưa có</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 500, background: "var(--color-gray-5)" }}>
              <td><strong>Tổng cộng</strong></td>
              <td><strong>{formatPrice(stats.totalRevenue)}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ---- BẢNG ĐƠN HÀNG GẦN ĐÂY ---- */}
      <div className="admin-section-header">
        <span className="admin-section-title">Đơn hàng gần đây</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => {
              const final = order.final_amount ?? (order.total_amount - (order.discount_amount || 0) + (order.shipping_fee ?? 30000));
              return (
                <tr key={order.order_id}>
                  <td className="mono">#{order.order_id}</td>
                  <td><strong>{order.user.full_name}</strong></td>
                  <td>{new Date(order.order_date).toLocaleDateString("vi-VN")}</td>
                  <td><strong>{formatPrice(final)}</strong></td>
                  <td>
                    <span className={`badge badge--${order.status}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </AdminLayout>
  );
}

// Component con StatCard
function StatCard({ label, value, change, changeClass }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {change && <div className={`stat-card__change ${changeClass || ""}`}>{change}</div>}
    </div>
  );
}
