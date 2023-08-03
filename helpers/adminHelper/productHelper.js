const Product = require("../../models/productModel");

module.exports = {
  postEditProduct: (proId, product, image) => {
    console.log("hello");

    return new Promise(async (resolve, _reject) => {
      await Product.updateOne(
        { _id: proId },
        {
          $set: {
            productname: product.productname,
            // brand: product.brand,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            category: product.category,
            image: image,
            stock: product.stock,
          },
        }
      ).then((response) => {
        resolve(response);
      });
    });
  },
  //to get images for edit product
  getPreviousImages: (proId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await Product.findOne({ _id: proId }).then((response) => {
          resolve(response.image);
          console.log(response, ";;;;;;;;;;;;;;;;;;;;;;;;;");
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
};
