const User = require("../models/User");
const bcrypt = require("bcrypt");

const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userController = {};

const saltRounds = 10;

userController.createUser = async (req, res) => {
  try {
    const { email, name, password, level } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("이미 가입이 된 유저입니다.");
    }

    const salt = await bcrypt.genSaltSync(saltRounds);
    const hash = await bcrypt.hashSync(password, salt);

    const newUser = new User({
      email,
      name,
      password: hash,
      level: level ? level : "customer",
    });
    await newUser.save();

    res.status(200).json({ status: "success" });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

userController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = bcrypt.compareSync(password, user.password);
      if (isMatch) {
        const token = await user.generateToken();
        res.status(200).json({ status: "success", user, token });
      }
    }
    throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

userController.getUser = async (req, res) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("can not find user");
    }

    res.status(200).json({ status: "success", user });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

userController.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(20).toString("hex");
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(randomPassword, salt);

      user = new User({
        email,
        name,
        password: hash,
        level: "customer",
      });

      await user.save();
    }

    const appToken = await user.generateToken();

    res.status(200).json({
      status: "success",
      user,
      token: appToken,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

module.exports = userController;
