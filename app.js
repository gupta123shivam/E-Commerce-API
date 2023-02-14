require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

// Security Packages
const xss_clean = require("xss-clean");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

// database
const connectDB = require("./db/connect");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// third-party and express middleware
app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(cookieParser());
app.use(fileUpload());

app.use(helmet());
app.use(xss_clean());
app.use(cors());

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 100,
  rate: 100,
});
app.set("trust proxy", 1);
app.use(limiter);

// ===============================================================
// Importing Routes
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");
// Applying Router to app
app.get("/api/v1", (req, res) => {
  res.send("yes");
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);
// ==============================================================
// Error and Not Found middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    connectDB(process.env.MONGO_URL);
    mongoose.connection.once("open", () =>
      console.log("Connected to Database MongoDB")
    );
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
