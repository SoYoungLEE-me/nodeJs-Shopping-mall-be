const express = require("express");
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cart.controller");
const router = express.Router();

router.post("/", authController.authenticate, cartController.addItemToCart);

router.get("/", authController.authenticate, cartController.getCartList);

router.delete(
  "/:id",
  authController.authenticate,
  cartController.deleteCartItem
);

router.put("/:id", authController.authenticate, cartController.updateQty);

module.exports = router;
