const express = require("express");
const path = require("path");

const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require('cors');
const compression = require('compression');

dotenv.config({ path: "config.env" });

const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("./config/swagger.json");

const dbConnection = require("./config/db");
const ApiError = require("./utils/apiError");
const globalError = require("./middelwares/errorMiddelware");

require("dotenv").config();

dbConnection();

const app = express();

app.use(cors());
app.options('*', cors());

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use("/api/v1/products", require("./routers/product"));
app.use("/api/v1/categories", require("./routers/category"));
app.use("/api/v1/subcategories", require("./routers/subCategory"));
app.use("/api/v1/brands", require("./routers/brand"));
app.use("/api/v1/users", require("./routers/user"));
app.use("/api/v1/auth", require("./routers/auth"));
app.use("/api/v1/reviews", require("./routers/review"));
app.use("/api/v1/wishlist", require("./routers/wishlist"));
app.use("/api/v1/addresses", require("./routers/address"));
app.use("/api/v1/coupons", require("./routers/coupon"));
app.use("/api/v1/carts", require("./routers/cart"));
app.use("/api/v1/orders", require("./routers/order"));

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
