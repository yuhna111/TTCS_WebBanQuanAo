# AvQ — Clothing Store Frontend

Dự án đồ án thực tập: Website bán quần áo streetwear.

## Công nghệ
- React 18 + Vite
- React Router DOM v6
- CSS thuần (không dùng Tailwind/Bootstrap)
- Context API (không dùng Redux)
- Fetch API thuần (không dùng Axios)

## Cài đặt & Chạy
```bash
npm install
npm run dev
```

## Cấu trúc thư mục
```
src/
├── context/          AuthContext, CartContext
├── services/         api.js — tất cả hàm gọi API
├── data/             mockData.js, adminMockData.js
├── components/       Navbar, Footer, ProtectedRoute
├── pages/
│   ├── AuthPage/     Đăng nhập, Đăng ký
│   ├── ProductsPage/ Danh sách sản phẩm
│   ├── ProductDetailPage/
│   ├── CartPage/
│   ├── CheckoutPage/ Voucher + Điểm thưởng + Đặt hàng
│   ├── OrdersPage/   Lịch sử đơn hàng
│   ├── Admin/        Dashboard, Đơn hàng, Kho
│   └── SupportPages/ FAQ, Liên hệ, Chính sách
└── styles/           index.css — global CSS variables
```

## Ảnh sản phẩm
Đặt ảnh vào `public/images/products/` theo tên file trong mockData.js
- Kích thước khuyến nghị: 600×800px (tỉ lệ 3:4)
- Hero banner: `public/images/hero/hero-main.jpg` (1400×900px)
