const router = require("express").Router();

const { getCategories, createCategories } = require("../services/category");

router.get("/", getCategories);
router.post("/", createCategories);

module.exports = router;
