// ============================================================
// FILE: src/pages/Admin/AdminProductsPage.jsx
// MỤC ĐÍCH: Quản lý sản phẩm — danh sách, thêm, sửa, xóa.
// ============================================================

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import { getAdminProducts, createProduct, updateProduct, deleteProduct, getCategories } from "../../services/api";
import { formatPrice } from "../../data/adminMockData";
import { useAuth } from "../../context/AuthContext";

export default function AdminProductsPage() {
  const { token } = useAuth();

  // ---- STATE ----
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    base_price: "",
    color: "",
    size: "",
    stock_quantity: "",
    category_id: "",
  });
  const [toast, setToast] = useState(null);

  // ---- LẤY DANH SÁCH SẢN PHẨM VÀ DANH MỤC ----
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const productsData = await getAdminProducts(token);
        setProducts(productsData.products || []);
        
        const categoriesData = await getCategories();
        setCategories(categoriesData.data || []);
        
        setError("");
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };
    if (token) {
      fetchData();
    }
  }, [token]);

  // ---- LỌC SẢN PHẨM ----
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchText.toLowerCase();
      return !q
        || p.product_name.toLowerCase().includes(q)
        || (p.color && p.color.toLowerCase().includes(q))
        || (p.size && p.size.toLowerCase().includes(q));
    });
  }, [products, searchText]);

  // ---- HIỆN TOAST ----
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- XỬ LÝ CHỌN ẢNH ----
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ---- RESET FORM ----
  const resetForm = () => {
    setFormData({
      product_name: "",
      product_description: "",
      base_price: "",
      color: "",
      size: "",
      stock_quantity: "",
      category_id: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  // ---- THÊM/SỬA SẢN PHẨM ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product_name || !formData.base_price || !formData.stock_quantity || !formData.category_id) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc (bao gồm danh mục)", "error");
      return;
    }

    if (!editingId && !imageFile) {
      showToast("Vui lòng chọn hình ảnh sản phẩm", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Sửa sản phẩm
        await updateProduct(editingId, formData, imageFile, token);
        setProducts(prev =>
          prev.map(p => p.product_id === editingId ? { ...p, ...formData } : p)
        );
        showToast("Cập nhật sản phẩm thành công");
      } else {
        // Thêm sản phẩm mới
        const data = await createProduct(formData, imageFile, token);
        setProducts(prev => [data.product, ...prev]);
        showToast("Thêm sản phẩm thành công");
      }
      resetForm();
    } catch (err) {
      showToast(err.message || "Lỗi lưu sản phẩm", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- CHỈNH SỬA ----
  const handleEdit = (product) => {
    setFormData({
      product_name: product.product_name,
      product_description: product.product_description,
      base_price: product.base_price,
      color: product.color,
      size: product.size,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id,
    });
    setImagePreview(product.image_url);
    setEditingId(product.product_id);
    setShowForm(true);
  };

  // ---- XÓA ----
  const handleDelete = async (productId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      await deleteProduct(productId, token);
      setProducts(prev => prev.filter(p => p.product_id !== productId));
      showToast("Xóa sản phẩm thành công");
    } catch (err) {
      showToast(err.message || "Lỗi xóa sản phẩm", "error");
    }
  };

  return (
    <AdminLayout>
      <h1 className="admin-page-title display">Quản lý sản phẩm</h1>
      <p className="admin-page-sub">{products.length} sản phẩm · {filteredProducts.length} đang hiển thị</p>

      {error && <div style={{ color: "var(--color-red)", marginBottom: "16px", padding: "12px", backgroundColor: "var(--color-red-light)", borderRadius: "4px" }}>{error}</div>}

      {/* ---- NÚT THÊM ---- */}
      <div style={{ marginBottom: 20 }}>
        <button
          className="btn btn-primary"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          + Thêm sản phẩm mới
        </button>
      </div>

      {/* ---- FORM THÊM/SỬA ---- */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal__title display">
              {editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
            </div>
            <form onSubmit={handleSubmit} className="modal__body" style={{ display: "grid", gap: "12px" }}>
              <div>
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="Tên sản phẩm"
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--color-gray-4)", borderRadius: "4px" }}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label>Mô tả</label>
                <textarea
                  value={formData.product_description}
                  onChange={e => setFormData({ ...formData, product_description: e.target.value })}
                  placeholder="Mô tả sản phẩm"
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--color-gray-4)", borderRadius: "4px", minHeight: "60px" }}
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label>Giá (VNĐ) *</label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                    placeholder="0"
                    min="0"
                    style={{ width: "100%", padding: "8px", border: "1px solid var(--color-gray-4)", borderRadius: "4px" }}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label>Tồn kho *</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="0"
                    min="0"
                    style={{ width: "100%", padding: "8px", border: "1px solid var(--color-gray-4)", borderRadius: "4px" }}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label>Màu sắc</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    placeholder="VD: Đỏ, Xanh, ..."
                    style={{ width: "100%", padding: "8px", border: "1px solid var(--color-gray-4)", borderRadius: "4px" }}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label>Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={e => setFormData({ ...formData, size: e.target.value })}
                    placeholder="VD: S, M, L, XL"
                    style={{ width: "100%", padding: "8px", border: "1px solid var(--color-gray-4)", borderRadius: "4px" }}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label>Danh mục *</label>
                <select
                  value={formData.category_id}
                  onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--color-gray-4)", borderRadius: "4px" }}
                  disabled={isSubmitting}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Hình ảnh {!editingId && "*"}</label>
                {imagePreview && (
                  <div style={{ marginBottom: "8px", textAlign: "center" }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "4px" }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--color-gray-4)", borderRadius: "4px" }}
                  disabled={isSubmitting}
                />
                {editingId && <small style={{ color: "var(--color-gray-5)" }}>Để trống nếu không muốn thay đổi ảnh</small>}
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang lưu..." : (editingId ? "Cập nhật" : "Thêm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- TÌM KIẾM ---- */}
      <div className="admin-filter-bar">
        <input
          className="admin-search"
          placeholder="Tìm tên, màu, size..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>

      {/* ---- BẢNG SẢN PHẨM ---- */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--color-gray-5)" }}>
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Màu / Size</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Danh mục</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    {products.length === 0 ? "Chưa có sản phẩm nào. Hãy thêm sản phẩm mới!" : "Không tìm thấy sản phẩm phù hợp"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.product_id}>
                    <td><strong>{product.product_name}</strong></td>
                    <td>{product.color || "-"} / {product.size || "-"}</td>
                    <td>{formatPrice(product.base_price)}</td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        backgroundColor: product.stock_quantity > 10 ? "var(--color-green-light)" : product.stock_quantity > 0 ? "var(--color-yellow-light)" : "var(--color-red-light)",
                        borderRadius: "4px"
                      }}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td>{product.category_id || "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="tbl-btn tbl-btn--edit"
                          onClick={() => handleEdit(product)}
                        >
                          Sửa
                        </button>
                        <button
                          className="tbl-btn tbl-btn--cancel"
                          onClick={() => handleDelete(product.product_id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- TOAST ---- */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.msg}</div>
      )}
    </AdminLayout>
  );
}
