const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const createToken = require("../utils/createToken");

const User = require("../models/user");

const multerStorage = multer.memoryStorage();

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("Only Image Allowed", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserImage = upload.single("profileImg");

const processAndSaveImage = async (buffer) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/users/${filename}`);

  return filename;
};

exports.getUsers = asyncHandler(async (req, res) => {
  const documentCount = await User.countDocuments();
  const apiFeature = new ApiFeatures(User.find(), req.query)
    .paginate(documentCount)
    .filter()
    .sort()
    .search()
    .limitFields();
  const { mongooseQuery, paginationResult } = apiFeature;
  const users = await mongooseQuery;

  res
    .status(200)
    .json({ paginationResult, results: users.length, data: users });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }
  res.status(200).json({ data: user });
});

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!req.file) {
    throw new ApiError("No image file found", 400);
  }

  const filename = await processAndSaveImage(req.file.buffer);
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
    slug: slugify(name),
    profileImg: filename,
  });
  res.status(201).json({ data: user });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  let filename;

  if (req.file && req.file.buffer) {
    filename = await processAndSaveImage(req.file.buffer);
  }

  const updateData = {
    name: req.body.name,
    slug: req.body.slug,
    phone: req.body.phone,
    email: req.body.email,
    role: req.body.role,
  };

  if (filename) {
    updateData.profileImg = filename;
  }

  const document = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new ApiError(`No User for this id ${id}`, 404));
  }
  res.status(204).send("remove Success");
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

//Update logged user data without password, role
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});

//active: false,
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: "Success" });
});
