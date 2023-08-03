const mongoose = require("mongoose");
const adminSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  //   image: {
  //     type: String,
  //     required: true,
  //   },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    required: true,
    default: 0,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  is_blocked: {
    type: Boolean,
    default: false,
  },
});
// const productSchema = mongoose.Schema({
//   productname: {
//     type: String,
//     required: true,
//   },
//   size: {
//     type: Number,
//     required: true,
//   },
//   //   image: {
//   //     type: String,
//   //     required: true,
//   //   },
//   category: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//     default: 0,
//   },
//   price: {
//     type: Number,
//     default: 0,
//   },
//   stock: {
//     type: Number,
//     default: 0,
//   },
// });
module.exports = mongoose.model("admin", adminSchema);
