import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../../context/AuthContext";
import {
    getAllVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
} from "../../services/api";
import { formatPrice } from "../../data/adminMockData";

const emptyForm = {
    voucher_code: "",
    discount_type: "percent",
    discount_value: "",
    min_order_value: "0",
    usage_limit: "1",
    start_date: "",
    end_date: "",
};

function formatDateForInput(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const pad = (num) => String(num).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateDisplay(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function toMysqlDateTime(value) {
    if (!value) return "";
    const normalized = value.replace("T", " ");
    return normalized.length === 16 ? `${normalized}:00` : normalized;
}

function getVoucherStatus(voucher) {
    const now = new Date();
    const start = new Date(voucher.start_date);
    const end = new Date(voucher.end_date);
    const used = Number(voucher.used_count || 0);
    const limit = Number(voucher.usage_limit || 0);

    if (limit > 0 && used >= limit) {
        return { label: "Hết lượt", className: "badge--cancelled" };
    }

    if (now < start) {
        return { label: "Sắp diễn ra", className: "badge--pending" };
    }

    if (now > end) {
        return { label: "Hết hạn", className: "badge--cancelled" };
    }

    return { label: "Đang chạy", className: "badge--completed" };
}

function getDiscountText(voucher) {
    if (voucher.discount_type === "percent") {
        return `${Number(voucher.discount_value || 0)}%`;
    }

    return formatPrice(voucher.discount_value || 0);
}

export default function AdminVouchersPage() {
    const { token } = useAuth();

    const [vouchers, setVouchers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchVouchers = async () => {
        setIsLoading(true);

        try {
            const data = await getAllVouchers(token);
            setVouchers(data.data || []);
            setError("");
        } catch (err) {
            setError(err.message || "Không thể tải danh sách voucher");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchVouchers();
        }
    }, [token]);

    const filteredVouchers = useMemo(() => {
        const q = searchText.trim().toLowerCase();

        return vouchers.filter((voucher) => {
            const status = getVoucherStatus(voucher).label;
            const matchedSearch =
                !q || voucher.voucher_code?.toLowerCase().includes(q);
            const matchedStatus = statusFilter === "all" || status === statusFilter;

            return matchedSearch && matchedStatus;
        });
    }, [vouchers, searchText, statusFilter]);

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: field === "voucher_code" ? value.toUpperCase() : value,
        }));
    };

    const buildPayload = () => ({
        voucher_code: formData.voucher_code.trim().toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_value: Number(formData.min_order_value || 0),
        usage_limit: Number(formData.usage_limit || 1),
        start_date: toMysqlDateTime(formData.start_date),
        end_date: toMysqlDateTime(formData.end_date),
    });

    const validateForm = () => {
        const payload = buildPayload();

        if (!payload.voucher_code) return "Vui lòng nhập mã voucher";
        if (!payload.discount_value || payload.discount_value <= 0)
            return "Giá trị giảm phải lớn hơn 0";
        if (payload.discount_type === "percent" && payload.discount_value > 100)
            return "Giảm theo % không được vượt quá 100";
        if (payload.min_order_value < 0) return "Đơn tối thiểu không hợp lệ";
        if (!Number.isInteger(payload.usage_limit) || payload.usage_limit < 1)
            return "Lượt dùng phải là số nguyên lớn hơn 0";
        if (!payload.start_date || !payload.end_date)
            return "Vui lòng chọn thời gian bắt đầu và kết thúc";
        if (new Date(payload.start_date) >= new Date(payload.end_date))
            return "Ngày kết thúc phải sau ngày bắt đầu";

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            showToast(validationError, "error");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = buildPayload();

            if (editingId) {
                const data = await updateVoucher(editingId, payload, token);

                setVouchers((prev) =>
                    prev.map((voucher) =>
                        voucher.voucher_id === editingId ? data.voucher : voucher
                    )
                );

                showToast("Cập nhật voucher thành công");
            } else {
                const data = await createVoucher(payload, token);

                setVouchers((prev) => [data.voucher, ...prev]);
                showToast("Thêm voucher thành công");
            }

            resetForm();
        } catch (err) {
            showToast(err.message || "Không thể lưu voucher", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (voucher) => {
        setEditingId(voucher.voucher_id);

        setFormData({
            voucher_code: voucher.voucher_code || "",
            discount_type: voucher.discount_type || "percent",
            discount_value: String(voucher.discount_value ?? ""),
            min_order_value: String(voucher.min_order_value ?? 0),
            usage_limit: String(voucher.usage_limit ?? 1),
            start_date: formatDateForInput(voucher.start_date),
            end_date: formatDateForInput(voucher.end_date),
        });

        setShowForm(true);
    };

    const handleDelete = async (voucher) => {
        const ok = window.confirm(
            `Bạn chắc chắn muốn xóa voucher ${voucher.voucher_code}?`
        );

        if (!ok) return;

        try {
            await deleteVoucher(voucher.voucher_id, token);

            setVouchers((prev) =>
                prev.filter((item) => item.voucher_id !== voucher.voucher_id)
            );

            showToast("Xóa voucher thành công");
        } catch (err) {
            showToast(err.message || "Không thể xóa voucher", "error");
        }
    };

    return (
        <AdminLayout>
            <h1 className="admin-page-title display">Quản lý Voucher</h1>
            <p className="admin-page-sub">
                {vouchers.length} voucher · {filteredVouchers.length} đang hiển thị
            </p>

            {error && (
                <div style={{ color: "var(--color-danger)", marginBottom: 16 }}>
                    {error}
                </div>
            )}

            <div className="admin-section-header">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    + Thêm voucher mới
                </button>
            </div>

            <div className="admin-filter-bar">
                <input
                    className="admin-search"
                    placeholder="Tìm theo mã voucher..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <select
                    className="admin-filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Đang chạy">Đang chạy</option>
                    <option value="Sắp diễn ra">Sắp diễn ra</option>
                    <option value="Hết hạn">Hết hạn</option>
                    <option value="Hết lượt">Hết lượt</option>
                </select>
            </div>

            {isLoading ? (
                <div className="admin-empty">Đang tải danh sách voucher...</div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã voucher</th>
                                <th>Loại</th>
                                <th>Giá trị</th>
                                <th>Đơn tối thiểu</th>
                                <th>Lượt dùng</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredVouchers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="admin-empty">
                                        {vouchers.length === 0
                                            ? "Chưa có voucher nào. Hãy thêm voucher mới!"
                                            : "Không tìm thấy voucher phù hợp"}
                                    </td>
                                </tr>
                            ) : (
                                filteredVouchers.map((voucher) => {
                                    const status = getVoucherStatus(voucher);

                                    return (
                                        <tr key={voucher.voucher_id}>
                                            <td>
                                                <strong>{voucher.voucher_code}</strong>
                                            </td>

                                            <td>
                                                {voucher.discount_type === "percent"
                                                    ? "Theo %"
                                                    : "Tiền cố định"}
                                            </td>

                                            <td>{getDiscountText(voucher)}</td>

                                            <td>{formatPrice(voucher.min_order_value || 0)}</td>

                                            <td>
                                                {Number(voucher.used_count || 0)} /{" "}
                                                {Number(voucher.usage_limit || 0)}
                                            </td>

                                            <td>
                                                <div style={{ fontSize: 12 }}>
                                                    <div>{formatDateDisplay(voucher.start_date)}</div>
                                                    <div
                                                        style={{
                                                            color: "var(--color-gray-4)",
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        đến {formatDateDisplay(voucher.end_date)}
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`badge ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>

                                            <td>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 6,
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <button
                                                        className="tbl-btn tbl-btn--edit"
                                                        onClick={() => handleEdit(voucher)}
                                                    >
                                                        Sửa
                                                    </button>

                                                    <button
                                                        className="tbl-btn tbl-btn--cancel"
                                                        onClick={() => handleDelete(voucher)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: 620,
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                    >
                        <div className="modal__title display">
                            {editingId ? "Sửa voucher" : "Thêm voucher mới"}
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="modal__body"
                            style={{ display: "grid", gap: 12 }}
                        >
                            <div>
                                <label>Mã voucher *</label>
                                <input
                                    type="text"
                                    value={formData.voucher_code}
                                    onChange={(e) =>
                                        handleChange("voucher_code", e.target.value)
                                    }
                                    placeholder="VD: SALE20"
                                    disabled={isSubmitting}
                                    style={{
                                        width: "100%",
                                        padding: 8,
                                        border: "1px solid var(--color-gray-4)",
                                        borderRadius: 4,
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 8,
                                }}
                            >
                                <div>
                                    <label>Loại giảm *</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) =>
                                            handleChange("discount_type", e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        style={{
                                            width: "100%",
                                            padding: 8,
                                            border: "1px solid var(--color-gray-4)",
                                            borderRadius: 4,
                                        }}
                                    >
                                        <option value="percent">Theo phần trăm (%)</option>
                                        <option value="fixed">Tiền cố định (VNĐ)</option>
                                    </select>
                                </div>

                                <div>
                                    <label>Giá trị giảm *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={
                                            formData.discount_type === "percent" ? "100" : undefined
                                        }
                                        value={formData.discount_value}
                                        onChange={(e) =>
                                            handleChange("discount_value", e.target.value)
                                        }
                                        placeholder={
                                            formData.discount_type === "percent" ? "20" : "50000"
                                        }
                                        disabled={isSubmitting}
                                        style={{
                                            width: "100%",
                                            padding: 8,
                                            border: "1px solid var(--color-gray-4)",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 8,
                                }}
                            >
                                <div>
                                    <label>Đơn tối thiểu</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.min_order_value}
                                        onChange={(e) =>
                                            handleChange("min_order_value", e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        style={{
                                            width: "100%",
                                            padding: 8,
                                            border: "1px solid var(--color-gray-4)",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>

                                <div>
                                    <label>Lượt sử dụng *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={formData.usage_limit}
                                        onChange={(e) =>
                                            handleChange("usage_limit", e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        style={{
                                            width: "100%",
                                            padding: 8,
                                            border: "1px solid var(--color-gray-4)",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 8,
                                }}
                            >
                                <div>
                                    <label>Bắt đầu *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.start_date}
                                        onChange={(e) =>
                                            handleChange("start_date", e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        style={{
                                            width: "100%",
                                            padding: 8,
                                            border: "1px solid var(--color-gray-4)",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>

                                <div>
                                    <label>Kết thúc *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.end_date}
                                        onChange={(e) =>
                                            handleChange("end_date", e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        style={{
                                            width: "100%",
                                            padding: 8,
                                            border: "1px solid var(--color-gray-4)",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="modal__actions" style={{ marginTop: 12 }}>
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
                                    {isSubmitting
                                        ? "Đang lưu..."
                                        : editingId
                                            ? "Cập nhật"
                                            : "Thêm"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`toast toast--${toast.type}`}>{toast.msg}</div>
            )}
        </AdminLayout>
    );
}