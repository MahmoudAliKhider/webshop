const router = require("express").Router();
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validator/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword
} = require("../services/user");

const authServices = require("../services/auth");

router.use(authServices.protect);

router.get('/getMe', getLoggedUserData, getUser);
router.put('/changeMyPassword', updateLoggedUserPassword);
// router.put('/updateMe', updateLoggedUserValidator, updateLoggedUserData);
// router.delete('/deleteMe', deleteLoggedUserData);

router
  .route("/")
  .get(
    authServices.protect,
    authServices.allowedTo("admin", "manger"),
    getUsers
  )
  .post(
    authServices.protect,
    authServices.allowedTo("admin"),
    uploadUserImage,
    createUserValidator,
    createUser
  );

router.put(
  "/changePassword/:id",
  authServices.protect,
  authServices.allowedTo("admin"),
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/:id")
  .get(
    authServices.protect,
    authServices.allowedTo("admin"),
    getUserValidator,
    getUser
  )
  .put(
    authServices.protect,
    authServices.allowedTo("admin"),
    uploadUserImage,
    updateUserValidator,
    updateUser
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("admin"),
    deleteUserValidator,
    deleteUser
  );

module.exports = router;
