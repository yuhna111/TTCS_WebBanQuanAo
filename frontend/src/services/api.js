// ============================================================
// FILE: src/services/api.js
// MỤC ĐÍCH: Tập trung toàn bộ các hàm gọi API backend.
// Dùng fetch() thuần của JavaScript — không cần cài thêm Axios.
// Tất cả endpoint đều dựa trên danh sách API trong báo cáo.
// ============================================================

// URL gốc của backend — đọc từ biến môi trường Vite
// Trong file .env: VITE_API_URL=http://localhost:3000/api
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// -------------------------------------------------------
// HÀM TIỆN ÍCH: request()
// Đây là hàm trung tâm — tất cả hàm bên dưới đều gọi qua đây.
// Lý do: tránh lặp code (headers, xử lý lỗi, token) ở mọi chỗ.
//
// Tham số:
//   endpoint  — phần sau BASE_URL, ví dụ "/auth/login"
//   method    — "GET", "POST", "PUT", "DELETE"
//   body      — dữ liệu gửi lên (object, sẽ tự stringify)
//   token     — JWT token để gửi trong header Authorization
// -------------------------------------------------------
async function request(endpoint, method = "GET", body = null, token = null) {
  // Chuẩn bị headers
  const headers = {
    "Content-Type": "application/json", // gửi/nhận JSON
  };

  // Nếu có token → thêm vào header để backend xác thực
  // Định dạng chuẩn: "Bearer <jwt_token>"
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Cấu hình options cho fetch()
  const options = {
    method,
    headers,
  };

  // Chỉ thêm body nếu không phải GET (GET không có body)
  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    // Nếu server trả về lỗi HTTP (4xx, 5xx) → ném lỗi để catch bắt
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
    }

    // Parse JSON từ response body và trả về
    return await response.json();
  } catch (error) {
    // Re-throw để component gọi có thể hiển thị thông báo lỗi
    throw error;
  }
}

// ============================================================
// NHÓM API 1: XÁC THỰC TÀI KHOẢN
// Endpoint: POST /api/auth/register, POST /api/auth/login
// ============================================================

// Đăng ký tài khoản mới
// userData: { full_name, email, password, phone_number }
export const registerUser = (userData) =>
  request("/auth/register", "POST", userData);

// Đăng nhập — backend trả về { token, user, role }
// credentials: { email, password }
export const loginUser = (credentials) =>
  request("/auth/login", "POST", credentials);

// ============================================================
// NHÓM API 2: DANH MỤC SẢN PHẨM
// Endpoint: GET /api/categories, POST /api/categories
// ============================================================

// Lấy danh sách tất cả danh mục (không cần đăng nhập)
export const getCategories = () =>
  request("/categories", "GET");

// Thêm danh mục mới (chỉ Admin)
// token: JWT của admin, categoryData: { category_name, description }
export const createCategory = (categoryData, token) =>
  request("/categories", "POST", categoryData, token);

// ============================================================
// NHÓM API 3: SẢN PHẨM
// Endpoint: GET /api/products
// ============================================================

// Lấy danh sách tất cả sản phẩm (có thể thêm query params để lọc)
// Ví dụ: getProducts("?category_id=2&page=1")
export const getProducts = (queryString = "") =>
  request(`/products${queryString}`, "GET");

// Lấy chi tiết 1 sản phẩm theo ID
export const getProductById = (productId) =>
  request(`/products/${productId}`, "GET");

// ============================================================
// NHÓM API 4: VOUCHER / MÃ GIẢM GIÁ
// Endpoint: POST /api/vouchers/apply, GET /api/vouchers, POST /api/vouchers
// ============================================================

// Kiểm tra và áp dụng mã giảm giá (Khách hàng)
// Gửi lên: { voucher_code, order_total }
// Backend kiểm tra: còn hiệu lực? đủ điều kiện đơn tối thiểu?
// Nếu hợp lệ → backend "giữ" mã 15 phút
export const applyVoucher = (voucherCode, orderTotal, token) =>
  request("/vouchers/apply", "POST", { voucher_code: voucherCode, order_total: orderTotal }, token);

