const mongoose = require("mongoose");
const productSchema = mongoose.Schema({
  productname: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: [String],
    required: true,
  },

  // size: {
  //   type: Number,
  //   required: true,
  // },
  stock: {
    type: Number,
    required: true,
  },
  is_activate: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
