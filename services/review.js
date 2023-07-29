const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
// const multer = require("multer");
// const sharp = require("sharp");
// const { v4: uuidv4 } = require("uuid");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

const Review = require("../models/review");

exports.getReviews = asyncHandler(async (req, res) => {
  const documentCount = await Review.countDocuments();
  const apiFeature = new ApiFeatures(Review.find(), req.query)
    .paginate(documentCount)
    .filter()
    .sort()
    .search()
    .limitFields();
  const { mongooseQuery, paginationResult } = apiFeature;
  const reviews = await mongooseQuery;

  res
    .status(200)
    .json({ paginationResult, results: reviews.length, data: reviews });
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) {
    return next(new ApiError(`No review for this id ${id}`, 404));
  }
  res.status(200).json({ data: review });
});

exports.createReview = asyncHandler(async (req, res) => {
  const review = await Review.create({
    title: req.body.title,
    ratings: req.body.ratings,
    user: req.user._id,
    product: req.body.product,
  });
  res.status(201).json({ data: review });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, ratings } = req.body;

  const review = await Review.findOneAndUpdate(
    { _id: id },
    { title, ratings },
    { new: true }
  );

  if (!review) {
    return next(new ApiError(`No review for this id ${id}`, 404));
  }
  res.status(200).json({ data: review });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);

  if (!review) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }
  res.status(204).send("remove Success");
});
