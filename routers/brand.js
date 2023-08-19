const router = require("express").Router();

const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validator/brandValidator");

const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadCategoryImage,
} = require("../services/brand");

const authServices = require("../services/auth");

router
  .route("/")
  .get(getBrands)
  .post(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    uploadCategoryImage,
    createBrandValidator,
    createBrand
  );
router
  .route("/:id")
  .get(getBrandValidator, getBrand)

  .delete(
    authServices.protect,
    authServices.allowedTo("admin"),
    deleteBrandValidator,
    deleteBrand
  );
router.put(
  "/update/:id",
  authServices.protect,
  authServices.allowedTo("admin", "manager"),
  uploadCategoryImage,
  updateBrandValidator,
  updateBrand
);
module.exports = router;
