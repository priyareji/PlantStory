var express = require("express");
var router = express.Router();

const bodyParser = require("body-parser");
const auth = require("../middleware/auth");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const config = require("../config/config");

const userController = require("../controllers/userController");
const couponController = require("../controllers/couponController");
const wishListController = require("../controllers/wishListcontroller");
/* GET users listing. */
// router.get("/", function (req, res, next) {
//   res.send("respond with a resource");
// });

router.get("/register", auth.isLogout, userController.loadRegister);

router.post("/register", userController.insertUser);
router.get("/verify", userController.verifyMail);
router.get("/register", auth.isLogout, userController.loadRegister);
router.get("/", userController.loadHome);
router.get("/login", auth.isLogout, userController.loadLogin);
router.post("/login", userController.verifyLogin);
router.get("/home", auth.isLogin, userController.loadHome);
router.get("/logout", auth.isLogin, userController.userLogout);
router.get("/forget", userController.forgetLoad);
//router.get("/forget", auth.isLogOut, userController.forgetLoad);
router.post("/forget", userController.sendResetLink);
router.get(
  "/forget-password",
  auth.isLogout,
  userController.forgetPasswordLoad
);
router.post("/forget-password", userController.resetPassword);
router.get("/forget-password", userController.resetPassword);
router.get("/single-page", auth.isLogin, userController.viewSinglepage);
router.get("/productByPlant", auth.isLogin, userController.getProductByPlant);
router.get("/productBySeed", auth.isLogin, userController.getProductBySeed);
router.get("/productByPot", auth.isLogin, userController.getProductByPot);
router.get(
  "/productByPlantcare",
  auth.isLogin,
  userController.getProductByPlantcare
);
router.post("/add-cart", userController.addToCart);
router.get("/addtocart", auth.isLogin, userController.viewaddToCart);
router.post("/change-product-quantity", userController.changeProductQuantity);
router.get("/user-profile", auth.isLogin, userController.viewuserProfile);
router.post("/user-edit", userController.editUser);
router.get("/address", auth.isLogin, userController.loadAddressList);
router.post("/address", userController.addingAddress);
router.post("/add-new-address", userController.addingNewAddress);
router.get("/delete-address", auth.isLogin, userController.deletingAddress);
router.post("/change-address", userController.changingTheAddress);
router.post("/set-as-default", userController.settingAsDefault);
router.get("/checkout", auth.isLogin, userController.loadingCheckoutPage);
router.post("/address-edit", auth.isLogin, userController.editingAddress);

//router.post("/cancellingOrder", auth.isLogin, userController.cancellingOrder);
router.post("/place-order", auth.isLogin, userController.placeOrder);
router.get("/order-details", auth.isLogin, userController.orderDetails);
router.get("/ordersView", auth.isLogin, userController.loadOrdersView);
router.post("/cancel-order", userController.cancellOrder);
router.post("/return-order", userController.returnOrder);

router.post("/verify-payment", userController.verifyPayment);
router.get("/orderPlaced", auth.isLogin, userController.orderPlaced);
router.get("/orderFailed", auth.isLogin, userController.orderFailed);
router.get("/coupon-verify/:id", auth.isLogin, couponController.verifyCoupon);
router.get("/apply-coupon/:id", auth.isLogin, couponController.applyCoupon);
router.get("/searchProduct", auth.isLogin, userController.searchProduct);
router.get("/error", auth.isLogin, userController.errorPage);

/* ========================Wishlist Route======================== */

router.get("/wishlist", userController.userWishlistGET);

router.post(
  "/modify-wishlist",

  userController.modifyUserWishlistPOST
);

/* ======================== Error handling page======================== */

router.get("/error-page", auth.isLogin, userController.errorHandlerPageGET);
router.get("/access-forbidden", userController.accessForbiddenPageGET);
// router.get("/order-details", auth.isLogin, userController.orderDetails);
// router.get("/ordersView", auth.isLogin, userController.loadOrdersView);
// router.post("/cancel-order", userController.cancellOrder);

module.exports = router;
