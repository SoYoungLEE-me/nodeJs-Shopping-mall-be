const authController = {};
const jwt = require("jsonwebtoken");

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

module.exports = authController;
