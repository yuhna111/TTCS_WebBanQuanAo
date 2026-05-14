// ============================================================
// FILE: src/pages/Admin/AdminInventoryPage.jsx
// MỤC ĐÍCH: Nhật ký kho — xem lịch sử xuất/nhập tất cả sản phẩm.
// Theo báo cáo: bảng inventory_log lưu mọi biến động kho,
// ghi nhận tự động khi đơn hàng thành công (transaction_type = "out")
// hoặc khi admin nhập hàng (transaction_type = "in").
// ============================================================

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import { getInventoryLogs } from "../../services/api";
import { formatPrice } from "../../data/adminMockData";
import { useAuth } from "../../context/AuthContext";

export default function AdminInventoryPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const data = await getInventoryLogs(token);
        setLogs(data.logs || []);
      } catch (err) {
        setError(err.message || "Không thể tải nhật ký kho");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  const [filterType, setFilterType] = useState("all"); // "all" | "in" | "out"
  const [searchText, setSearchText] = useState("");

  // ---- LỌC ----
  const displayedLogs = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // mới nhất trên cùng
      .filter(log => {
        const matchType   = filterType === "all" || log.transaction_type === filterType;
        const q = searchText.toLowerCase();
        const matchSearch = !q
          || log.product_name.toLowerCase().includes(q)
          || String(log.product_id).includes(q)
          || (log.note || "").toLowerCase().includes(q);
        return matchType && matchSearch;
      });
  }, [logs, filterType, searchText]);

  // ---- THỐNG KÊ NHANH ----
  const totalIn  = logs.filter(l => l.transaction_type === "in" ).reduce((s, l) => s + l.quantity, 0);
  const totalOut = logs.filter(l => l.transaction_type === "out").reduce((s, l) => s + l.quantity, 0);

  if (isLoading) {
    return <AdminLayout><div>Đang tải...</div></AdminLayout>;
  }

  if (error) {
    return <AdminLayout><div>Lỗi: {error}</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="admin-page-title display">Nhật ký kho</h1>
      <p className="admin-page-sub">
        Lịch sử toàn bộ biến động xuất / nhập kho — {logs.length} bản ghi
      </p>

      {/* ---- THỐNG KÊ NHANH ---- */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-card__label">Tổng bản ghi</div>
          <div className="stat-card__value">{logs.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Tổng nhập kho</div>
          <div className="stat-card__value" style={{ color: "var(--color-success)" }}>
            +{totalIn}
          </div>
          <div className="stat-card__change">sản phẩm đã nhập</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Tổng xuất kho</div>
          <div className="stat-card__value" style={{ color: "var(--color-danger)" }}>
            -{totalOut}
          </div>
          <div className="stat-card__change">sản phẩm đã xuất</div>
        </div>
      </div>

      {/* ---- FILTER BAR ---- */}
      <div className="admin-filter-bar">
        <input
          className="admin-search"
          placeholder="Tìm tên sản phẩm, ghi chú..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <select
          className="admin-filter-select"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="all">Tất cả loại</option>
          <option value="in">Nhập kho</option>
          <option value="out">Xuất kho</option>
        </select>
      </div>

      {/* ---- BẢNG NHẬT KÝ KHO ---- */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Thời gian</th>
              <th>Loại</th>
              <th>Sản phẩm</th>
              <th>Màu / Size</th>
              <th style={{ textAlign: "right" }}>Số lượng</th>
              <th>Mã tham chiếu</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {displayedLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="admin-empty">Không có bản ghi nào</td>
              </tr>
            ) : (
              displayedLogs.map(log => {
                const isIn = log.transaction_type === "in";
                const dt   = new Date(log.created_at);

                return (
                  <tr key={log.log_id}>
                    <td className="mono">{log.log_id}</td>

                    {/* Thời gian — hiện đầy đủ ngày + giờ */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 13 }}>
                        {dt.toLocaleDateString("vi-VN")}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-gray-4)" }}>
                        {dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>

                    {/* Badge nhập/xuất */}
                    <td>
                      <span className={`badge badge--${isIn ? "in" : "out"}`}>
                        {isIn ? "↑ Nhập" : "↓ Xuất"}
                      </span>
                    </td>

                    <td><strong>{log.product_name}</strong></td>

                    <td style={{ fontSize: 12, color: "var(--color-gray-3)" }}>
                      {log.color} / {log.size}
                    </td>

                    {/* Số lượng — màu xanh nếu nhập, đỏ nếu xuất */}
                    <td style={{
                      textAlign: "right",
                      fontWeight: 500,
                      fontSize: 15,
                      color: isIn ? "var(--color-success)" : "var(--color-danger)",
                      fontFamily: "'Courier New', monospace",
                    }}>
                      {isIn ? "+" : "−"}{log.quantity}
                    </td>

                    {/* Mã tham chiếu: mã đơn hàng hoặc mã admin */}
                    <td className="mono">
                      {log.reference_id
                        ? (isIn ? `ADM-${log.reference_id}` : `#${log.reference_id}`)
                        : "—"}
                    </td>

                    <td style={{ fontSize: 12, color: "var(--color-gray-3)", maxWidth: 200 }}>
                      {log.note || "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </AdminLayout>
  );
}
