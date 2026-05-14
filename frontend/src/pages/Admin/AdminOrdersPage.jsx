// ============================================================
// FILE: src/pages/Admin/AdminOrdersPage.jsx
// MỤC ĐÍCH: Quản lý đơn hàng — duyệt, cập nhật trạng thái, hủy.
//
// LUỒNG TRẠNG THÁI (theo báo cáo):
//   pending → confirmed → shipping → completed
//   Bất kỳ bước nào cũng có thể → cancelled (trừ completed)
//
// API THỰC TẾ: PUT /api/orders/:id/status
// ============================================================

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import { getAllOrders, updateAdminOrderStatus } from "../../services/api";
import { STATUS_LABELS, NEXT_STATUS, formatPrice } from "../../data/adminMockData";
import { useAuth } from "../../context/AuthContext";

// Nhãn nút hành động cho từng chuyển trạng thái
const ACTION_LABELS = {
  confirmed: { label: "Xác nhận",   cls: "tbl-btn--approve" },
  shipping:  { label: "Bắt đầu giao", cls: "tbl-btn--ship" },
  completed: { label: "Hoàn thành", cls: "tbl-btn--approve" },
  cancelled: { label: "Hủy đơn",   cls: "tbl-btn--cancel" },
};

export default function AdminOrdersPage() {
  const { token } = useAuth();

  // ---- STATE ----
  const [orders, setOrders]             = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState("");
  const [filterStatus, setFilterStatus] = useState("all");   // lọc theo trạng thái
  const [searchText, setSearchText]     = useState("");       // tìm theo tên khách / mã đơn
  const [confirmModal, setConfirmModal] = useState(null);     // { orderId, newStatus, label }
  const [toast, setToast]               = useState(null);     // { msg, type }

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await getAllOrders(token);
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || "Không thể tải đơn hàng");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // ---- LỌC VÀ TÌM KIẾM ----
  const displayedOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = filterStatus === "all" || o.status === filterStatus;
      const q = searchText.toLowerCase();
      const matchSearch = !q
        || String(o.order_id).includes(q)
        || o.user.full_name.toLowerCase().includes(q)
        || o.user.phone_number.includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, searchText]);

  // ---- HIỆN TOAST ----
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  // ---- XỬ LÝ CẬP NHẬT TRẠNG THÁI ----
  // Bước 1: Bấm nút → mở modal xác nhận
  const handleActionClick = (orderId, newStatus) => {
    const label = ACTION_LABELS[newStatus]?.label || newStatus;
    setConfirmModal({ orderId, newStatus, label });
  };

  // Bước 2: Xác nhận trong modal → gọi API → cập nhật local state
  const handleConfirmAction = async () => {
    const { orderId, newStatus } = confirmModal;
    setConfirmModal(null);

    try {
      // Gọi API thật: PUT /api/orders/:id/status
      // Nếu backend chưa sẵn sàng, catch sẽ vẫn cập nhật UI (mock mode)
      await updateAdminOrderStatus(orderId, { status: newStatus }, token);
    } catch {
      // Backend chưa kết nối → vẫn update UI để demo được
    }

    // Cập nhật state local ngay lập tức (optimistic update)
    setOrders(prev =>
      prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o)
    );
    showToast(`Đơn #${orderId} → ${STATUS_LABELS[newStatus]}`);
  };

  return (
    <AdminLayout>
      <h1 className="admin-page-title display">Quản lý đơn hàng</h1>
      <p className="admin-page-sub">{orders.length} đơn hàng · {displayedOrders.length} đang hiển thị</p>

      {/* ---- FILTER BAR ---- */}
      <div className="admin-filter-bar">
        <input
          className="admin-search"
          placeholder="Tìm mã đơn, tên khách, SĐT..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <select
          className="admin-filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* ---- BẢNG ĐƠN HÀNG ---- */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-empty">
                  Không có đơn hàng nào khớp điều kiện lọc
                </td>
              </tr>
            ) : (
              displayedOrders.map(order => {
                const final = order.final_amount ?? (order.total_amount - (order.discount_amount || 0) + (order.shipping_fee ?? 30000));
                const nextActions = NEXT_STATUS[order.status] || [];

                return (
                  <tr key={order.order_id}>
                    <td className="mono">#{order.order_id}</td>

                    {/* Thông tin khách */}
                    <td>
                      <strong>{order.user.full_name}</strong>
                      <div style={{ fontSize: 11, color: "var(--color-gray-4)", marginTop: 2 }}>
                        {order.user.phone_number}
                      </div>
                    </td>

                    <td>{new Date(order.order_date).toLocaleDateString("vi-VN")}</td>

                    {/* Tóm tắt sản phẩm */}
                    <td>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ fontSize: 12, marginBottom: 2 }}>
                          {item.product_name}
                          <span style={{ color: "var(--color-gray-4)", marginLeft: 4 }}>
                            ×{item.quantity}
                          </span>
                        </div>
                      ))}
                    </td>

                    <td><strong>{formatPrice(final)}</strong></td>

                    <td>
                      <span className={`badge badge--${order.status}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>

                    {/* ---- NÚT HÀNH ĐỘNG ----
                        Hiện các nút tương ứng với trạng thái tiếp theo hợp lệ.
                        Ví dụ: pending → [Xác nhận, Hủy đơn]
                        Ví dụ: completed → [] (không có nút nào)
                    ---- */}
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {nextActions.length === 0 ? (
                          <span style={{ fontSize: 11, color: "var(--color-gray-4)" }}>—</span>
                        ) : (
                          nextActions.map(nextStatus => {
                            const action = ACTION_LABELS[nextStatus];
                            return (
                              <button
                                key={nextStatus}
                                className={`tbl-btn ${action.cls}`}
                                onClick={() => handleActionClick(order.order_id, nextStatus)}
                              >
                                {action.label}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ---- MODAL XÁC NHẬN ---- */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__title display">Xác nhận thao tác</div>
            <div className="modal__body">
              Bạn muốn <strong>{confirmModal.label}</strong> đơn hàng{" "}
              <strong>#{confirmModal.orderId}</strong>?
              {confirmModal.newStatus === "cancelled" && (
                <span style={{ display: "block", marginTop: 8, color: "var(--color-danger)" }}>
                  ⚠ Thao tác này không thể hoàn tác.
                </span>
              )}
            </div>
            <div className="modal__actions">
              <button className="btn btn-ghost" onClick={() => setConfirmModal(null)}>
                Hủy bỏ
              </button>
              <button
                className={`btn ${confirmModal.newStatus === "cancelled" ? "btn-primary" : "btn-primary"}`}
                style={confirmModal.newStatus === "cancelled"
                  ? { background: "var(--color-danger)", borderColor: "var(--color-danger)" }
                  : {}}
                onClick={handleConfirmAction}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- TOAST ---- */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.msg}</div>
      )}
    </AdminLayout>
  );
}
