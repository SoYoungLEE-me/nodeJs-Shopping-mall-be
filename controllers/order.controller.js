const Order = require("../models/Order");
const Product = require("../models/Product");
const productController = require("./product.controller");
const randomStringGenerator = require("../utils/randomStringGenerator");

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;

    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );

    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }

    const newOrder = new Order({
      orderNum: randomStringGenerator(),
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
    });

    await newOrder.save();

    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

orderController.getMyOrders = async (req, res) => {
  try {
    const { userId } = req;

    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({ status: "success", data: orders });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const { page = 1, ordernum } = req.query;
    const pageSize = 5;

    const condition = {};

    if (ordernum) {
      condition.orderNum = { $regex: ordernum, $options: "i" };
    }

    const totalItemNum = await Order.countDocuments(condition);

    const orderList = await Order.find(condition)
      .populate("userId")
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      status: "success",
      data: orderList,
      totalPageNum: Math.ceil(totalItemNum / pageSize),
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

module.exports = orderController;
