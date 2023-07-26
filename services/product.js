const slugify = require("slugify");
const asyncHandler = require("express-async-handler");

const Product = require("../models/product");
const ApiError = require("../utils/apiError");

exports.getProducts = asyncHandler(async (req, res) => {
  //filtering
  const queryStringObject = { ...req.query };
  const excludesFields = ["page", "limit", "sort", "fields"];
  excludesFields.forEach((field) => delete queryStringObject[field]);

  // Apply filtration using [gte, gt, lte, lt]
  let queryStr = JSON.stringify(queryStringObject);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  //pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  let mongoQuery = Product.find(JSON.parse(queryStr))
    .skip(skip)
    .limit(limit)
    .populate({ path: "category", select: "name" });

  //sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    mongoQuery = mongoQuery.sort(sortBy);
  } else {
    mongoQuery = mongoQuery.sort("-createAt");
  }

  //fields
  if(req.query.fields){
    const fields = req.query.fields.split(",").join(" ");
    mongoQuery = mongoQuery.select(fields);
  }else{
    mongoQuery = mongoQuery.select('-__v');
  }

  const products = await mongoQuery;

  res.status(200).json({ results: products.length, page, data: products });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate({
    path: "category",
    select: "name",
  });

  if (!product) {
    return next(new ApiError(`No Product for this id ${id}`, 404));
  }
  res.status(200).json({ data: product });
});

exports.createProduct = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.title);
  const product = await Product.create(req.body);
  res.status(201).json({ data: product });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }
  const product = await Product.findByIdAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  if (!product) {
    return next(new ApiError(`No Product for this id ${id}`, 404));
  }
  res.status(201).json({ data: product });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return next(new ApiError(`No Product for this id ${id}`, 404));
  }
  res.status(200).send("Product Delete Success");
});
