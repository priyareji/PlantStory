const Wishlist = require("../models/wishlistModel");

const wishList = async (req, res) => {
  try {
    res.render("users/wishList", { layout: "userlayout" });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
module.exports = {
  wishList,
};
