const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const indexRouter = require("./routes/index");

require("dotenv").config();

const MONGODB_URI = process.env.LOCAL_DB_ADDRESS;

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); //req.body가 객체로 인식이 된다
app.use("/api", indexRouter);

const mongoURI = MONGODB_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("mongoose connected");
  })
  .catch((err) => {
    console.log("DB connection fail", err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});

app.get("/", (req, res) => {
  res.status(200).send("ok");
});
