const Product = require("../models/Product");
const PAGE_SIZE = 5;
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
    const { name, page } = req.query;
    const cond = name ? { name: { $regex: name, $options: "i" } } : {};
    let query = Product.find(cond);
    let response = { status: "success" };

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);

      const totalItemNum = await Product.find(cond).countDocuments();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec();
    response.data = productList;

    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
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

    const product = await Product.findByIdAndUpdate(
      {
        _id: productId,
      },
      {
        sku,
        name,
        size,
        image,
        category,
        description,
        price,
        stock,
        status,
      },
      { new: true }
    );
    if (!product) throw new Error("item doesn't exist");

    res.status(200).json({ status: "success", data: product });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      throw new Error("item doesn't exist");
    }

    res.status(200).json({
      status: "success",
      message: "product deleted successfully",
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

productController.getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("item doesn't exist");
    }

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

productController.checkStock = async (item) => {
  const product = await Product.findById(item.productId);

  if (!product) {
    return { isVerify: false, message: "상품이 존재하지 않습니다." };
  }

  const sizeKey = item.size.toLowerCase();

  const sizeStock = product.stock?.[sizeKey];

  if (typeof sizeStock !== "number") {
    return {
      isVerify: false,
      message: `${product.name}에 ${item.size} 사이즈가 없습니다.`,
    };
  }

  if (sizeStock < item.qty) {
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size} 재고가 부족합니다.`,
    };
  }

  product.stock[sizeKey] = sizeStock - item.qty;
  product.markModified("stock");
  await product.save();
  return { isVerify: true };
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = [];
  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    })
  );
  return insufficientStockItems;
};

module.exports = productController;
