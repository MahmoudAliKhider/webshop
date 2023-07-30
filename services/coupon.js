const slugify = require("slugify");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

const Coupon = require("../models/coupon");

exports.getCoupons = asyncHandler(async (req, res) => {
  const documentCount = await Coupon.countDocuments();
  const apiFeature = new ApiFeatures(Coupon.find(), req.query)
    .paginate(documentCount)
    .filter()
    .sort()
    .search()
    .limitFields();
  const { mongooseQuery, paginationResult } = apiFeature;
  const coupons = await mongooseQuery;

  res
    .status(200)
    .json({ paginationResult, results: coupons.length, data: coupons });
});

exports.getCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    return next(new ApiError(`No coupon for this id ${id}`, 404));
  }
  res.status(200).json({ data: coupon });
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ data: coupon });
});

exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });

  if (!coupon) {
    return next(new ApiError(`No coupon for this id ${id}`, 404));
  }
  res.status(200).json({ data: coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) {
    return next(new ApiError(`No coupon for this id ${id}`, 404));
  }
  res.status(204).send("remove Success");
});
