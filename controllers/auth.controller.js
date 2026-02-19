const authController = {};
const jwt = require("jsonwebtoken");

const User = require("../models/User");

require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

authController.authenticate = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;

    if (!tokenString) {
      throw new Error("token not found");
    }

    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) {
        console.log("JWT ERROR:", error);
        return res.status(401).json({
          status: "fail",
          error: error.message,
        });
      }

      req.userId = payload._id;
      next();
    });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("can not find user");
    }

    if (user.level !== "admin") {
      throw new Error("no permission");
    }

    next();
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};
module.exports = authController;
