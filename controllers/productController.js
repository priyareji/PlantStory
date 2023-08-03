const productHelper = require("../helpers/adminHelper/productHelper");
const Product = require("../models/productModel");
module.exports = {
  postEditProduct: async (req, res) => {
    //let proId = req.params.id;
    let proId = req.query.id;
    let file = req.files;
    let image = [];
    console.log(proId, "proid");
    let previousImages = await productHelper.getPreviousImages(proId);

    console.log(previousImages, "oldimage");
    console.log(file, "uploaded");

    if (req.files.image1) {
      image.push(req.files.image1[0].filename);
    } else {
      image.push(previousImages[0]);
    }

    if (req.files.image2) {
      image.push(req.files.image2[0].filename);
    } else {
      image.push(previousImages[1]);
    }
    if (req.files.image3) {
      image.push(req.files.image3[0].filename);
    } else {
      image.push(previousImages[2]);
    }
    if (req.files.image4) {
      image.push(req.files.image4[0].filename);
    } else {
      image.push(previousImages[3]);
    }

    productHelper.postEditProduct(proId, req.body, image).then(() => {
      res.redirect("/admin/product");
    });
  },
};
