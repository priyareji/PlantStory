var express = require("express");
var router = express.Router();
const adminController = require("../controllers/adminController");
const bcryptjs = require("bcrypt");
const config = require("../config/config");
const bodyParser = require("body-parser");
const path = require("path");
const adminAuth = require("../middleware/adminauth");
const multer = require("multer");
const multerr = require("../multer/multer");
const couponController = require("../controllers/couponController");
const productController = require("../controllers/productController");
//const couponHelper = require("../../helpers/adminHelper/couponHelper");

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("admin", { title: "Express" });
// });
const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage: Storage });
//=============================login & =================================================//

router.get("/", adminAuth.adminIsLogout, adminController.loadLogin);
router.post("/login", adminController.verifyLogin);
router.post("/logout", adminAuth.adminIsLogout, adminController.logout);
//==============================load home================================================//
router.get("/home", adminAuth.adminIsLogin, adminController.loadDashboard);
router.get(
  "/user-manage",
  adminAuth.adminIsLogin,
  adminController.loadUserManage
);
router.get("/edit-user", adminAuth.adminIsLogin, adminController.editUser);
router.put("/edit-user", adminAuth.adminIsLogin, adminController.updatingUser);
router.get("/block-user", adminAuth.adminIsLogin, adminController.blockUser);
router.get(
  "/blocked-userlist",
  adminAuth.adminIsLogin,
  adminController.blockUserlist
);
router.get("/unblocked-userlist", adminController.unblockUserlist);
router.get("/product", adminAuth.adminIsLogin, adminController.loadproduct);
router.post("/product", uploads.array("image", 4), adminController.addproduct);
router.get(
  "/editproduct",
  adminAuth.adminIsLogin,
  adminController.editProductsView
);
router.post(
  "/edit-product",
  uploads.array("image", 5),
  adminController.editProducts
);
router.post(
  "/editproduct",
  multerr.editeduploads,
  productController.postEditProduct
);
//upload.array('image')
router.get("/category", adminAuth.adminIsLogin, adminController.getcategory);
router.post(
  "/category",
  //adminAuth.adminLogin,
  uploads.single("image"),
  adminController.addcategory
);
router.get(
  "/categoryActivate",
  //adminAuth.adminLogin,
  adminAuth.adminIsLogin,
  adminController.category_activate
);
router.get(
  "/categoryInactivate",
  //adminAuth.adminLogin,
  adminAuth.adminIsLogin,
  adminController.category_inactivate
);
router.get(
  "/productActivate",
  //adminAuth.adminLogin,
  adminAuth.adminIsLogin,
  adminController.product_activate
);
router.get(
  "/productInactivate",
  //adminAuth.adminLogin,
  adminAuth.adminIsLogin,
  adminController.product_inactivate
);
router.get("/ordersList", adminController.loadOrdersList);
router.get(
  "/ordersView",
  // adminAuth.adminLogin,
  adminAuth.adminIsLogin,
  adminController.loadOrdersView
);

router.post(
  "/cancel-by-admin",
  //adminAuth.adminLogin,
  adminController.cancelledByAdmin
);
router.post(
  "/reject-by-admin",
  //adminAuth.adminLogin,
  adminController.rejectCancellation
);
router.post(
  "/prepare-by-admin",
  //adminAuth.adminLogin,
  adminController.packingOrder
);
router.post(
  "/deliver-by-admin",
  // adminAuth.adminLogin,
  adminController.deliveredOrder
);
router.post(
  "/return-conformedby-admin",
  // adminAuth.isAdminLogin,
  adminController.retunedConfirmation
);
/* GET Add Coupon Page. */
router.get("/add-coupon", couponController.getAddCoupon);
router.post(
  "/add-coupon",
  //  adminAuth.adminLogin,
  couponController.postaddCoupon
);
router.get(
  "/coupon-list",
  //adminAuth.adminLogin,
  adminAuth.adminIsLogin,
  couponController.getCouponList
);

router.get(
  "/couponactivate",
  adminAuth.adminIsLogin,
  couponController.coupon_activate
);
router.get(
  "/couponInactivate",
  adminAuth.adminIsLogin,
  couponController.coupon_inactivate
);
router.get(
  "/generate-coupon-code",
  // adminAuth.adminLogin,
  adminAuth.adminIsLogin,
  couponController.generatorCouponCode
);
router.delete(
  "/remove-coupon",
  //adminAuth.adminLogin,
  adminAuth.adminIsLogin,
  couponController.removeCoupon
);
router.get("/salesPage", adminAuth.adminIsLogin, adminController.loadSalesPage);
router.get(
  "/getTodaySales",
  adminAuth.adminIsLogin,
  adminController.getSalesToday
);
router.get(
  "/getWeekSales",
  adminAuth.adminIsLogin,
  adminController.getWeekSales
);
router.get(
  "/getMonthlySales",
  adminAuth.adminIsLogin,
  adminController.getMonthSales
);
router.get(
  "/getYearlySales",
  adminAuth.adminIsLogin,
  adminController.getYearlySales
);
router.post("/salesWithDate", adminController.salesWithDate);
router.get(
  "/salesReport",
  adminAuth.adminIsLogin,
  adminController.downloadSalesReport
);

// // get coupon list
// router
//   .route("/coupon-list")
//   .get(auth.adminAuth, couponController.getCouponList);

// // remove coupon
// router.route("/remove-coupon").delete(couponController.removeCoupon);
//
router.get("*", function (req, res) {
  res.redirect("/admin");
});

module.exports = router;
