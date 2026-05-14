// ============================================================
// FILE: src/pages/ProductDetailPage/ProductDetailPage.jsx
// MỤC ĐÍCH: Trang chi tiết sản phẩm.
// Tính năng:
//   - Hiển thị ảnh lớn, tên, giá, màu, size, mô tả
//   - Hiện trạng thái tồn kho (còn hàng / sắp hết / hết hàng)
//   - Nút "Thêm vào giỏ" gọi addToCart() từ CartContext
//   - Hiển thị đánh giá sản phẩm (mock data)
//   - Nếu chưa đăng nhập → nút dẫn về trang login
// ============================================================

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { getProductById, getProductReviews } from "../../services/api";
import { formatPrice } from "../../data/mockData";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { productId } = useParams(); // Lấy ID từ URL: /products/:productId
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  // State sản phẩm và đánh giá
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedMsg, setAddedMsg] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [productRes, reviewsRes] = await Promise.all([
          getProductById(productId),
          getProductReviews(productId),
        ]);

        setProduct(productRes.data || null);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        setError(err.message || "Không lấy được sản phẩm.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="detail-page">
        <div className="container">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="detail-page__not-found">
            {error}
            <br />
            <Link to="/products">← Quay lại danh sách</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="detail-page__not-found">
            Không tìm thấy sản phẩm
            <br />
            <Link to="/products">← Quay lại danh sách</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- TÍNH TRẠNG THÁI TỒN KHO ---
  const getStockStatus = () => {
    if (product.stock_quantity === 0)  return { label: "Hết hàng",    cls: "out" };
    if (product.stock_quantity <= 5)   return { label: `Sắp hết — còn ${product.stock_quantity} sản phẩm`, cls: "low" };
    return { label: `Còn hàng (${product.stock_quantity} sản phẩm)`, cls: "in" };
  };
  const stockStatus = getStockStatus();

  // --- XỬ LÝ THÊM VÀO GIỎ ---
  const handleAddToCart = () => {
    // Chưa đăng nhập → chuyển về login
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    addToCart(product); // Gọi hàm từ CartContext

    // Hiện thông báo thành công trong 2.5 giây rồi ẩn
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  };

  // Helper: render sao đánh giá
  const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div className="detail-page">
      <div className="container">

        <div className="detail-page__grid">

          {/* ========================================
              CỘT TRÁI: ẢNH SẢN PHẨM
          ======================================== */}
          <div className="detail-page__image-col">
            <div className="detail-page__image-wrap">
              <img
                src={product.image_url}
                alt={product.product_name}
                className="detail-page__image"
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x800/e8e5e0/6b6b6b?text=AvQ";
                }}
              />
            </div>
          </div>

          {/* ========================================
              CỘT PHẢI: THÔNG TIN SẢN PHẨM
          ======================================== */}
          <div className="detail-page__info">

            {/* Breadcrumb */}
            <nav className="detail-page__breadcrumb" aria-label="Điều hướng">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <Link to="/products">Sản phẩm</Link>
              <span>/</span>
              <span style={{ color: "var(--color-black)" }}>{product.product_name}</span>
            </nav>

            {/* Tên sản phẩm */}
            <h1 className="detail-page__name display">{product.product_name}</h1>

            {/* Variant: màu + size */}
            <p className="detail-page__variant">
              {product.color} · Size {product.size}
            </p>

            {/* Giá */}
            <div className="detail-page__price">
              {formatPrice(product.base_price)}
            </div>

            <div className="detail-page__divider" />

            {/* Trạng thái tồn kho */}
            <p className={`detail-page__stock ${stockStatus.cls}`}>
              {stockStatus.label}
            </p>

            {/* Nút thêm vào giỏ */}
            <button
              className="btn btn-primary detail-page__add-btn"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
            >
              {!isLoggedIn
                ? "Đăng nhập để mua hàng"
                : product.stock_quantity === 0
                ? "Hết hàng"
                : "Thêm vào giỏ hàng"}
            </button>

            {/* Thông báo thêm thành công */}
            {addedMsg && (
              <p className="detail-page__added-msg">
                ✓ Đã thêm vào giỏ hàng
              </p>
            )}

            <div className="detail-page__divider" />

            {/* Mô tả sản phẩm */}
            <div>
              <div className="detail-page__section-title">Mô tả sản phẩm</div>
              <p className="detail-page__description">
                {product.product_description}
              </p>
            </div>

          </div>
        </div>

        {/* ========================================
            PHẦN ĐÁNH GIÁ (full width, bên dưới)
        ======================================== */}
        <section className="detail-page__reviews">
          <h2 className="detail-page__reviews-title display">
            Đánh giá ({reviews.length})
          </h2>
          <div className="review-list">
            {reviews.length === 0 ? (
              <div className="review-empty">Chưa có đánh giá nào cho sản phẩm này.</div>
            ) : (
              reviews.map((review) => (
                <div key={review.review_id} className="review-item">
                  <div className="review-item__header">
                    <span className="review-item__stars">
                      {renderStars(review.rating)}
                    </span>
                    <span className="review-item__author">
                      {review.full_name}
                    </span>
                    <span className="review-item__date">
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="review-item__comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