// Lấy danh sách tất cả voucher (Admin)
export const getAllVouchers = (token) =>
  request("/vouchers", "GET", null, token);

// Tạo voucher mới (Admin)
// voucherData: { voucher_code, discount_type, discount_value, min_order_value, usage_limit, start_date, end_date }
export const createVoucher = (voucherData, token) =>
  request("/vouchers", "POST", voucherData, token);

// ============================================================
// NHÓM API 5: ĐƠN HÀNG
// Endpoint: POST /api/orders, GET /api/orders/history/:userId, PUT /api/orders/:id/status
// ============================================================

// Đặt hàng mới (Khách hàng)
// orderData: { items: [...], voucher_id, shipping_address, payment_method, points_used }
export const createOrder = (orderData, token) =>
  request("/orders", "POST", orderData, token);

// Lấy lịch sử đơn hàng của một user cụ thể (Khách hàng)
export const getOrderHistory = (userId, token) =>
  request(`/orders/history/${userId}`, "GET", null, token);

// Cập nhật trạng thái đơn hàng (Admin/Staff)
// statusData: { status: "shipping" | "completed" | "cancelled", cancellation_reason? }
export const updateOrderStatus = (orderId, statusData, token) =>
  request(`/orders/${orderId}/status`, "PUT", statusData, token);

// ============================================================
// NHÓM API 6: ĐÁNH GIÁ SẢN PHẨM
// Endpoint: GET /api/reviews/:productId, POST /api/reviews
// ============================================================

// Lấy tất cả đánh giá của một sản phẩm (không cần đăng nhập)
export const getProductReviews = (productId) =>
  request(`/reviews/${productId}`, "GET");

// Gửi đánh giá mới (Khách hàng — chỉ khi đã có đơn "Completed")
// reviewData: { product_id, rating, comment }
export const submitReview = (reviewData, token) =>
  request("/reviews", "POST", reviewData, token);

// ================= ADMIN APIs =================

// Lấy thống kê dashboard
export const getAdminStats = (token) =>
  request("/admin/stats", "GET", null, token);

// Lấy tất cả đơn hàng (admin)
export const getAllOrders = (token) =>
  request("/admin/orders", "GET", null, token);

// Cập nhật trạng thái đơn hàng (admin)
// updateData: { status, cancellation_reason? }
export const updateAdminOrderStatus = (orderId, updateData, token) =>
  request(`/admin/orders/${orderId}/status`, "PUT", updateData, token);

// Lấy nhật ký kho
export const getInventoryLogs = (token) =>
  request("/admin/inventory", "GET", null, token);

// ================= ADMIN PRODUCT APIs =================

// Lấy tất cả sản phẩm (admin)
export const getAdminProducts = (token) =>
  request("/admin/products", "GET", null, token);

// Tạo sản phẩm mới (admin)
// productData: { product_name, product_description, base_price, color, size, stock_quantity, category_id }
// imageFile: File object từ input[type="file"]
export const createProduct = async (productData, imageFile, token) => {
  const formData = new FormData();
  Object.keys(productData).forEach(key => {
    formData.append(key, productData[key]);
  });
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch(`${BASE_URL}/admin/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
  }

  return await response.json();
};

// Cập nhật sản phẩm (admin)
export const updateProduct = async (productId, productData, imageFile, token) => {
  const formData = new FormData();
  Object.keys(productData).forEach(key => {
    formData.append(key, productData[key]);
  });
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch(`${BASE_URL}/admin/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
  }

  return await response.json();
};

// Xóa sản phẩm (admin)
export const deleteProduct = (productId, token) =>
  request(`/admin/products/${productId}`, "DELETE", null, token);
