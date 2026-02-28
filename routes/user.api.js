const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

router.post("/register", userController.createUser);

router.post("/login", userController.loginWithEmail);

router.post("/google", userController.loginWithGoogle);

router.get("/me", authController.authenticate, userController.getUser);

module.exports = router;
