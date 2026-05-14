// ============================================================
// FILE: src/pages/HomePage/HomePage.jsx
// MỤC ĐÍCH: Trang chủ - Hero section + 3 sản phẩm nổi bật
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getCategories } from "../../services/api";
import { formatPrice } from "../../data/mockData";
import "./HomePage.css";

// Helper: convert image URL
function getImageUrl(imageUrl) {
  if (!imageUrl) return "https://placehold.co/400x533/e8e5e0/6b6b6b?text=AvQ";
  if (imageUrl.startsWith('http')) return imageUrl;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const baseUrl = apiUrl.replace('/api', '');
  return baseUrl + imageUrl;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        // Lấy 3 sản phẩm đầu tiên làm "featured"
        setProducts((productsRes.data || []).slice(0, 3));
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper: lookup category_name từ category_id
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.category_id === categoryId);
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
              src="/images/hero/home-hero.jpg"
              alt="AvQ Streetwear Hero"
              className="hero-section__image"
              onError={(e) => {
                e.target.src = "https://placehold.co/1200x600/e8e5e0/6b6b6b?text=AvQ";
              }}
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
                      src={getImageUrl(product.image_url)}
                      alt={product.product_name}
                      className="product-card-featured__image"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/400x533/e8e5e0/6b6b6b?text=AvQ";
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
