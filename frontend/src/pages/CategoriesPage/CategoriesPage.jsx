// ============================================================
// FILE: src/pages/CategoriesPage/CategoriesPage.jsx
// MỤC ĐÍCH: Trang danh mục - hiển thị tất cả danh mục sản phẩm
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../../services/api";
import "./CategoriesPage.css";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getCategories();
        setCategories(data.data || []);
        setError("");
      } catch (err) {
        setError(err.message || "Không thể tải danh mục");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="categories-page">
        <div className="container">Đang tải danh mục...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-page">
        <div className="container">
          <p style={{ color: "red" }}>Lỗi: {error}</p>
        </div>
      </div>
    );
  }

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
          {categories.map((category) => (
            <div
              key={category.category_id}
              className="category-card"
              onClick={() => navigate(`/products?category=${category.category_id}`)}
            >
              {/* Background color based on category */}
              <div
                className={`category-card__background ${category.category_name?.trim().toLowerCase() === "tops"
                    ? "category-bg-tops"
                    : `category-bg-${category.category_id}`
                  }`}
              />

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
