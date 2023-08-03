const { response } = require("../../app");
const voucherCode = require("voucher-code-generator");
const couponModel = require("../../models/couponModel");
const userModel = require("../../models/userModel");

module.exports = {
  generatorCouponCode: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let couponCode = voucherCode.generate({
          length: 6,
          count: 1,
          charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          prefix: "Promo-",
        });
        resolve({ status: true, couponCode: couponCode[0] });
      } catch (err) {}
    });
  },

  postaddCoupon: (data) => {
    try {
      return new Promise((resolve, reject) => {
        couponModel.findOne({ couponCode: data.couponCode }).then((coupon) => {
          if (coupon) {
            resolve({ status: false });
          } else {
            couponModel(data)
              .save()
              .then((response) => {
                resolve({ status: true });
              });
          }
        });
      });
    } catch (error) {
      console.log(error.mesage);
    }
  },

  getCouponList: () => {
    try {
      return new Promise((resolve, reject) => {
        couponModel.find().then((coupon) => {
          resolve(coupon);
        });
      });
    } catch (error) {
      console.log(error.mesage);
    }
  },

  // to apply coupon and minus the total amount from it
  applyCoupon: (couponCode, total) => {
    try {
      console.log(couponCode, total, "applycoupon code and total-----------");
      return new Promise((resolve, reject) => {
        couponModel.findOne({ couponCode: couponCode }).then((couponExist) => {
          if (couponExist) {
            console.log("coupon exits");
            if (new Date(couponExist.validity) - new Date() > 0) {
              if (total >= couponExist.minPurchase) {
                let discountAmount =
                  (total * couponExist.minDiscountPercentage) / 100;
                console.log(discountAmount, "discountAmount-----------");
                if (discountAmount > couponExist.maxDiscountValue) {
                  discountAmount = couponExist.maxDiscountValue;
                  console.log(discountAmount, "discountAmount++++++++++++++");
                  resolve({
                    status: true,
                    discountAmount: discountAmount,
                    discount: couponExist.minDiscountPercentage,
                    couponCode: couponCode,
                  });
                } else {
                  resolve({
                    status: true,
                    discountAmount: discountAmount,
                    discount: couponExist.minDiscountPercentage,
                    couponCode: couponCode,
                  });
                }
              } else {
                resolve({
                  status: false,
                  message: `Minimum purchase amount is ${couponExist.minPurchase}`,
                });
              }
            } else {
              resolve({
                status: false,
                message: "Counpon expired",
              });
            }
          } else {
            resolve({
              status: fasle,
              message: "Counpon doesnt Exist",
            });
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  //to save coupon code on user collection
  addCouponToUser: (couponCode, userId) => {
    try {
      return new Promise((resolve, reject) => {
        couponModel.user
          .updateOne(
            { _id: userId },
            {
              $push: {
                coupons: couponCode,
              },
            }
          )
          .then((couponAdded) => {
            resolve(couponAdded);
          });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  verifyCoupon: (userId, couponCode) => {
    try {
      return new Promise((resolve, reject) => {
        couponModel
          .find({ couponCode: couponCode })
          .then(async (couponExist) => {
            console.log("foundddddddddddddddddddddddddddddd");
            if (couponExist.length > 0) {
              if (new Date(couponExist[0].validity) - new Date() > 0) {
                let usersCoupon = await userModel.findOne({
                  _id: userId,
                  coupons: { $in: [couponCode] },
                });

                if (usersCoupon) {
                  resolve({
                    status: false,
                    message: "Coupon already used by the user",
                  });
                } else {
                  resolve({
                    status: true,
                    message: "Coupon added successfully",
                  });
                }
              } else {
                resolve({ status: false, message: "Coupon has expired" });
              }
            } else {
              resolve({ status: false, message: "Coupon doesn't exist" });
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    } catch (error) {
      console.log(error.message);
      // Handle the error appropriately
    }
  },

  // verifyCoupon: (userId, couponCode) => {
  //   try {
  //     return new Promise((resolve, reject) => {
  //       couponModel
  //         .find({ couponCode: couponCode })
  //         .then(async (couponExist) => {
  //           console.log("foundddddddddddddddddddddddddddddd");
  //           if (couponExist) {
  //             if (new Date(couponExist[0].validity) - new Date() > 0) {
  //               let usersCoupon = await userModel.findOne({
  //                 _id: userId,
  //                 coupons: { $in: [couponCode] },
  //               });

  //               if (usersCoupon) {
  //                 resolve({
  //                   status: false,
  //                   message: "Coupon already used by the user",
  //                 });
  //               } else {
  //                 resolve({
  //                   status: true,
  //                   message: "Coupon added successfuly",
  //                 });
  //               }
  //             } else {
  //               resolve({ status: false, message: "Coupon have expiried" });
  //             }
  //           } else {
  //             resolve({ status: false, message: "Coupon doesnt exist" });
  //           }
  //         });
  //     });
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // },
  removeCoupon: (couponId) => {
    try {
      return new Promise((resolve, reject) => {
        couponModel.deleteOne({ _id: couponId }).then(() => {
          resolve();
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
};
