// ============================================================
// FILE: src/pages/SupportPages/PolicyPages.jsx
// Ba trang chính sách: Đổi trả / Vận chuyển / Bảo mật
// Export 3 component riêng dùng chung 1 file để gọn
// ============================================================

import "./SupportPages.css";

// ---- LAYOUT WRAPPER dùng chung ----
function PolicyLayout({ label, title, updated, children }) {
  return (
    <div className="support-page">
      <div className="container">
        <div className="support-page__hero">
          <div className="support-page__label">{label}</div>
          <h1 className="support-page__title display">{title}</h1>
          <div className="support-page__updated">Cập nhật lần cuối: {updated}</div>
        </div>
        <div className="support-prose">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// TRANG 1: CHÍNH SÁCH ĐỔI TRẢ
// ============================================================
export function ReturnPolicyPage() {
  return (
    <PolicyLayout
      label="Chính sách"
      title="Đổi trả & Hoàn tiền"
      updated="01/05/2025"
    >
      <div className="support-highlight">
        <p>
          AvQ cam kết đổi trả miễn phí trong vòng <strong>7 ngày</strong> kể từ ngày
          nhận hàng nếu sản phẩm có lỗi do nhà sản xuất hoặc giao sai sản phẩm.
        </p>
      </div>

      <div>
        <div className="support-section__title">Điều kiện đổi trả</div>
        <ul>
          <li>Sản phẩm còn nguyên tem, nhãn, chưa qua giặt hoặc sử dụng.</li>
          <li>Còn trong thời hạn 7 ngày kể từ ngày giao hàng thành công.</li>
          <li>Có hóa đơn mua hàng hoặc mã đơn từ hệ thống AvQ.</li>
          <li>Lỗi do nhà sản xuất: đường may hở, vải bị lỗi, in lem mực, sai size so với thông tin sản phẩm.</li>
        </ul>
      </div>

      <div>
        <div className="support-section__title">Trường hợp không được đổi trả</div>
        <ul>
          <li>Sản phẩm đã qua sử dụng, giặt, hoặc có dấu hiệu hư hỏng do người dùng.</li>
          <li>Không ưng màu sắc sau khi nhận hàng (đã hiển thị rõ trên website).</li>
          <li>Quá 7 ngày kể từ ngày nhận.</li>
          <li>Sản phẩm thuộc danh mục Accessories (vớ, beanie) vì lý do vệ sinh.</li>
        </ul>
      </div>

      <div>
        <div className="support-section__title">Quy trình đổi trả</div>
        <ul>
          <li><strong>Bước 1:</strong> Liên hệ AvQ qua email hoặc trang Liên hệ trong vòng 7 ngày.</li>
          <li><strong>Bước 2:</strong> Gửi ảnh sản phẩm lỗi và mã đơn hàng để xác nhận.</li>
          <li><strong>Bước 3:</strong> AvQ xét duyệt trong 1–2 ngày làm việc và gửi nhãn hoàn trả miễn phí.</li>
          <li><strong>Bước 4:</strong> Khách gửi sản phẩm về. Sau khi nhận và kiểm tra, AvQ giao hàng thay thế hoặc hoàn tiền.</li>
        </ul>
      </div>

      <div>
        <div className="support-section__title">Hoàn tiền</div>
        <p>
          Hoàn tiền qua phương thức thanh toán ban đầu trong vòng <strong>3–5 ngày làm việc</strong> sau khi
          sản phẩm được nhận và kiểm tra. Đối với COD, AvQ sẽ chuyển khoản trực tiếp theo thông tin
          tài khoản khách cung cấp.
        </p>
      </div>
    </PolicyLayout>
  );
}

// ============================================================
// TRANG 2: CHÍNH SÁCH VẬN CHUYỂN
// ============================================================
export function ShippingPolicyPage() {
  return (
    <PolicyLayout
      label="Chính sách"
      title="Vận chuyển & Giao hàng"
      updated="01/05/2025"
    >
      <div className="support-highlight">
        <p>
          Phí vận chuyển đồng giá <strong>30.000đ</strong> toàn quốc.
          Miễn phí ship cho đơn hàng từ <strong>1.000.000đ</strong> trở lên.
        </p>
      </div>

      <div>
        <div className="support-section__title">Bảng phí và thời gian giao hàng</div>
        <div className="admin-table-wrap">
          <table className="support-table">
            <thead>
              <tr>
                <th>Khu vực</th>
                <th>Thời gian dự kiến</th>
                <th>Phí ship</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>TP. Hồ Chí Minh & Hà Nội</td>
                <td>1 – 2 ngày làm việc</td>
                <td>30.000đ</td>
              </tr>
              <tr>
                <td>Miền Đông & Tây Nam Bộ</td>
                <td>2 – 3 ngày làm việc</td>
                <td>30.000đ</td>
              </tr>
              <tr>
                <td>Miền Trung</td>
                <td>3 – 4 ngày làm việc</td>
                <td>30.000đ</td>
              </tr>
              <tr>
                <td>Miền Bắc (ngoài Hà Nội)</td>
                <td>3 – 5 ngày làm việc</td>
                <td>30.000đ</td>
              </tr>
              <tr>
                <td>Hải đảo, vùng sâu xa</td>
                <td>5 – 7 ngày làm việc</td>
                <td>30.000đ</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: "var(--color-gray-4)" }}>
          * Thời gian tính từ khi đơn được xác nhận và bàn giao cho đơn vị vận chuyển,
          không tính ngày lễ/Tết.
        </p>
      </div>

      <div>
        <div className="support-section__title">Theo dõi đơn hàng</div>
        <p>
          Sau khi đơn được bàn giao vận chuyển, AvQ sẽ gửi mã vận đơn qua email đăng ký.
          Bạn cũng có thể theo dõi trạng thái trong mục <strong>Đơn hàng của tôi</strong>
          trên tài khoản AvQ.
        </p>
      </div>

      <div>
        <div className="support-section__title">Lưu ý quan trọng</div>
        <ul>
          <li>AvQ không chịu trách nhiệm về chậm trễ do thiên tai, thời tiết, hoặc lỗi bên vận chuyển.</li>
          <li>Kiểm tra hàng trước khi ký nhận. Nếu kiện hàng bị móp méo hay bóc mở, từ chối nhận và báo AvQ ngay.</li>
          <li>Địa chỉ giao hàng không thể thay đổi sau khi đơn đã được xác nhận.</li>
        </ul>
      </div>
    </PolicyLayout>
  );
}

