// ============================================================
// FILE: src/pages/ProductsPage/ProductsPage.jsx
// MỤC ĐÍCH: Trang danh sách sản phẩm.
// Tính năng:
//   - Hiển thị lưới sản phẩm (3 cột)
//   - Bộ lọc theo Danh mục và Size (lọc trên client, không gọi API)
//   - Nút "Thêm nhanh" hover vào card → thêm vào giỏ hàng
//   - Click card → chuyển đến trang chi tiết
// ============================================================

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

import { getProducts, getCategories } from "../../services/api";
import { SIZES, formatPrice } from "../../data/mockData";
import "./ProductsPage.css";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  // --- STATE BỘ LỌC ---
  // null = chưa lọc (hiện tất cả)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy category từ query parameter hoặc state
  const [selectedCategory, setSelectedCategory] = useState(
    () => {
      const catParam = searchParams.get("category");
      return catParam ? parseInt(catParam) : null;
    }
  );
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        setError(err.message || "Không lấy được sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- LỌC SẢN PHẨM ---
  // useMemo: chỉ tính lại khi bộ lọc thay đổi, không tính lại mỗi render
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory =
        !selectedCategory || product.category_id === selectedCategory;
      const matchSize =
        !selectedSize || product.size === selectedSize;

      return matchCategory && matchSize;
    });
  }, [products, selectedCategory, selectedSize]);

  // --- XỬ LÝ THÊM VÀO GIỎ ---
  const handleQuickAdd = (e, product) => {
    // e.stopPropagation(): ngăn click lan lên card (không chuyển trang)
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (product.stock_quantity === 0) return;

    addToCart(product);
    // Thông báo nhỏ (có thể thay bằng toast sau)
    // alert(`Đã thêm "${product.product_name}" vào giỏ hàng!`);
  };

  // --- RESET BỘ LỌC ---
  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedSize(null);
  };

  const hasFilter = selectedCategory || selectedSize;

  if (loading) {
    return (
      <div className="products-page">
        <div className="container">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="container">
          <p className="error-message">Lỗi tải sản phẩm: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">

        {/* ---- TIÊU ĐỀ TRANG ---- */}
        <div className="products-page__header">
          <h1 className="products-page__title display">Bộ sưu tập</h1>
          <p className="products-page__count">
            {filteredProducts.length} sản phẩm
            {hasFilter && " (đang lọc)"}
          </p>
        </div>

        <div className="products-page__body">

          {/* ========================================
              BỘ LỌC (sidebar trái)
          ======================================== */}
          <aside className="filter-panel" aria-label="Bộ lọc sản phẩm">
            <div className="filter-panel__title">Bộ lọc</div>

            {/* Lọc theo Danh mục */}
            <div className="filter-section">
              <span className="filter-section__label">Danh mục</span>
              <div className="filter-options">
                {/* Nút "Tất cả" */}
                <button
                  className={"filter-btn" + (!selectedCategory ? " active" : "")}
                  onClick={() => setSelectedCategory(null)}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.category_id}
                    className={
                      "filter-btn" +
                      (selectedCategory === cat.category_id ? " active" : "")
                    }
                    onClick={() => setSelectedCategory(cat.category_id)}
                  >
                    {cat.category_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Lọc theo Size */}
            <div className="filter-section">
              <span className="filter-section__label">Size</span>
              <div className="filter-sizes">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    className={
                      "size-btn" + (selectedSize === size ? " active" : "")
                    }
                    onClick={() =>
                      // Toggle: click lại size đang chọn → bỏ lọc
                      setSelectedSize(selectedSize === size ? null : size)
                    }
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Nút reset — chỉ hiện khi đang có bộ lọc */}
            {hasFilter && (
              <button className="filter-reset" onClick={handleReset}>
                ✕ Xóa bộ lọc
              </button>
            )}
          </aside>

          {/* ========================================
              LƯỚI SẢN PHẨM
          ======================================== */}
          <div className="product-grid">
            {filteredProducts.length === 0 ? (
              <div className="products-empty">
                Không tìm thấy sản phẩm
                <p>Thử thay đổi bộ lọc để xem thêm</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  onQuickAdd={handleQuickAdd}
                  onClick={() => navigate(`/products/${product.product_id}`)}
                />
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// Hàm helper để convert image URL
function getImageUrl(imageUrl) {
  if (!imageUrl) return "https://placehold.co/400x533/e8e5e0/6b6b6b?text=AvQ";
  if (imageUrl.startsWith('http')) return imageUrl; // đã là full URL
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const baseUrl = apiUrl.replace('/api', ''); // lấy base URL (loại bỏ /api)
  return baseUrl + imageUrl; // http://localhost:5000 + /uploads/file.jpg
}

// ============================================================
// COMPONENT CON: ProductCard
// Tách ra thành component riêng cho gọn và dễ tái sử dụng
// ============================================================
function ProductCard({ product, onQuickAdd, onClick }) {
  const isOutOfStock = product.stock_quantity === 0;
  const imageUrl = getImageUrl(product.image_url);

  return (
    <article className="product-card" onClick={onClick} role="button" tabIndex={0}>

      {/* ---- ẢNH SẢN PHẨM ---- */}
      <div className="product-card__image-wrap">
        <img
          src={imageUrl}
          alt={product.product_name}
          className="product-card__image"
          loading="lazy" // lazy load để trang tải nhanh hơn
          onError={(e) => {
            // Fallback nếu ảnh lỗi
            e.target.src = "https://placehold.co/400x533/e8e5e0/6b6b6b?text=AvQ";
          }}
        />

        {/* Badge hết hàng */}
        {isOutOfStock && (
          <span className="product-card__badge product-card__badge--out">
            Hết hàng
          </span>
        )}

        {/* Nút "Thêm nhanh" hiện khi hover */}
        <button
          className="product-card__quick-add"
          onClick={(e) => onQuickAdd(e, product)}
          disabled={isOutOfStock}
          aria-label={`Thêm ${product.product_name} vào giỏ hàng`}
        >
          {isOutOfStock ? "Hết hàng" : "+ Thêm vào giỏ"}
        </button>
      </div>

      {/* ---- THÔNG TIN SẢN PHẨM ---- */}
      <div className="product-card__info">
        <div className="product-card__name">{product.product_name}</div>
        <div className="product-card__meta">
          {product.color} · Size {product.size}
        </div>
        <div className="product-card__price">{formatPrice(product.base_price)}</div>
      </div>

    </article>
  );
}
