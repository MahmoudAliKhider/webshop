const router = require("express").Router();

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validator/categoryVaidator");

const {
  getCategories,
  createCategories,
  getCategory,
  removeCategory,
  updateCategory,
  uploadCategoryImage,
} = require("../services/category");
const subcategoriesRoute = require("./subCategory");

router.use("/:categoryId/subcategories", subcategoriesRoute);

router
  .route("/")
  .get(getCategories)
  .post(uploadCategoryImage, createCategoryValidator, createCategories);
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .delete(deleteCategoryValidator, removeCategory)
  .put(updateCategoryValidator, updateCategory);

module.exports = router;
