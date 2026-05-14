// ============================================================
// FILE: src/data/adminMockData.js
// Mock data cho khu vực Admin — đơn hàng, nhật ký kho, doanh thu
// Cấu trúc khớp chính xác với database schema trong báo cáo
// ============================================================

import { formatPrice } from "./mockData";

// ---- MOCK ĐƠN HÀNG (bảng Order + order_detail) ----
export const MOCK_ADMIN_ORDERS = [
  {
    order_id: 1001, order_date: "2025-05-01", status: "pending",
    total_amount: 628000, discount_amount: 50000, shipping_fee: 30000,
    payment_method: "COD", shipping_address: "123 Lê Lợi, Q.1, TP.HCM",
    user: { user_id: 5, full_name: "Nguyễn Thị Mai", phone_number: "0912345678" },
    approved_by: null, voucher_id: 3, completed_at: null,
    items: [
      { product_name: "Áo Thun Cotton Oversize", color: "Trắng sữa", size: "M", quantity: 2, unit_price: 279000 },
    ],
  },
  {
    order_id: 1002, order_date: "2025-05-02", status: "confirmed",
    total_amount: 820000, discount_amount: 0, shipping_fee: 30000,
    payment_method: "bank_transfer", shipping_address: "456 Nguyễn Huệ, Q.1, TP.HCM",
    user: { user_id: 7, full_name: "Trần Văn Bình", phone_number: "0987654321" },
    approved_by: 2, voucher_id: null, completed_at: null,
    items: [
      { product_name: "Denim Jacket Cổ Điển", color: "Xanh wash", size: "L", quantity: 1, unit_price: 820000 },
    ],
  },
  {
    order_id: 1003, order_date: "2025-05-03", status: "shipping",
    total_amount: 978000, discount_amount: 100000, shipping_fee: 30000,
    payment_method: "e_wallet", shipping_address: "789 Trần Hưng Đạo, Q.5, TP.HCM",
    user: { user_id: 9, full_name: "Lê Hồng Nhung", phone_number: "0971234567" },
    approved_by: 2, voucher_id: 1, completed_at: null,
    items: [
      { product_name: "Sơ Mi Linen Dài Tay", color: "Be nhạt", size: "M", quantity: 1, unit_price: 489000 },
      { product_name: "Quần Âu Slim Fit",     color: "Đen",     size: "30", quantity: 1, unit_price: 589000 },
    ],
  },
  {
    order_id: 1004, order_date: "2025-05-05", status: "completed",
    total_amount: 349000, discount_amount: 0, shipping_fee: 30000,
    payment_method: "COD", shipping_address: "321 Điện Biên Phủ, Q.3, TP.HCM",
    user: { user_id: 12, full_name: "Phạm Minh Khoa", phone_number: "0905111222" },
    approved_by: 2, voucher_id: null, completed_at: "2025-05-08",
    items: [
      { product_name: "Áo Thun Graphic Print", color: "Xám khói", size: "S", quantity: 1, unit_price: 349000 },
    ],
  },
  {
    order_id: 1005, order_date: "2025-05-06", status: "cancelled",
    total_amount: 659000, discount_amount: 0, shipping_fee: 30000,
    payment_method: "COD", shipping_address: "654 Cách Mạng Tháng 8, Q.10, TP.HCM",
    user: { user_id: 14, full_name: "Vũ Thị Lan", phone_number: "0936789012" },
    approved_by: null, voucher_id: null, completed_at: null,
    cancellation_reason: "Khách hàng đổi ý sau khi đặt",
    items: [
      { product_name: "Jean Straight Leg", color: "Xanh nhạt", size: "30", quantity: 1, unit_price: 659000 },
    ],
  },
  {
    order_id: 1006, order_date: "2025-05-08", status: "pending",
    total_amount: 1640000, discount_amount: 164000, shipping_fee: 30000,
    payment_method: "bank_transfer", shipping_address: "99 Pasteur, Q.1, TP.HCM",
    user: { user_id: 16, full_name: "Hoàng Đức Long", phone_number: "0918765432" },
    approved_by: null, voucher_id: 2, completed_at: null,
    items: [
      { product_name: "Bomber Jacket Dù",   color: "Xanh rêu", size: "M", quantity: 1, unit_price: 890000 },
      { product_name: "Jean Wide Leg",       color: "Xanh đậm", size: "28", quantity: 1, unit_price: 729000 },
    ],
  },
];

