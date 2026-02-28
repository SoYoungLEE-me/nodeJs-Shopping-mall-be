const express = require("express");
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");
const router = express.Router();

router.post("/", authController.authenticate, orderController.createOrder);

router.get("/me", authController.authenticate, orderController.getMyOrders);

//주문 취소
router.put(
  "/:id/cancel",
  authController.authenticate,
  orderController.cancelOrder
);

//어드민 관리
router.get(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.getOrderList
);
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateOrder
);

module.exports = router;
