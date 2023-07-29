const slugify = require("slugify");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

const Review = require("../models/review");

exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

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

exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  next();
};

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
  review.save();

  res.status(200).json({ data: review });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);

  if (!review) {
    return next(new ApiError(`No review for this id ${id}`, 404));
  }
  const productId = review.product;

  Review.calcAverageRatingsAndQuantity(productId);

  res.status(204).send("Remove Success");
});