// ---- MOCK NHẬT KÝ KHO (bảng inventory_log) ----
export const MOCK_INVENTORY_LOGS = [
  { log_id: 1, transaction_type: "out", quantity: 2, product_id: 1, product_name: "Áo Thun Cotton Oversize", color: "Trắng sữa", size: "M", reference_id: 1001, created_at: "2025-05-01T14:32:00", note: "Đơn hàng #1001 thành công" },
  { log_id: 2, transaction_type: "out", quantity: 1, product_id: 12, product_name: "Bomber Jacket Dù", color: "Xanh rêu", size: "M", reference_id: 1003, created_at: "2025-05-03T09:15:00", note: "Đơn hàng #1003 xuất kho" },
  { log_id: 3, transaction_type: "in",  quantity: 20, product_id: 1, product_name: "Áo Thun Cotton Oversize", color: "Trắng sữa", size: "M", reference_id: 2, created_at: "2025-05-04T10:00:00", note: "Nhập hàng từ nhà cung cấp" },
  { log_id: 4, transaction_type: "out", quantity: 1, product_id: 13, product_name: "Denim Jacket Cổ Điển", color: "Xanh wash", size: "L", reference_id: 1002, created_at: "2025-05-04T11:20:00", note: "Đơn hàng #1002 xuất kho" },
  { log_id: 5, transaction_type: "in",  quantity: 10, product_id: 8, product_name: "Jean Straight Leg", color: "Xanh nhạt", size: "30", reference_id: 2, created_at: "2025-05-05T08:45:00", note: "Nhập hàng bổ sung" },
  { log_id: 6, transaction_type: "out", quantity: 1, product_id: 3, product_name: "Áo Thun Graphic Print", color: "Xám khói", size: "S", reference_id: 1004, created_at: "2025-05-06T13:00:00", note: "Đơn hàng #1004 thành công" },
  { log_id: 7, transaction_type: "out", quantity: 1, product_id: 5, product_name: "Sơ Mi Linen Dài Tay", color: "Be nhạt", size: "M", reference_id: 1003, created_at: "2025-05-06T13:01:00", note: "Đơn hàng #1003 xuất kho" },
  { log_id: 8, transaction_type: "in",  quantity: 15, product_id: 5, product_name: "Sơ Mi Linen Dài Tay", color: "Be nhạt", size: "M", reference_id: 3, created_at: "2025-05-07T09:30:00", note: "Nhập hàng mùa mới" },
  { log_id: 9, transaction_type: "out", quantity: 1, product_id: 10, product_name: "Quần Âu Slim Fit", color: "Đen", size: "30", reference_id: 1003, created_at: "2025-05-07T09:35:00", note: "Đơn hàng #1003 xuất kho" },
  { log_id: 10, transaction_type: "in", quantity: 5, product_id: 14, product_name: "Windbreaker Nhẹ", color: "Đen", size: "XL", reference_id: 4, created_at: "2025-05-08T14:00:00", note: "Hàng về từ kho trung tâm" },
];

// ---- TÍNH THỐNG KÊ DASHBOARD ----
// Doanh thu chỉ tính từ đơn có status = "completed"
// (theo báo cáo: chỉ payment_status = 'Success' mới được tính)
export const calcDashboardStats = (orders) => {
  const completedOrders = orders.filter(o => o.status === "completed");

  const totalRevenue = completedOrders.reduce((sum, o) => {
    const final = o.total_amount - o.discount_amount + o.shipping_fee;
    return sum + final;
  }, 0);

  const pendingCount   = orders.filter(o => o.status === "pending").length;
  const shippingCount  = orders.filter(o => o.status === "shipping").length;
  const cancelledCount = orders.filter(o => o.status === "cancelled").length;

  return {
    totalRevenue,
    totalOrders:    orders.length,
    completedCount: completedOrders.length,
    pendingCount,
    shippingCount,
    cancelledCount,
  };
};

// ---- LABEL TRẠNG THÁI ----
export const STATUS_LABELS = {
  pending:   "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping:  "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

// ---- LUỒNG TRẠNG THÁI ----
// Xác định từ trạng thái hiện tại có thể chuyển sang trạng thái nào
export const NEXT_STATUS = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["shipping",  "cancelled"],
  shipping:  ["completed", "cancelled"],
  completed: [],   // Đã xong, không thể thay đổi
  cancelled: [],   // Đã hủy, không thể thay đổi
};

export { formatPrice };
