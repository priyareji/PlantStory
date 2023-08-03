//const { response } = require("../../app");
const couponHelper = require("../helpers/adminHelper/coupenHelper");
const userHelpers = require("../helpers/userHelper");
const Coupon = require("../models/couponModel");
const User = require("../models/userModel");
const moment = require("moment-timezone");

module.exports = {
  // get coupon
  getAddCoupon: async (req, res) => {
    // let admin = req.session.admin;
    const adminUser = await User.findOne({
      is_admin: req.session.is_admin,
    }).lean();
    res.render("admin/couponAdd", { layout: "adminlayout", admin: adminUser });
  },
  coupon_activate: async (req, res) => {
    try {
      const id = req.query.id;
      console.log("activate", id);
      await Coupon.findByIdAndUpdate(
        { _id: id },

        {
          $set: {
            is_activate: true,
          },
        }
      );
      const couponList = await Coupon.find().lean();
      res.render("admin/couponList", {
        layout: "adminLayout",
        couponList,
      });
    } catch (error) {
      console.error(error.message);
      res.render("error", { message: "Error loading user list" }); // Render an error page with a suitable error message
    }
  },
  coupon_inactivate: async (req, res) => {
    try {
      const id = req.query.id;
      await Coupon.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            is_activate: false,
          },
        }
      );
      const couponList = await Coupon.find().lean();
      res.render("admin/couponList", {
        layout: "adminLayout",
        couponList,
      });
    } catch (error) {
      console.error(error.message);
      res.render("error", { message: "Error loading user list" }); // Render an error page with a suitable error message
    }
  },
  // generate coupon
  generatorCouponCode: (req, res) => {
    couponHelper.generatorCouponCode().then((couponCode) => {
      res.send(couponCode);
    });
  },

  // post coupon
  postaddCoupon: (req, res) => {
    let data = {
      couponCode: req.body.coupon,
      validity: req.body.validity,
      minPurchase: req.body.minPurchase,
      minDiscountPercentage: req.body.minDiscountPercentage,
      maxDiscountValue: req.body.maxDiscount,
      description: req.body.description,
      useageCount: req.body.useageCount,
    };
    couponHelper.postaddCoupon(data).then((response) => {
      res.send(response);
    });
  },

  getCouponLists: (req, res) => {
    let admin = req.session.adminId;
    couponHelper.getCouponList().then((couponList) => {
      // });

      res.render("admin/couponList", {
        layout: "adminlayout",
        admin,
        couponList,
      });
    });
  },
  // getCouponList: async (req, res) => {
  //   try {
  //     const couponList = await Coupon.find().lean();
  //     console.log(couponList, "couponList....................");

  //     res.render("admin/couponList", {
  //       layout: "adminlayout",
  //       couponList,
  //     });
  //   } catch (error) {
  //     console.error(error.message);
  //     res.render("error", { message: "Error loading user list" }); // Render an error page with a suitable error message
  //   }
  // },

  getCouponList: async (req, res) => {
    try {
      const couponList = await Coupon.find().lean();

      // Format the validity date with the specified format and timezone
      for (const coupon of couponList) {
        coupon.validityFormatted = moment(coupon.validity)
          .tz("Asia/Kolkata")
          .format("DD-MM-YYYY h:mm A");
      }

      console.log(couponList, "couponList....................");

      res.render("admin/couponList", {
        layout: "adminlayout",
        couponList,
      });
    } catch (error) {
      console.error(error.message);
      res.render("error", { message: "Error loading user list" }); // Render an error page with a suitable error message
    }
  },

  removeCoupon: (req, res) => {
    let couponId = req.body.couponId;
    couponHelper.removeCoupon(couponId).then((response) => {
      res.send(response);
    });
  },
  verifyCoupon: (req, res) => {
    let couponCode = req.params.id;
    console.log("couponcode..........", couponCode);
    let userId = req.session.user_id;
    console.log("useridddddddddddd", userId);
    couponHelper.verifyCoupon(userId, couponCode).then((response) => {
      res.send(response);
      // console.log("response", response);
    });
  },

  applyCoupon: async (req, res) => {
    let couponCode = req.params.id;
    let userId = req.session.user_id;
    let total = await userHelpers.getCartValue(userId);
    console.log(total);
    couponHelper.applyCoupon(couponCode, total).then((response) => {
      res.send(response);
      console.log(response);
    });
  },
};
