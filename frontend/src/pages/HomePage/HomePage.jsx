// ============================================================
// FILE: src/pages/HomePage/HomePage.jsx
// MỤC ĐÍCH: Trang chủ - Hero section + 3 sản phẩm nổi bật
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/api";
import { formatPrice, CATEGORIES } from "../../data/mockData";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        // Lấy 3 sản phẩm đầu tiên làm "featured"
        setProducts((response.data || []).slice(0, 3));
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Helper: lookup category_name từ category_id
  const getCategoryName = (categoryId) => {
    const category = CATEGORIES.find(c => c.category_id === categoryId);
    return category ? category.category_name : "Accessory";
  };

  return (
    <div className="home-page">
      {/* ============================================
          HERO SECTION — Lớp nền, tiêu đề lớn
      ============================================ */}
      <section className="hero-section">
        {/* Bên trái: Quote */}
        <div className="hero-section__left">
          <div className="hero-section__quote">
            <p className="hero-section__quote-text">Feel the beat</p>
            <p className="hero-section__quote-author">— AVQ FASHION</p>
          </div>
        </div>

        {/* Bên phải: Background (để thay ảnh) */}
        <div className="hero-section__right">
          <div className="hero-section__background">
            <img 
              src="https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=1200&h=600&fit=crop&q=80" 
              alt="AvQ Streetwear Hero"
              className="hero-section__image"
            />
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED PRODUCTS — 3 sản phẩm nổi bật
      ============================================ */}
      <section className="featured-section">
        <div className="container">
          <div className="featured-section__header">
            <h2 className="featured-section__title">Sản phẩm nổi bật</h2>
            <p className="featured-section__subtitle">
              Những item nhất định phải có trong tủ quần áo của bạn
            </p>
          </div>

          {loading ? (
            <div className="featured-section__loading">Đang tải...</div>
          ) : products.length === 0 ? (
            <div className="featured-section__empty">
              Chưa có sản phẩm nào
            </div>
          ) : (
            <div className="featured-grid">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  className="product-card-featured"
                  onClick={() => navigate(`/products/${product.product_id}`)}
                >
                  {/* Ảnh sản phẩm */}
                  <div className="product-card-featured__image-wrapper">
                    <img
                      src={product.image_url || product.fallback_url}
                      alt={product.product_name}
                      className="product-card-featured__image"
                      onError={(e) => {
                        e.target.src = product.fallback_url;
                      }}
                    />
                    {product.stock_quantity === 0 && (
                      <div className="product-card-featured__badge">
                        Hết hàng
                      </div>
                    )}
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="product-card-featured__info">
                    <h3 className="product-card-featured__name">
                      {product.product_name}
                    </h3>
                    <p className="product-card-featured__category">
                      {getCategoryName(product.category_id)}
                    </p>
                    <div className="product-card-featured__footer">
                      <span className="product-card-featured__price">
                        {formatPrice(product.base_price)}
                      </span>
                      {product.stock_quantity > 0 && (
                        <span className="product-card-featured__stock">
                          {product.stock_quantity} sản phẩm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nút xem tất cả */}
          <div className="featured-section__footer">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/products")}
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        </div>
      </section>

      {/* ============================================
          ABOUT SECTION — Giới thiệu thương hiệu
      ============================================ */}
      <section className="about-section">
        <div className="container">
          <div className="about-section__content">
            <h2 className="about-section__title">Về AvQ</h2>
            <p className="about-section__text">
              AvQ là thương hiệu streetwear độc lập Việt Nam, 
              chuyên sản xuất các mẫu áo, quần và phụ kiện với thiết kế độc đáo, 
              chất lượng cao và bền vững. Chúng tôi không bao giờ theo trend, 
              mà luôn tự tạo ra trend của riêng mình.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
