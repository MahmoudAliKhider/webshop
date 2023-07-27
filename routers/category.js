const router = require("express").Router();

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validator/categoryVaidator");

const authServices = require("../services/auth");

const {
  getCategories,
  createCategories,
  getCategory,
  removeCategory,
  updateCategory,
  uploadCategoryImage,
  resizeProductImage,
} = require("../services/category");
const subcategoriesRoute = require("./subCategory");

router.use("/:categoryId/subcategories", subcategoriesRoute);

router
  .route("/")
  .get(getCategories)
  .post(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeProductImage,
    createCategoryValidator,
    createCategories
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .delete(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    deleteCategoryValidator,
    removeCategory
  )
  .put(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeProductImage,
    updateCategoryValidator,
    updateCategory
  );

module.exports = router;
