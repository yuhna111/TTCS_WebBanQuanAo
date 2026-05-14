# Hệ Thống Cửa Hàng Bán Quần Áo

Dự án đồ án thực tập: Một nền tảng e-commerce full-stack dành cho thương hiệu thời trang streetwear Việt Nam.

**Frontend:**
* React 18 + Vite
* React Router DOM v6
* CSS thuần (không dùng Tailwind/Bootstrap)
* Context API (không dùng Redux)
* Fetch API thuần (không dùng Axios)

**Backend:**
* Node.js
* Express
* JWT

**Database:**
* MySQL

## Mục Lục

* Tổng Quan Hệ Thống
* Phân Tích Yêu Cầu Và Thiết Kế Hệ Thống
* Kiến Trúc Và Công Nghệ Áp Dụng
* Thiết Kế Cơ Sở Dữ Liệu (Database Schema)
* Luồng Hoạt Động Chính Của Hệ Thống
* Danh Sách Giao Diện Lập Trình Ứng Dụng (Api Endpoints)
* Mô Hình Chức Năng - Biểu Đồ Tuần Tự
* Các Giải Pháp Kỹ Thuật Nổi Bật

## Tổng Quan

**Hệ thống bao gồm:**
* Khám phá và tìm kiếm danh mục sản phẩm quần áo streetwear
* Luồng đăng nhập và đăng ký người dùng an toàn
* Phân quyền tài khoản: Khách hàng (Customer) và Quản trị viên (Admin)
* Xác thực bảo mật sử dụng JWT
* Quản lý hình ảnh sản phẩm
* Quản lý giỏ hàng và xử lý đơn hàng
* Hệ thống mã giảm giá (Voucher)
* Hệ thống đánh giá sản phẩm từ khách hàng
* Cập nhật thông tin hồ sơ cá nhân

## Tính Năng Nổi Bật

* Kiến trúc Frontend hiện đại, tối ưu tốc độ với Vite và React 18
* Điều hướng phía client mượt mà với react-router-dom v6
* Quản lý State toàn cục bằng Context API (Không sử dụng Redux)
* Tích hợp gọi API bằng Fetch API thuần (Không sử dụng Axios)
* Giao diện được xây dựng bằng CSS thuần, không phụ thuộc vào Tailwind hay Bootstrap
* Phân quyền truy cập các endpoint API rõ ràng giữa Admin và Khách hàng
* Mã hóa mật khẩu bảo mật với bcrypt
* Xử lý upload file (hình ảnh sản phẩm) thông qua multer
* Tương tác trực tiếp với cơ sở dữ liệu MySQL thông qua các câu lệnh truy vấn SQL thuần

## Công Nghệ Sử Dụng

**Frontend:**
* React 18 + Vite 5
* React Router DOM v6
* Context API (State Management - Không sử dụng Redux)
* Fetch API thuần (Không sử dụng Axios)
* CSS thuần (Không sử dụng Tailwind/Bootstrap)

**Backend:**
* Node.js
* Express 5
* MySQL2
* JSON Web Token
* bcrypt
* Multer 

## Cấu Trúc Dự Án

```text
.
├── backend/
│   ├── config/
│   │   └── db.js                # Cấu hình kết nối MySQL (Hardcode thông tin tại đây)
│   ├── controllers/             # Logic xử lý và các truy vấn SQL thuần
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── reviewController.js
│   │   └── voucherController.js
│   ├── middlewares/             # Các Middleware chặn và kiểm tra request
│   │   ├── authMiddleware.js    # Xác thực JWT
│   │   └── uploadMiddleware.js  # Cấu hình Multer lưu ảnh
│   ├── routes/                  # Định nghĩa các endpoint API
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── voucherRoutes.js
│   ├── server.js                # File chạy server gốc
│   └── package.json
├── frontend/
│   ├── public/                  # Lưu trữ file tĩnh (vd: /images/products, hero-main.jpg)
│   ├── src/
│   │   ├── components/          # Navbar, Footer, ProtectedRoute
│   │   ├── context/             # AuthContext, CartContext
│   │   ├── data/                # mockData.js, adminMockData.js
│   │   ├── pages/               # Trang giao diện (AuthPage, ProductsPage, CartPage, Admin...)
│   │   ├── services/            # api.js (Chứa tất cả các hàm gọi API)
│   │   └── styles/              # index.css (Biến CSS toàn cục)
│   ├── index.html               
│   ├── .env                     # Biến môi trường frontend
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Hướng Dẫn Cài Đặt

### 1. Cài đặt thư viện

```bash
# Cài đặt cho Backend
cd backend
npm install

