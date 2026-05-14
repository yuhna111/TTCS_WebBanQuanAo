// ============================================================
// FILE: src/pages/CategoriesPage/CategoriesPage.jsx
// MỤC ĐÍCH: Trang danh mục - hiển thị tất cả danh mục sản phẩm
// ============================================================

import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../../data/mockData";
import "./CategoriesPage.css";

export default function CategoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="categories-page">
      <div className="container">
        
        {/* ---- HEADER ---- */}
        <div className="categories-page__header">
          <h1 className="categories-page__title">Danh mục sản phẩm</h1>
          <p className="categories-page__subtitle">
            Chọn danh mục để khám phá những sản phẩm yêu thích của bạn
          </p>
        </div>

        {/* ---- CATEGORIES GRID ---- */}
        <div className="categories-grid">
          {CATEGORIES.map((category) => (
            <div
              key={category.category_id}
              className="category-card"
              onClick={() => navigate(`/products?category=${category.category_id}`)}
            >
              {/* Background color based on category */}
              <div className={`category-card__background category-bg-${category.category_id}`}></div>

              {/* Content */}
              <div className="category-card__content">
                <h2 className="category-card__name">{category.category_name}</h2>
                <p className="category-card__description">
                  {category.description}
                </p>
              </div>

              {/* Hover effect - explore button */}
              <div className="category-card__cta">
                Khám phá →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