// ============================================================
// TRANG 3: CHÍNH SÁCH BẢO MẬT
// ============================================================
export function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      label="Chính sách"
      title="Bảo mật thông tin"
      updated="01/05/2025"
    >
      <div>
        <div className="support-section__title">Thông tin chúng tôi thu thập</div>
        <ul>
          <li>Thông tin đăng ký: họ tên, email, số điện thoại, địa chỉ giao hàng.</li>
          <li>Lịch sử mua hàng và tương tác trên website.</li>
          <li>Thông tin thiết bị và địa chỉ IP khi truy cập (phục vụ bảo mật hệ thống).</li>
        </ul>
      </div>

      <div>
        <div className="support-section__title">Mục đích sử dụng</div>
        <ul>
          <li>Xử lý đơn hàng, xác nhận thanh toán và giao hàng.</li>
          <li>Gửi thông báo trạng thái đơn hàng và cập nhật sản phẩm mới.</li>
          <li>Cải thiện trải nghiệm người dùng trên nền tảng AvQ.</li>
          <li>Phát hiện và ngăn chặn gian lận, bảo vệ tài khoản.</li>
        </ul>
      </div>

      <div>
        <div className="support-section__title">Bảo mật dữ liệu</div>
        <p>
          Mật khẩu tài khoản được mã hóa một chiều bằng thuật toán <strong>Bcrypt</strong> —
          AvQ không thể đọc mật khẩu gốc của bạn. Mọi giao dịch đều được xác thực
          qua <strong>JWT Token</strong> có thời hạn giới hạn.
        </p>
        <p>
          Dữ liệu được lưu trữ trên máy chủ bảo mật, không chia sẻ với bên thứ ba vì
          mục đích thương mại. Chỉ các đối tác vận chuyển và cổng thanh toán được tiếp cận
          thông tin tối thiểu cần thiết để thực hiện dịch vụ.
        </p>
      </div>

      <div>
        <div className="support-section__title">Quyền của bạn</div>
        <ul>
          <li>Yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân bất kỳ lúc nào.</li>
          <li>Hủy đăng ký nhận email thông báo qua link trong mỗi email.</li>
          <li>Liên hệ trực tiếp nếu phát hiện thông tin bị sử dụng trái phép.</li>
        </ul>
      </div>

      <div className="support-highlight">
        <p>
          Mọi thắc mắc về chính sách bảo mật, liên hệ:{" "}
          <strong>privacy@avq.vn</strong>
        </p>
      </div>
    </PolicyLayout>
  );
}
