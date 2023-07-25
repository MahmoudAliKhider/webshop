const slugify = require("slugify");
const asyncHandler = require("express-async-handler");

const Category = require("../models/category");

exports.getCategories = (req, res) => {
  res.send();
};

exports.createCategories = asyncHandler(async (req, res) => {
  const name = req.body.name;
  const category = await Category.create({ name, slug: slugify(name) });
  res.status(201).json({ data: category });
});
