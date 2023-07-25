const router = require("express").Router();

const { getCategories, createCategories, getCategory } = require("../services/category");

router.route('/').get(getCategories).post(createCategories);
router.route('/:id').get(getCategory);

module.exports = router;
