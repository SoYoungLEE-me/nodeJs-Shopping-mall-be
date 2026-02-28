const Order = require("../models/Order");
const Product = require("../models/Product");
const productController = require("./product.controller");
const randomStringGenerator = require("../utils/randomStringGenerator");

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList, couponCode } = req.body;

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

    //쿠폰 로직
    let discount = 0;

    if (couponCode) {
      if (couponCode === "WELCOME10") {
        discount = totalPrice * 0.1; // 10% 할인
      } else if (couponCode === "THANKYOU") {
        discount = 5000; // 5000원 할인
      } else {
        throw new Error("유효하지 않은 쿠폰입니다.");
      }
    }

    const finalPrice = totalPrice - discount;

    if (finalPrice < 0) {
      throw new Error("결제 금액이 올바르지 않습니다.");
    }

    const newOrder = new Order({
      orderNum: randomStringGenerator(),
      userId,
      totalPrice,
      discount,
      finalPrice,
      couponCode: couponCode || "",
      shipTo,
      contact,
      items: orderList,
    });

    await newOrder.save();

    res.status(200).json({
      status: "success",
      orderNum: newOrder.orderNum,
    });
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

orderController.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      throw new Error("주문을 찾을 수 없습니다.");
    }

    if (order.status !== "preparing") {
      throw new Error("이미 처리된 주문은 취소할 수 없습니다.");
    }

    order.status = "cancel";
    await order.save();

    res.status(200).json({
      status: "success",
      message: "주문이 취소되었습니다.",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

module.exports = orderController;
