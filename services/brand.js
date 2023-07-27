const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

const Brand = require("../models/brand");

const multerStorage = multer.memoryStorage();

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("Only Image Allowed", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadCategoryImage = upload.single("image");

const processAndSaveImage = async (buffer) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/brands/${filename}`);

  return filename;
};

// GET /api/v1/brands
exports.getBrands = asyncHandler(async (req, res) => {
  const documentCount = await Brand.countDocuments();
  const apiFeature = new ApiFeatures(Brand.find(), req.query)
    .paginate(documentCount)
    .filter()
    .sort()
    .search()
    .limitFields();
  const { mongooseQuery, paginationResult } = apiFeature;
  const brands = await mongooseQuery;

  res
    .status(200)
    .json({ paginationResult, results: brands.length, data: brands });
});

// GET /api/v1/brands/:id
exports.getBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await Brand.findById(id);
  if (!brand) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }
  res.status(200).json({ data: brand });
});

// POST  /api/v1/brands
exports.createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!req.file) {
    throw new ApiError("No image file found", 400);
  }
  const filename = await processAndSaveImage(req.file.buffer);
  const brand = await Brand.create({
    name,
    slug: slugify(name),
    image: filename,
  });
  res.status(201).json({ data: brand });
});

// PUT /api/v1/brands/:id
exports.updateBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const filename = await processAndSaveImage(req.file.buffer);

  const brand = await Brand.findOneAndUpdate(
    { _id: id },
    { name, slug: slugify(name), image: filename },
    { new: true }
  );

  if (!brand) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }
  res.status(200).json({ data: brand });
});

// DELETE /api/v1/brands/:id
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await Brand.findByIdAndDelete(id);

  if (!brand) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }
  res.status(204).send("remove Success");
});
