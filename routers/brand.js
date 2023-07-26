const express = require("express");
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

const router = express.Router();

router
  .route("/")
  .get(getBrands)
  .post(uploadCategoryImage, createBrandValidator, createBrand);
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(uploadCategoryImage, updateBrandValidator, updateBrand)
  .delete(deleteBrandValidator, deleteBrand);

module.exports = router;
