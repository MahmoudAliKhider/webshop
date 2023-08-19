const express = require("express");

const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require("../services/cart");
const authService = require("../services/auth");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));
router.route("/").post(addProductToCart).get(getLoggedUserCart);

router.delete("/clear", clearCart);
router.put("/applyCoupon", applyCoupon);

router.route("/:itemId").delete(removeSpecificCartItem);
router.put("/update/:itemId", updateCartItemQuantity);
module.exports = router;
