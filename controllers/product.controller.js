const Product = require("../models/Product");

const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;

    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });

    await product.save();

    res.status(200).json({ status: "success", product });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.getProductList = async (req, res) => {
  try {
    const productList = await Product.find({});
    res.status(200).json({ status: "success", data: productList });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

module.exports = productController;
