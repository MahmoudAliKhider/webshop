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
  resizeProductImage
} = require("../services/product");

router
  .route("/")
  .get(getProducts)
  .post(uploadCategoryImage, resizeProductImage,createProductValidator, createProduct);
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(uploadCategoryImage, resizeProductImage,updateProductValidator, updateProduct)
  .delete(deleteProductValidator, deleteProduct);

module.exports = router;
