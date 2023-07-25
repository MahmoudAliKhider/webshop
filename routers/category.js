const router = require("express").Router();

const {
  getCategories,
  createCategories,
  getCategory,
  removeCategory,
  updateCategory,
} = require("../services/category");

router.route("/").get(getCategories).post(createCategories);
router
  .route("/:id")
  .get(getCategory)
  .delete(removeCategory)
  .put(updateCategory);

module.exports = router;
