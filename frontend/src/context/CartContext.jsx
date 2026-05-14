// ============================================================
// FILE: src/context/CartContext.jsx
// MỤC ĐÍCH: Quản lý toàn bộ logic giỏ hàng:
//   - Thêm / xóa / cập nhật số lượng sản phẩm
//   - Tính tổng tiền, phí ship, số tiền sau giảm giá
//   - Logic đếm ngược 15 phút khi áp dụng mã giảm giá (Voucher)
// ============================================================

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const CartContext = createContext(null);

// Hằng số: thời gian giữ voucher = 15 phút = 900 giây
const VOUCHER_HOLD_SECONDS = 15 * 60;

// Phí ship cố định (có thể tính động tùy dự án)
const SHIPPING_FEE = 30000; // 30.000 VNĐ

export function CartProvider({ children }) {
  // -------------------------------------------------------
  // STATE 1: Danh sách sản phẩm trong giỏ hàng
  // Mỗi item có dạng:
  // {
  //   product_id, product_name, base_price,
  //   color, size, image_url,
  //   quantity   ← số lượng người dùng chọn
  // }
  // -------------------------------------------------------
  const [cartItems, setCartItems] = useState([]);

  // -------------------------------------------------------
  // STATE 2: Voucher đang được áp dụng
  // Khi user nhập mã và backend xác nhận hợp lệ → lưu vào đây
  // null = chưa áp dụng mã nào
  // -------------------------------------------------------
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  // Ví dụ appliedVoucher:
  // {
  //   voucher_id: 3,
  //   voucher_code: "SALE20",
  //   discount_type: "percent",   // hoặc "fixed"
  //   discount_value: 20          // 20% hoặc 20.000đ
  // }

  // -------------------------------------------------------
  // STATE 3: Đồng hồ đếm ngược (đơn vị: giây)
  // Bắt đầu từ 900 (15 phút), đếm ngược về 0
  // Khi về 0 → tự động hủy voucher (trả mã về kho)
  // -------------------------------------------------------
  const [voucherCountdown, setVoucherCountdown] = useState(0);

  // useRef lưu ID của setInterval để có thể clearInterval sau
  // Dùng ref thay vì state vì không cần re-render khi ID thay đổi
  const countdownTimerRef = useRef(null);

  // -------------------------------------------------------
  // DỌN DẸP: Hủy timer khi component bị unmount
  // Tránh memory leak (timer chạy ngầm sau khi component biến mất)
  // -------------------------------------------------------
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // ============================================================
  // NHÓM HÀM 1: QUẢN LÝ GIỎ HÀNG
  // ============================================================

  // -------------------------------------------------------
  // Thêm sản phẩm vào giỏ hàng
  // - Nếu sản phẩm đã tồn tại (cùng product_id, color, size) → tăng số lượng
  // - Nếu chưa có → thêm mới với quantity = 1
  // -------------------------------------------------------
  const addToCart = useCallback((product) => {
    setCartItems((prevItems) => {
      // Tìm xem sản phẩm (cùng màu + size) đã có trong giỏ chưa
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product_id === product.product_id &&
          item.color === product.color &&
          item.size === product.size
      );

      if (existingIndex !== -1) {
        // Đã có → tạo mảng mới với quantity được tăng lên
        const updatedItems = [...prevItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1,
        };
        return updatedItems;
      } else {
        // Chưa có → thêm mới với quantity = 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  }, []);

  // -------------------------------------------------------
  // Xóa sản phẩm khỏi giỏ hàng (xóa hoàn toàn dù quantity > 1)
  // -------------------------------------------------------
  const removeFromCart = useCallback((productId, color, size) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.product_id === productId &&
            item.color === color &&
            item.size === size)
      )
    );
  }, []);

  // -------------------------------------------------------
  // Cập nhật số lượng sản phẩm
  // Nếu newQuantity <= 0 → tự động xóa khỏi giỏ
  // -------------------------------------------------------
  const updateQuantity = useCallback((productId, color, size, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product_id === productId &&
        item.color === color &&
        item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, [removeFromCart]);

  // -------------------------------------------------------
  // Xóa toàn bộ giỏ hàng (dùng sau khi đặt hàng thành công)
  // -------------------------------------------------------
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // ============================================================
  // NHÓM HÀM 2: TÍNH TOÁN GIÁ TRỊ ĐƠN HÀNG
  // ============================================================

  // Tính tổng tiền hàng (chưa giảm, chưa cộng ship)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.base_price * item.quantity,
    0
  );

  // Tính số tiền được giảm dựa trên loại voucher
  const discountAmount = (() => {
    if (!appliedVoucher) return 0;

    if (appliedVoucher.discount_type === "percent") {
      // Giảm theo % trên tổng tiền hàng
      return Math.floor((subtotal * appliedVoucher.discount_value) / 100);
    } else if (appliedVoucher.discount_type === "fixed") {
      // Giảm số tiền cố định, không được giảm quá tổng tiền hàng
      return Math.min(appliedVoucher.discount_value, subtotal);
    }
    return 0;
  })();

  // Tổng tiền cuối cùng = tiền hàng - giảm giá + phí ship
  const finalAmount = subtotal - discountAmount + (cartItems.length > 0 ? SHIPPING_FEE : 0);

  // Tổng số lượng sản phẩm trong giỏ (dùng hiển thị badge trên icon giỏ hàng)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ============================================================
  // NHÓM HÀM 3: LOGIC VOUCHER VÀ ĐẾM NGƯỢC 15 PHÚT
  // ============================================================

  // -------------------------------------------------------
  // Áp dụng voucher sau khi backend xác nhận hợp lệ
  //
  // LUỒNG HOẠT ĐỘNG (theo báo cáo):
  // 1. User nhập mã → gọi API POST /api/vouchers/apply
  // 2. Backend kiểm tra: còn hiệu lực? đủ giá trị đơn tối thiểu?
  // 3. Nếu hợp lệ → backend trả về thông tin voucher
  // 4. Frontend gọi applyVoucher(voucherData) → lưu voucher + bắt đầu đếm ngược
  // 5. Sau 15 phút mà chưa thanh toán → hủy voucher, trả mã về kho
  // -------------------------------------------------------
  const applyVoucher = useCallback((voucherData) => {
    // Hủy timer cũ nếu đang chạy (trường hợp đổi mã)
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    // Lưu thông tin voucher vào state
    setAppliedVoucher(voucherData);

    // Bắt đầu đếm ngược từ 900 giây (15 phút)
    setVoucherCountdown(VOUCHER_HOLD_SECONDS);

    // setInterval chạy mỗi 1 giây → giảm countdown đi 1
    countdownTimerRef.current = setInterval(() => {
      setVoucherCountdown((prevSeconds) => {
        if (prevSeconds <= 1) {
          // Hết giờ → hủy timer và xóa voucher
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          setAppliedVoucher(null); // Trả mã về kho (backend xử lý thực sự)

          // Thông báo cho người dùng (có thể thay bằng toast notification)
          alert("Mã giảm giá đã hết thời gian giữ chỗ. Vui lòng áp dụng lại.");
          return 0;
        }
        return prevSeconds - 1; // Giảm 1 giây
      });
    }, 1000); // Chạy mỗi 1000ms = 1 giây
  }, []);

  // -------------------------------------------------------
  // Hủy voucher thủ công (user bấm nút "Xóa mã")
  // -------------------------------------------------------
  const removeVoucher = useCallback(() => {
    // Dừng timer đếm ngược
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setAppliedVoucher(null);
    setVoucherCountdown(0);
    // Lưu ý: cần gọi thêm API để backend "trả" mã giảm giá về kho
  }, []);

  // -------------------------------------------------------
  // Tiện ích: Format đồng hồ đếm ngược thành "MM:SS"
  // Dùng để hiển thị trực tiếp trên giao diện
  // Ví dụ: 754 giây → "12:34"
  // -------------------------------------------------------
  const formatCountdown = () => {
    const minutes = Math.floor(voucherCountdown / 60);
    const seconds = voucherCountdown % 60;
    // padStart(2, "0") đảm bảo luôn hiển thị 2 chữ số: "09" thay vì "9"
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // -------------------------------------------------------
  // Đóng gói tất cả dữ liệu và hàm để chia sẻ cho toàn app
  // -------------------------------------------------------
  const value = {
    // Dữ liệu giỏ hàng
    cartItems,          // mảng sản phẩm trong giỏ
    totalItems,         // tổng số lượng (dùng hiện badge)

    // Hàm thao tác giỏ hàng
    addToCart,          // thêm sản phẩm
    removeFromCart,     // xóa sản phẩm
    updateQuantity,     // sửa số lượng
    clearCart,          // xóa toàn bộ giỏ

    // Tính tiền
    subtotal,           // tiền hàng trước giảm
    discountAmount,     // số tiền được giảm
    shippingFee: cartItems.length > 0 ? SHIPPING_FEE : 0, // phí ship
    finalAmount,        // tổng tiền cuối phải trả

    // Voucher
    appliedVoucher,     // thông tin voucher đang dùng (null nếu chưa có)
    applyVoucher,       // áp dụng voucher mới
    removeVoucher,      // hủy voucher

    // Đồng hồ đếm ngược
    voucherCountdown,   // số giây còn lại (dạng số)
    formatCountdown,    // hàm trả về chuỗi "MM:SS" để hiển thị
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// -------------------------------------------------------
// Custom Hook useCart()
// Cách dùng trong component:
//   const { cartItems, addToCart, finalAmount } = useCart();
// -------------------------------------------------------
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart() phải được dùng bên trong <CartProvider>");
  }

  return context;
}

export default CartContext;
