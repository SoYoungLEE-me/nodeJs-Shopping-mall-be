const Cart = require("../models/Cart");
const Product = require("../models/Product");

const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("상품이 존재하지 않습니다.");
    }

    const availableStock = product.stock[size];

    if (!availableStock || availableStock < qty) {
      throw new Error("재고가 부족합니다.");
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }

    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    );

    if (existItem) {
      existItem.qty += qty;
    } else {
      cart.items.push({ productId, size, qty });
    }

    await cart.save();

    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

cartController.getCartList = async (req, res) => {
  try {
    const { userId } = req;

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(200).json({ status: "success", data: [] });
    }

    const updatedItems = cart.items.map((item) => {
      const currentStock = item.productId.stock?.[item.size.toLowerCase()] || 0;

      return {
        ...item._doc,
        productId: item.productId,
        insufficientStock: item.qty > currentStock,
        availableStock: currentStock,
      };
    });

    res.status(200).json({
      status: "success",
      data: updatedItems,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

cartController.deleteCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const itemId = req.params.id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new Error("카트가 존재하지 않습니다.");
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    await cart.save();

    res.status(200).json({
      status: "success",
      data: cart.items,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

cartController.updateQty = async (req, res) => {
  try {
    const { userId } = req;
    const itemId = req.params.id;
    const { qty } = req.body;

    if (qty < 1) {
      throw new Error("수량은 1 이상이어야 합니다.");
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    const item = cart.items.find((item) => item._id.toString() === itemId);

    if (!item) {
      throw new Error("아이템을 찾을 수 없습니다.");
    }

    item.qty = qty;

    await cart.save();

    res.status(200).json({
      status: "success",
      data: cart.items,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

module.exports = cartController;
