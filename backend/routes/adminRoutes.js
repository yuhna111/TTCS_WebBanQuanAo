// ============================================================
// FILE: routes/adminRoutes.js
// MỤC ĐÍCH: Routes cho admin APIs.
// ============================================================

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Tất cả routes admin cần authenticate và role admin
router.use(authenticateToken);
router.use(requireRole('admin'));

// ---- PRODUCT MANAGEMENT ROUTES ----
router.get("/products", productController.getAdminProducts);
router.post("/products", upload.single('image'), productController.createProduct);
router.put("/products/:id", upload.single('image'), productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);

// ---- DASHBOARD & STATS ----
router.get("/stats", adminController.getDashboardStats);

// ---- ORDER MANAGEMENT ROUTES ----
router.get("/orders", adminController.getAllOrders);
router.put("/orders/:orderId/status", adminController.updateOrderStatus);

// ---- INVENTORY LOGS ----
router.get("/inventory", adminController.getInventoryLogs);

module.exports = router;