// ============================================================
// FILE: src/pages/SupportPages/ContactFAQPages.jsx
// Trang Liên hệ + Trang FAQ (Accordion)
// ============================================================

import { useState } from "react";
import "./SupportPages.css";

// ============================================================
// TRANG LIÊN HỆ
// ============================================================
export function ContactPage() {
  const [form, setForm] = useState({ full_name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.message) return;
    setLoading(true);
    // Giả lập gửi (thay bằng API thật)
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <div className="support-page">
      <div className="container">

        <div className="support-page__hero">
          <div className="support-page__label">Hỗ trợ</div>
          <h1 className="support-page__title display">Liên hệ với AvQ</h1>
        </div>

        <div className="contact-grid">

          {/* ---- FORM GỬI TIN ---- */}
          <div>
            {sent ? (
              <div className="support-highlight">
                <p>
                  ✓ Tin nhắn đã gửi thành công. Chúng tôi sẽ phản hồi trong vòng 24 giờ.
                </p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="full_name">Họ và tên</label>
                  <input
                    id="full_name" name="full_name" type="text"
                    placeholder="Nguyễn Văn A"
                    value={form.full_name} onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email" name="email" type="email"
                    placeholder="ten@email.com"
                    value={form.email} onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Chủ đề</label>
                  <input
                    id="subject" name="subject" type="text"
                    placeholder="Hỏi về đơn hàng, size áo..."
                    value={form.subject} onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Nội dung</label>
                  <textarea
                    id="message" name="message"
                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                    value={form.message} onChange={handleChange}
                    rows={5}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary contact-form__submit"
                  disabled={loading}
                >
                  {loading ? "Đang gửi..." : "Gửi tin nhắn"}
                </button>
              </form>
            )}
          </div>

          {/* ---- THÔNG TIN LIÊN HỆ + BẢN ĐỒ ---- */}
          <div>
            <div className="contact-info">
              <div className="contact-info__item">
                <div className="contact-info__label">Email hỗ trợ</div>
                <div className="contact-info__value">hello@avq.vn</div>
              </div>
              <div className="contact-info__item">
                <div className="contact-info__label">Hotline</div>
                <div className="contact-info__value">0901 234 567 (9h – 21h hàng ngày)</div>
              </div>
              <div className="contact-info__item">
                <div className="contact-info__label">Giờ làm việc</div>
                <div className="contact-info__value">Thứ 2 – Chủ Nhật, 9:00 – 21:00</div>
              </div>
              <div className="contact-info__item">
                <div className="contact-info__label">Showroom</div>
                <div className="contact-info__value">
                  123 Nguyễn Trãi, Phường Bến Thành<br />
                  Quận 1, TP. Hồ Chí Minh
                </div>
              </div>
            </div>

            {/* Google Maps embed đơn giản — grayscale qua CSS */}
            <div className="map-embed">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4946681281956!2d106.69516307465743!3d10.774552289382928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e71%3A0xa5777fb3a5a65b!2zQuG6v24gVGjDoG5oIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2s!4v1716000000000!5m2!1svi!2s"
                title="Bản đồ showroom AvQ"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================
// DỮ LIỆU FAQ
// Thêm câu hỏi mới: thêm vào mảng đúng category
// ============================================================
const FAQ_DATA = [
  {
    category: "size",
    label: "Chọn size",
    questions: [
      {
        q: "Làm sao để biết size mình mặc vừa?",
        a: (
          <>
            <p>AvQ dùng hệ size Việt Nam chuẩn S/M/L/XL. Cách đo cơ bản:</p>
            <ul>
              <li><strong>S</strong> — Ngực 82–87cm / Vai 40cm / Cao dưới 165cm</li>
              <li><strong>M</strong> — Ngực 88–93cm / Vai 42cm / Cao 165–172cm</li>
              <li><strong>L</strong> — Ngực 94–99cm / Vai 44cm / Cao 172–178cm</li>
              <li><strong>XL</strong> — Ngực 100–106cm / Vai 46cm / Cao trên 178cm</li>
            </ul>
            <p>Đa số sản phẩm AvQ có phom oversize — nếu muốn vừa vặn hơn, nên chọn xuống 1 size.</p>
          </>
        ),
      },
      {
        q: "Áo hoodie và áo thun có bị co sau khi giặt không?",
        a: (
          <p>
            Vải cotton của AvQ đã qua xử lý preshrunk — co tối đa 2–3% sau lần giặt đầu.
            Khuyến nghị giặt lạnh 30°C, lộn trái áo, không sấy nóng để giữ form và màu sắc lâu dài.
          </p>
        ),
      },
      {
        q: "Size quần jean tính theo gì?",
        a: (
          <>
            <p>Quần jean AvQ dùng size số (28, 30, 32) tương ứng với vòng eo inch:</p>
            <ul>
              <li>28 — Eo khoảng 68–72cm</li>
              <li>30 — Eo khoảng 74–78cm</li>
              <li>32 — Eo khoảng 80–84cm</li>
            </ul>
            <p>Quần có phom baggy nên eo nằm ở khoảng giữa mức trên là vừa đẹp.</p>
          </>
        ),
      },
    ],
  },
  {
    category: "order",
    label: "Đơn hàng",
    questions: [
      {
        q: "Làm sao để theo dõi đơn hàng của tôi?",
        a: (
          <p>
            Đăng nhập tài khoản AvQ → vào mục <strong>Đơn hàng của tôi</strong>.
            Mỗi đơn có trạng thái cập nhật theo thời gian thực: Chờ xác nhận → Đã xác nhận
            → Đang giao → Hoàn thành. Sau khi bàn giao vận chuyển, AvQ sẽ gửi mã vận đơn qua email.
          </p>
        ),
      },
      {
        q: "Tôi có thể hủy đơn hàng sau khi đặt không?",
        a: (
          <p>
            Có thể hủy nếu đơn hàng vẫn ở trạng thái <strong>Chờ xác nhận</strong>.
            Liên hệ AvQ ngay qua hotline hoặc email. Sau khi đơn đã chuyển sang
            <strong> Đang giao</strong>, không thể hủy — vui lòng từ chối nhận hàng
            và liên hệ để được hỗ trợ đổi trả.
          </p>
        ),
      },
      {
        q: "Đặt hàng xong bao lâu thì nhận được?",
        a: (
          <>
            <p>Thời gian giao hàng sau khi xác nhận đơn:</p>
            <ul>
              <li>TP.HCM & Hà Nội: 1–2 ngày làm việc</li>
              <li>Các tỉnh thành khác: 2–5 ngày làm việc</li>
            </ul>
            <p>Thứ 7, Chủ Nhật và ngày lễ không tính vào ngày làm việc.</p>
          </>
        ),
      },
    ],
  },
  {
    category: "payment",
    label: "Thanh toán",
    questions: [
      {
        q: "Shop có ship COD không?",
        a: (
          <p>
            Có. AvQ hỗ trợ <strong>COD (thanh toán khi nhận hàng)</strong> toàn quốc.
            Bạn chỉ trả tiền khi shipper giao tận tay, sau khi đã kiểm tra hàng.
          </p>
        ),
      },
      {
        q: "Có những phương thức thanh toán nào?",
        a: (
          <>
            <p>AvQ hỗ trợ 3 phương thức:</p>
            <ul>
              <li><strong>COD</strong> — Thanh toán tiền mặt khi nhận hàng</li>
              <li><strong>Chuyển khoản ngân hàng</strong> — QR Pay qua VietQR</li>
              <li><strong>Ví điện tử</strong> — MoMo, ZaloPay</li>
            </ul>
          </>
        ),
      },
      {
        q: "Mã giảm giá (voucher) dùng như thế nào?",
        a: (
          <p>
            Tại trang thanh toán, nhập mã vào ô <strong>Mã giảm giá</strong> và bấm
            Áp dụng. Hệ thống tự động kiểm tra điều kiện (giá trị đơn tối thiểu, thời hạn
            hiệu lực) và trừ thẳng vào tổng tiền. Mã được giữ trong{" "}
            <strong>15 phút</strong> — hoàn thành thanh toán trong thời gian đó để không bị mất mã.
          </p>
        ),
      },
      {
        q: "Điểm tích lũy là gì và dùng như thế nào?",
        a: (
          <p>
            Mỗi đơn hàng hoàn thành, bạn nhận điểm tương đương 1% giá trị đơn.
            1 điểm = 1.000đ khi áp dụng ở trang thanh toán. Điểm không có thời hạn sử dụng
            và có thể tích lũy không giới hạn.
          </p>
        ),
      },
    ],
  },
];

// ============================================================
// TRANG FAQ
// ============================================================
export function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("size");
  const [openId, setOpenId] = useState(null); // "categoryIndex-questionIndex"

  const currentCategory = FAQ_DATA.find(c => c.category === activeCategory);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="support-page">
      <div className="container">

        <div className="support-page__hero">
          <div className="support-page__label">Hỗ trợ</div>
          <h1 className="support-page__title display">Câu hỏi thường gặp</h1>
        </div>

        {/* Tabs lọc theo nhóm câu hỏi */}
        <div className="faq-tabs">
          {FAQ_DATA.map(cat => (
            <button
              key={cat.category}
              className={"faq-tab" + (activeCategory === cat.category ? " active" : "")}
              onClick={() => { setActiveCategory(cat.category); setOpenId(null); }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="faq-list">
          {currentCategory?.questions.map((item, idx) => {
            const id = `${activeCategory}-${idx}`;
            const isOpen = openId === id;
            return (
              <div key={id} className={"faq-item" + (isOpen ? " open" : "")}>
                <button className="faq-trigger" onClick={() => toggle(id)}>
                  <span className="faq-trigger__question">{item.q}</span>
                  <span className="faq-trigger__icon">+</span>
                </button>
                <div className="faq-answer">
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