# Cài đặt cho Frontend
cd ../frontend
npm install
```

### 2. Khởi chạy Backend

```bash
cd ../backend
npm run dev
```

### 3. Khởi chạy Frontend

```bash
cd ../frontend
npm run dev
```

**Đường dẫn mặc định:**
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:3000`

---

## Biến Môi Trường

### Frontend (`frontend/.env`)
Thiết lập đường dẫn tới Backend API để gọi dữ liệu (thay đổi khi deploy thực tế):

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Kết Nối Cơ Sở Dữ Liệu

Hãy chắc chắn rằng máy bạn đã cài đặt và đang chạy dịch vụ MySQL.

1. **Bước 1: Thiết lập Database**
   Tạo một cơ sở dữ liệu trên MySQL local của bạn. Chạy file script SQL của dự án để tạo các bảng cần thiết (`users`, `products`, `categories`, `orders`, `reviews`, `vouchers`).

2. **Bước 2: Cập nhật thông tin kết nối**
   Dự án này cấu hình database trực tiếp trong code. Mở file `backend/config/db.js` và điền thông tin:
   * `user`: Tên tài khoản MySQL
   * `password`: Mật khẩu MySQL
   * `database`: Tên cơ sở dữ liệu đã tạo

3. **Bước 3: Tùy chỉnh Truy vấn**
   Tất cả các câu lệnh SQL thuần được viết và quản lý trực tiếp bên trong các hàm tại thư mục `backend/controllers/`.

---

## Danh Sách API

### Xác thực (`authRoutes.js`)
* `POST /api/auth/register` (Đăng ký)
* `POST /api/auth/login` (Đăng nhập)

### Sản phẩm (`productRoutes.js`)
* `GET /api/products`
* `GET /api/products/:id`
* `POST /api/products` (**Admin** - Xử lý upload ảnh qua `uploadMiddleware`)
* `PUT /api/products/:id` (**Admin**)
* `DELETE /api/products/:id` (**Admin**)

### Danh mục (`categoryRoutes.js`)
* `GET /api/categories`
* `POST /api/categories` (**Admin**)

### Đơn hàng (`orderRoutes.js`)
* `POST /api/orders` (Cần đăng nhập)
* `GET /api/orders/my-orders` (Cần đăng nhập)
* `GET /api/orders` (**Admin** - Xem toàn bộ đơn hàng)

### Đánh giá (`reviewRoutes.js`)
* `GET /api/reviews/product/:productId`
* `POST /api/reviews` (Cần đăng nhập)

### Mã giảm giá (`voucherRoutes.js`)
* `GET /api/vouchers`
* `POST /api/vouchers/apply` (Cần đăng nhập)

---

## Tài Khoản Demo

Nếu bạn đã nạp dữ liệu mẫu (mock data) vào database, có thể sử dụng các tài khoản sau:

* **Quản trị viên (Admin):**
  * Email: `abc`
  * Mật khẩu: `123`
* **Khách hàng (Customer):**
  * Email: `xyz`
  * Mật khẩu: `789`

---

## Lưu Ý Quá Trình Phát Triển

* **Hình ảnh sản phẩm:** Nên đặt hình ảnh trực tiếp vào thư mục `frontend/public/images/products/` theo tên file khai báo trong `mockData.js`. Kích thước ảnh khuyến nghị là **600x800px** (tỉ lệ 3:4) và Hero banner là **1400x900px**.
* **Cấu hình Upload:** Đối với tính năng upload ảnh từ Admin, đảm bảo thư mục lưu trữ tĩnh bên backend đã được cấu hình chính xác qua file `uploadMiddleware.js`.
* **CORS:** Đảm bảo file cấu hình server Express bên backend cho phép nhận các request từ đường dẫn gốc của Vite (`http://localhost:5173`).
* **Gitignore:** Các thư mục sinh tự động như `node_modules`, `dist` và các file cấu hình môi trường local (`.env.local`) đã được thiết lập sẵn trong `.gitignore` để tránh bị đẩy lên repository.
