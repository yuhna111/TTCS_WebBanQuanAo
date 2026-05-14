// ============================================================
// FILE: controllers/adminController.js
// MỤC ĐÍCH: API cho admin dashboard, orders, inventory.
// ============================================================

const pool = require("../config/db");

// ---- DASHBOARD STATS ----
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalOrders] = await pool.query("SELECT COUNT(*) as total FROM `order`");

    const [revenue] = await pool.query(
      "SELECT SUM(total_amount - discount_amount) as revenue FROM `order` WHERE status = 'completed'"
    );

    const [pendingCount] = await pool.query(
      "SELECT COUNT(*) as pending FROM `order` WHERE status = 'pending'"
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthlyOrders] = await pool.query(
      "SELECT COUNT(*) as monthly FROM `order` WHERE order_date >= ?",
      [startOfMonth]
    );

    const [monthlyRevenue] = await pool.query(
      "SELECT YEAR(order_date) as year, MONTH(order_date) as month, SUM(total_amount - discount_amount) as revenue " +
      "FROM `order` WHERE status = 'completed' AND order_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) " +
      "GROUP BY YEAR(order_date), MONTH(order_date) ORDER BY year DESC, month DESC"
    );

    res.json({
      success: true,
      stats: {
        totalOrders: totalOrders[0].total,
        totalRevenue: revenue[0].revenue || 0,
        pendingCount: pendingCount[0].pending,
        monthlyOrders: monthlyOrders[0].monthly,
        monthlyRevenue: monthlyRevenue.map((r) => ({
          month: `${r.year}-${String(r.month).padStart(2, '0')}`,
          revenue: r.revenue,
        })),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy dashboard stats:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ---- ALL ORDERS FOR ADMIN ----
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT o.*, u.full_name, u.email, u.phone_number, MAX(pmt.amount) as paid_amount, " +
      "GROUP_CONCAT(JSON_OBJECT( " +
      "  'order_detail_id', od.order_detail_id, " +
      "  'product_name', p.product_name, " +
      "  'color', p.color, " +
      "  'size', p.size, " +
      "  'quantity', od.quantity, " +
      "  'unit_price', od.unit_price, " +
      "  'image_url', p.image_url " +
      ")) as items_json " +
      "FROM `order` o " +
      "JOIN `user` u ON o.user_id = u.user_id " +
      "LEFT JOIN Payment pmt ON o.order_id = pmt.order_id " +
      "LEFT JOIN order_detail od ON o.order_id = od.order_id " +
      "LEFT JOIN `Product` p ON od.product_id = p.product_id " +
      "GROUP BY o.order_id " +
      "ORDER BY o.order_date DESC"
    );

    const ordersWithItems = orders.map((order) => ({
      ...order,
      user: {
        full_name: order.full_name || "",
        email: order.email || "",
        phone_number: order.phone_number || "",
      },
      shipping_fee: order.shipping_fee != null ? order.shipping_fee : 30000,
      final_amount: order.paid_amount != null
        ? order.paid_amount
        : (order.total_amount - (order.discount_amount || 0) + (order.shipping_fee != null ? order.shipping_fee : 30000)),
      items: order.items_json ? JSON.parse(`[${order.items_json}]`) : [],
      items_json: undefined,
    }));

    res.json({ success: true, orders: ordersWithItems });
  } catch (error) {
    console.error("Lỗi lấy all orders:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ---- UPDATE ORDER STATUS ----
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status, cancellation_reason } = req.body;

  try {
    const validStatuses = ["pending", "confirmed", "shipping", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const updateData = { status };
    if (status === "cancelled" && cancellation_reason) {
      updateData.cancellation_reason = cancellation_reason;
    }
    if (status === "completed") {
      updateData.completed_at = new Date();
    }

    await pool.query("UPDATE `order` SET ? WHERE order_id = ?", [updateData, orderId]);

    if (status === "completed") {
      const [details] = await pool.query(
        "SELECT product_id, quantity FROM order_detail WHERE order_id = ?",
        [orderId]
      );
      for (const detail of details) {
        await pool.query(
          "UPDATE `Product` SET stock_quantity = stock_quantity - ? WHERE product_id = ?",
          [detail.quantity, detail.product_id]
        );
        await pool.query(
          "INSERT INTO `Inventory_Log` (product_id, transaction_type, quantity, note, created_at) VALUES (?, 'out', ?, 'Đơn hàng hoàn thành', NOW())",
          [detail.product_id, detail.quantity]
        );
      }
    }

    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.error("Lỗi update order status:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ---- INVENTORY LOGS ----
exports.getInventoryLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(
      "SELECT l.*, p.product_name, p.image_url " +
      "FROM `Inventory_Log` l " +
      "JOIN `Product` p ON l.product_id = p.product_id " +
      "ORDER BY l.created_at DESC"
    );

    res.json({ success: true, logs });
  } catch (error) {
    console.error("Lỗi lấy inventory logs:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};