const slugify = require("slugify");
const asyncHandler = require("express-async-handler");

const Category = require("../models/category");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.getCategories = asyncHandler(async (req, res) => {
  const documentCount = await Category.countDocuments();
  const apiFeature = new ApiFeatures(Category.find(), req.query)
    .paginate(documentCount)
    .filter()
    .sort()
    .search()
    .limitFields();
  const { mongooseQuery, paginationResult } = apiFeature;
  const categories = await mongooseQuery;

  res.status(200).json({ paginationResult ,results: categories.length, data: categories });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    return next(new ApiError(`No category for this id ${id}`, 404));
  }
  res.status(200).json({ data: category });
});

exports.createCategories = asyncHandler(async (req, res) => {
  const name = req.body.name;
  const category = await Category.create({ name, slug: slugify(name) });
  res.status(201).json({ data: category });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findByIdAndUpdate(
    { _id: id },
    { name, slug: slugify(name) },
    { new: true }
  );
  if (!category) {
    return next(new ApiError(`No category for this id ${id}`, 404));
  }
  res.status(201).json({ data: category });
});

exports.removeCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return next(new ApiError(`No category for this id ${id}`, 404));
  }
  res.status(200).send("category Delete Success");
});
