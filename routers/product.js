const router = require("express").Router();
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validator/productValidator");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadCategoryImage,
  resizeProductImage,
} = require("../services/product");

const authServices = require("../services/auth");
const reviewsRoute = require('./review');

router.use('/:productId/reviews', reviewsRoute);
router
  .route("/")
  .get(getProducts)
  .post(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeProductImage,
    createProductValidator,
    createProduct
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeProductImage,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
