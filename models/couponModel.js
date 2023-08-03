const mongoose = require("mongoose");
const couponSchema = mongoose.Schema({
  couponCode: {
    type: String,
  },
  validity: {
    type: Date,
    default: new Date(),
  },
  useageCount: { type: Number },
  minPurchase: { type: Number },
  minDiscountPercentage: { type: Number },
  maxDiscountValue: { type: Number },
  description: { type: String },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  is_activate: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Coupon", couponSchema);
