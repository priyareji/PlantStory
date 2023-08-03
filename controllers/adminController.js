const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const config = require("../config/config");
const session = require("express-session");
const multer = require("multer");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const mongoose = require("mongoose");
const adminHelpers = require("../helpers/adminHelper/adminHelper");
const fs = require("fs");
const pdfPrinter = require("pdfmake");
const exceljs = require("exceljs");

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(_dirnae, "../public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage: Storage });

///  for loading login pag
const loadLogin = async (req, res) => {
  try {
    res.render("admin/login", { layout: "adminlayout" });
  } catch (error) {
    console.log(error.message);
  }
};
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    console.log(userData);
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      console.log("ssssssssssssssssssssssssssssssss");
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
          res.render("admin/login", {
            message: "Email and Password are invalid",
            layout: "adminlayout",
          });
        } else {
          console.log("ggggggggggggggggggggggggggggggggggggggggg");
          req.session.adminId = userData._id;
          req.session.is_admin = userData.is_admin;

          console.log(
            req.session.adminId,
            req.session.is_admin,
            "[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[["
          );
          console.log(req.session, "req.session");
          res.redirect("/admin/home");
        }
      }
    } else {
      res.render("admin/login", {
        message: "Email and password are invalid",
        layout: "adminlayout",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//admin logout
const logout = async (req, res) => {
  try {
    delete req.session.adminId;
    delete req.session.is_admin;
    res.redirect("/");
  } catch (error) {
    throw new Error(error.message);
    res.redirect("/error");
  }
};

const loadDashboard = async (req, res) => {
  try {
    const dashBoardDetails = await adminHelpers.loadingDashboard(req, res);
    const orderDetails = await adminHelpers.OrdersList(req, res);
    const totalUser = dashBoardDetails.totaluser;
    const totalSales = dashBoardDetails.totalSales;
    const salesbymonth = dashBoardDetails.salesbymonth;
    const paymentMethod = dashBoardDetails.paymentMethod;
    const yearSales = dashBoardDetails.yearSales;
    const todaySales = dashBoardDetails.todaySales;
    console.log(todaySales, "todaySales");
    console.log(totalUser, "totalUser");
    console.log(totalSales, "totalSales");

    console.log(paymentMethod, "paymentMethod");
    console.log(yearSales, "yearSales");
    // console.log(orderDetails, "orderDetailsssssssssssssssssssssssssss");
    const todaySalesAmount = todaySales[0].totalAmount;
    const totalSalesAmount = totalSales[0].totalSum;
    const yearSalesTotal = yearSales[0].totalSales;
    console.log(salesbymonth, ";;;;;;;;;;;;;;;;;;;;;");
    let sales = encodeURIComponent(JSON.stringify(salesbymonth));
    console.log(
      sales,
      "sales---------------------==============---------------------"
    );
    // console.log(
    //   todaySalesAmount,
    //   totalSalesAmount,
    //   yearSalesTotal,
    //   salesbymonth,
    //   "-----------------------------------------------000000000000000000------------"
    // );
    // const UserData = await User.findById({ _id: req.session.user_id });
    // // console.log(UserData, "userdataaa");
    // console.log("loginnn");
    res.render("admin/home", {
      layout: "adminlayout",
      totalUser,
      todaySales,
      totalSales,
      todaySalesAmount,
      totalSalesAmount,
      salesbymonth: encodeURIComponent(JSON.stringify(salesbymonth)),
      paymentMethod: encodeURIComponent(JSON.stringify(paymentMethod)),
      yearSalesTotal,
      orderDetails: orderDetails,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadUserManage = async (req, res) => {
  try {
    console.log(req.session.user_id);
    const userData = await User.find({ is_admin: 0 }).lean();
    res.render("admin/userlist", { layout: "adminlayout", user: userData });
  } catch (error) {
    console.error(error.message);
    res.render("error", { message: "Error loading user list" }); // Render an error page with a suitable error message
  }
};
const editUser = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(req.query, "asaaa");
    console.log(req.query.id, "dasaaa");
    const userData = await User.findById({ _id: id }).lean();
    if (userData) {
      res.render("admin/edit-user", { layout: "adminlayout", user: userData });
    } else {
      res.redirect("/admin/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const updatingUser = async (req, res) => {
  try {
    const id = req.body.id;

    const userData = await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          is_verified: req.body.verify,
        },
      }
    );
    res.redirect("/admin/usermanage");
  } catch (error) {
    throw new Error(error.message);
  }
};
// router.get("/edit-product/:id", async (req, res) => {
//   let product = await productHelpers.getProductDetails(req.params.id);
//   res.render("admin/edit-product", { product });
// });
const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.deleteOne({ _id: id });
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};
const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id, "idddddddddd");
    await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_blocked: true,
        },
      }
    );
    res.redirect("/admin/user-manage");
  } catch (error) {
    throw new Error(error.message);
  }
};

const blockUserlist = async (req, res) => {
  try {
    // console.log(req.query.user_id);
    const userData = await User.find({ is_blocked: true }).lean();
    // console.log(userData);
    res.render("admin/block-userlist", {
      layout: "adminlayout",
      user: userData,
    });
  } catch (error) {
    console.error(error.message);
    res.render("error", { message: "Error loading user list" }); // Render an error page with a suitable error message
  }
};

const unblockUserlist = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id, "idddddddddd");
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_blocked: false,
        },
      }
    );
    res.redirect("/admin/user-manage");
  } catch (error) {
    console.error(error.message);
    res.render("error", { message: "Error loading user list" }); // Render an error page with a suitable error message
  }
};
const loadproduct = async (req, res) => {
  try {
    const updatedProducts = await Product.find().lean();

    // Create a lookup object for category names
    const categoryLookup = {};
    const categories = await Category.find().lean();

    categories.forEach((category) => {
      categoryLookup[category._id] = category.category;
    });

    const productWithSerialNumber = updatedProducts.map((product, index) => ({
      ...product,
      serialNumber: index + 1,
      category: categoryLookup[product.category],
    }));

    console.log("Retrieving categories...");
    console.log("Categories:", categories);
    console.log(updatedProducts, "updated");
    console.log(productWithSerialNumber, "product");
    res.render("admin/product-manage", {
      layout: "adminlayout",
      products: updatedProducts,
      categories: categories,
    });
    // console.log(products, "popo");
  } catch (error) {
    console.log(error.message);
  }
};

const addproduct = async (req, res) => {
  try {
    var arrayImage = [];
    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        arrayImage[i] = req.files[i].filename;
      }
    }

    console.log("hellooo", req.body);
    const product = new Product({
      productname: req.body.productname,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      //image: req.file.filename,
      image: arrayImage,
      // size: req.body.size,
      stock: req.body.stock,
    });
    console.log(product, "productz");
    const addProduct = await product.save();
    console.log(addProduct, "addproductzz");
    if (addProduct) {
      const updatedProducts = await Product.find().lean();

      // Create a lookup object for category names
      const categoryLookup = {};
      const categories = await Category.find().lean();
      categories.forEach((category) => {
        categoryLookup[category._id] = category.category;
        console.log(category);
      });
      console.log(categories, "categoriessss");
      const productWithSerialNumber = updatedProducts.map((product, index) => ({
        ...product,
        serialNumber: index + 1,
        category: categoryLookup[product.category] || "Unknown Category",
      }));
      // console.log("prooo", productWithSerialNumber);

      res.render("admin/product-manage", {
        layout: "adminlayout",
        products: productWithSerialNumber,
        categories: categories,
      });
    }
    // console.log("prooo", productWithSerialNumber);
  } catch (error) {
    console.log(error.message);
  }
};

const editProductsView = async (req, res) => {
  try {
    const id = req.query.id;

    const categories = await Category.find({ is_activate: true }).lean();
    console.log(categories);
    const categoryData = {};
    categories.forEach((data) => {
      categoryData[data._id.toString()] = {
        _id: data._id.toString(),
        category: data.category,
      };
    });

    const categoryLookup = {};
    categories.forEach((category) => {
      categoryLookup[category._id.toString()] = category.category;
    });

    // Define the lookupCategory helper function
    const lookupCategory = function (categoryId) {
      return categoryLookup[categoryId] || "Unknown";
    };

    const updatedProduct = await Product.findById(id).lean();

    console.log(updatedProduct, "updatedproducts");
    if (updatedProduct) {
      const productWithCategoryName = {
        ...updatedProduct,
        category: lookupCategory(updatedProduct.category),
      };
      console.log("products:", productWithCategoryName);
      console.log("categories", categoryData);
      res.render("admin/edit-product", {
        layout: "adminlayout",
        product: updatedProduct,
        categories: categoryData,
      });
    } else {
      console.log("Product not found");
      res.redirect("/admin/product");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
const editProducts = async (req, res) => {
  try {
    console.log(req.files, "hi");
    const id = req.query.id;
    object_id = new mongoose.Types.ObjectId(req.query.id);

    console.log(id, "----------------");
    console.log(object_id, "+++++++++++");
    const product = await Product.findById({
      _id: new mongoose.Types.ObjectId(req.query.id),
    }).lean();
    console.log(product, "product");
    console.log(req.body.category, "coming to updating");

    const categoryId = req.body.category;

    let updatedProductData = {
      productname: req.body.productname,
      price: req.body.price,
      description: req.body.description,
      stock: req.body.stock,
      category: new mongoose.Types.ObjectId(categoryId),
      image: product.image, // Use the previous image data as the starting point
    };
    console.log(updatedProductData, "updatedProductData");
    if (req.files && req.files.length > 0) {
      updatedProductData.image = req.files.map((file) => file.filename); // Update with the new image filenames
    }

    const product1 = await Product.findByIdAndUpdate(
      { _id: "object_id" },
      { $set: "updatedProductData" }
    );
    console.log(product1, "product1");
    // res.redirect("/admin/product");
    res.render("admin/product-manage", {
      layout: "adminlayout",
      product: product1,
      //categories: categoryData,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// updatingProducts: async (req, res) => {
//   try {
//     console.log(req.files, 'hi');
//     const id = req.query.id;
//     console.log(id, '----------------');
//     const product = await Product.findById({ _id: new mongoose.Types.ObjectId(req.query.id) }).lean();
//     console.log(product, 'product');
//     console.log(req.body.category, "coming to updating");

//     const categoryId = req.body.category;

//     let updatedProductData = {
//       name: req.body.name,
//       price: req.body.price,
//       description: req.body.description,
//       category: new mongoose.Types.ObjectId(categoryId),
//       image: product.image, // Use the previous image data as the starting point
//     };
//     console.log(updatedProductData, 'updatedProductData');
//     if (req.files && req.files.length > 0) {
//       updatedProductData.image = req.files.map((file) => file.filename); // Update with the new image filenames
//     }

//     const product1 = await Product.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(req.query.id) }, { $set: updatedProductData });
//     console.log(product1, 'product1');
//     res.redirect('/admin/products');
//   } catch (error) {
//     throw new Error(error.message);
//   }
// },
const addcategory = async (req, res) => {
  try {
    const category = req.body.category.toUpperCase();

    const existingCategory = await Category.findOne({
      category: { $regex: new RegExp("^" + category + "$", "i") },
    });
    if (existingCategory) {
      const errorMessage = "category already exits";
      const updatedcategory = await Category.find().lean();
      const categoryWithSerialNumber = updatedcategory.map(
        (category, index) => ({
          ...category,
          serialNumber: index + 1,
        })
      );

      return res.render("admin/category-manage", {
        layout: "adminlayout",
        category: categoryWithSerialNumber,
        error: errorMessage,
      });
    }
    const newCategory = new Category({
      category: category,
    });
    const categories = await newCategory.save();
    return res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

// const addcategory = async (req, res) => {
//   try {
//     // const category = new Category({
//     //   category: req.body.category.toUpperCase();
//     //   image: req.file.filename,
//     //   is_activate: true,
//     // });
//     const category = req.body.category.toUpperCase();

//         const existingCategory = await Category.findOne({
//           category: { $regex: new RegExp("^" + category + "$", "i") },
//         });
//         if (existingCategory) {
//           const errorMessage = "category already exits";
//           const updatedcategory = await Category.find().lean();
//           const categoryWithSerialNumber = updatedcategory.map(
//             (category, index) => ({
//               ...category,
//               serialNumber: index + 1,
//             })
//           );

//     console.log(category);
//     // const categoryWithSerialNumber = updatedProducts.map((product, index) => ({
//     //   ...category,
//     //   serialNumber: index + 1,
//     // }));
// const addCategory = async (req, res) => {
//       try {
//         const category = req.body.category.toUpperCase();

//         const existingCategory = await Category.findOne({
//           category: { $regex: new RegExp("^" + category + "$", "i") },
//         });
//         if (existingCategory) {
//           const errorMessage = "category already exits";
//           const updatedcategory = await Category.find().lean();
//           const categoryWithSerialNumber = updatedcategory.map(
//             (category, index) => ({
//               ...category,
//               serialNumber: index + 1,
//             })
//           );

//           return res.render("admin/category", {
//             // layouts: "admin-layout",
//             category: categoryWithSerialNumber,
//             error: errorMessage,
//           });
//         }
//         const newCategory = new Category({
//           category: category,
//         });
//         const categories = await newCategory.save();
//         return res.redirect("/admin/category");
//       } catch (error) {
//         console.log(error.message);
//       }
//     };

//     const categoryData = await category.save();
//     if (categoryData) {
//       // console.log(categoryData);

//       res.render("admin/category-manage", {
//         message: "Category Created  successfully",
//         layout: "adminLayout",
//       });
//     } else {
//       res.render("/admin/category-manage", {
//         message: "your registration has ben Failed",
//         layout: "adminLayout",
//       });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };
const product_activate = async (req, res) => {
  try {
    const id = req.query.id;
    await Product.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_activate: true,
        },
      }
    );
  } catch (error) {
    console.error(error.message);
    res.render("error", { message: "Error loading user list" }); // Render an error page with a suitable error message
  }
};
const product_inactivate = async (req, res) => {
  try {
    const id = req.query.id;
    await Product.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_activate: false,
        },
      }
    );
  } catch (error) {
    console.error(error.message);
    res.render("error", { message: "Error loading user list" }); // Render an error page with a suitable error message
  }
};
const getcategory = async (req, res) => {
  try {
    const categoryData = await Category.find().lean();
    console.log(categoryData, "categgoorryy");
    if (categoryData) {
      res.render("admin/category-manage", {
        layout: "adminlayout",
        category: categoryData,
      });
    } else {
      res.redirect("/admin/category-manage");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const category_activate = async (req, res) => {
  try {
    const id = req.query.id;
    await Category.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_activate: true,
        },
      }
    );
    res.redirect("/admin/category");
  } catch (error) {
    console.error(error.message);
    res.render("error", { message: "Error loading user list" }); // Render an error page with a suitable error message
  }
};
const category_inactivate = async (req, res) => {
  console.log("clicked");
  try {
    const id = req.query.id;
    console.log("id", id);
    await Category.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_activate: false,
        },
      }
    );
    res.redirect("/admin/category");
  } catch (error) {
    console.error(error.message);
    res.render("error", { message: "Error loading user list" }); // Render an error page with a suitable error message
  }
};

const loadOrdersList = async (req, res) => {
  try {
    console.log("clickedd----------");
    const orderDetails = await Order.find()
      .sort({ date: -1 })
      .populate("userId")
      .lean();
    console.log(orderDetails, "orderDetails");

    const orderHistory = orderDetails.map((history) => {
      let createdOnIST = moment(history.date)
        .tz("Asia/Kolkata")
        .format("DD-MM-YYYY h:mm A");

      return { ...history, date: createdOnIST, userName: history.userId.name };
    });

    // Calculate the total number of items in each order
    const orderHistoryWithItemCount = orderHistory.map((order) => {
      const itemCount = order.products.reduce(
        (total, product) => total + product.quantity,
        0
      );
      return { ...order, itemCount };
    });

    console.log(orderHistoryWithItemCount, "orderHistoryWithItemCount");

    // Pagination logic (remaining code remains the same)
    const itemsPerPage = 10;
    const currentPage = req.query.page || 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = orderHistoryWithItemCount.slice(
      startIndex,
      endIndex
    );
    const totalPages = Math.ceil(
      orderHistoryWithItemCount.length / itemsPerPage
    );

    res.render("admin/orderList", {
      layout: "adminlayout",
      orderDetails: paginatedItems,
      totalPages: totalPages,
      currentPage: parseInt(currentPage),
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// const loadOrdersViews = async (req, res) => {
//   try {
//     const orderId = req.query.id;

//     console.log(orderId, "orderId");
//     const order = await Order.findOne({ _id: orderId }).populate({
//       path: "products.productId",
//       select: "name price image",
//     });

//     const createdOnIST = moment(order.date)
//       .tz("Asia/Kolkata")
//       .format("DD-MM-YYYY h:mm A");
//     order.date = createdOnIST;

//     const orderDetails = order.products.map((product) => {
//       const images = product.productId.image || []; // Set images to an empty array if it is undefined
//       const image = images.length > 0 ? images[0] : ""; // Take the first image from the array if it exists

//       return {
//         name: product.productId.name,
//         image: image,
//         price: product.productId.price,
//         total: product.total,
//         quantity: product.quantity,
//         status: order.orderStatus,
//       };
//     });

//     const deliveryAddress = {
//       name: order.addressDetails.name,
//       homeAddress: order.addressDetails.homeAddress,
//       city: order.addressDetails.city,
//       street: order.addressDetails.street,
//       postalCode: order.addressDetails.postalCode,
//     };

//     const subtotal = order.orderValue;
//     const cancellationStatus = order.cancellationStatus;
//     console.log(cancellationStatus, "cancellationStatus");

//     console.log(subtotal, "subtotal");

//     console.log(orderDetails, "orderDetails");
//     console.log(deliveryAddress, "deliveryAddress");

//     res.render("admin/ordersView", {
//       layout: "adminlayout",
//       orderDetails: orderDetails,
//       deliveryAddress: deliveryAddress,
//       subtotal: subtotal,

//       orderId: orderId,
//       orderDate: createdOnIST,
//       cancellationStatus: cancellationStatus,
//     });
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// const cancelledOrderByAdmin = async (requestData) => {
//   try {
//     const orderId = requestData;
//     console.log(orderId, "orderidddddddddddddd");
//     await Order.findByIdAndUpdate(
//       { _id: new ObjectId(orderId) },
//       { $set: { orderStatus: "cancelled", cancellationStatus: "cancelled" } },
//       { new: true } // This ensures that the updated document is returned
//     ).exec();

//     console.log(updateOrder, "updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");

//     return updateOrder;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// const rejectCancellation = async (requestData) => {
//   try {
//     const orderId = requestData;
//     console.log(orderId, "orderidddddddddddddd");
//     await Order.findByIdAndUpdate(
//       { _id: new ObjectId(orderId) },
//       { $set: { orderStatus: "Placed", cancellationStatus: "Not requested" } },
//       { new: true } // This ensures that the updated document is returned
//     ).exec();

//     console.log(updateOrder, "updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");

//     return updateOrder;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// const packingOrder = async (requestData) => {
//   try {
//     const orderId = requestData;
//     console.log(orderId, "orderidddddddddddddd");
//     await Order.findByIdAndUpdate(
//       { _id: new ObjectId(orderId) },
//       {
//         $set: {
//           orderStatus: "Packing order",
//           cancellationStatus: "Packing order",
//         },
//       },
//       { new: true } // This ensures that the updated document is returned
//     ).exec();

//     console.log(updateOrder, "updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");

//     return updateOrder;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// const deliveredOrder = async (requestData) => {
//   try {
//     const orderId = requestData;
//     console.log(orderId, "orderidddddddddddddd");
//     await Order.findByIdAndUpdate(
//       { _id: new ObjectId(orderId) },
//       { $set: { orderStatus: "Delivered", cancellationStatus: "Delivered" } },
//       { new: true } // This ensures that the updated document is returned
//     ).exec();

//     console.log(updateOrder, "updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");

//     return updateOrder;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };
const loadOrdersView = async (req, res) => {
  try {
    await adminHelpers.loadingOrdersViews(req, res);
  } catch (error) {
    console.log(error.message);
  }
};

const cancelledByAdmin = async (req, res) => {
  try {
    const id = req.body.orderId;
    console.log(id, "idddddddddddddd");

    const url = "/admin/ordersView?id=" + id;
    console.log(url, "urlllllllllllllllllllllllll");
    await adminHelpers.cancellingOrderByAdmin(id);

    res.redirect(url);
  } catch (error) {
    console.log(error.message);
  }
};

const rejectCancellation = async (req, res) => {
  try {
    const id = req.body.orderId;
    console.log(id, "idddddddddddddd");

    const url = "/admin/ordersView?id=" + id;
    console.log(url, "urlllllllllllllllllllllllll");
    await adminHelpers.rejectingCancelOrderByAdmin(id);

    res.redirect(url);
  } catch (error) {
    console.log(error.message);
  }
};

const packingOrder = async (req, res) => {
  try {
    const id = req.body.orderId;
    console.log(id, "idddddddddddddd");

    const url = "/admin/ordersView?id=" + id;
    console.log(url, "urlllllllllllllllllllllllll");
    await adminHelpers.packingOrderByAdmin(id);

    res.redirect(url);
  } catch (error) {
    console.log(error.message);
  }
};

const deliveredOrder = async (req, res) => {
  try {
    const id = req.body.orderId;
    console.log(id, "idddddddddddddd");

    const url = "/admin/ordersView?id=" + id;
    console.log(url, "urlllllllllllllllllllllllll");
    await adminHelpers.deliveredOrderByAdmin(id);

    res.redirect(url);
  } catch (error) {
    console.log(error.message);
  }
};
const retunedConfirmation = async (req, res) => {
  try {
    const id = req.body.orderId;
    console.log(id, "idddddddddddddd");

    const url = "/admin/ordersView?id=" + id;
    console.log(url, "urlllllllllllllllllllllllll");
    await adminHelpers.returnconfirmedbyadmin(id);

    res.redirect(url);
  } catch (error) {
    console.log(error.message);
  }
};
const getDashboard = async (req, res) => {
  let admin = req.session.adminId;
  let totalProducts,
    days = [];
  let ordersPerDay = {};
  let paymentCount = [];

  let Products = await adminHelpers.getAllProducts();
  totalProducts = Products.length;

  await orderHelpers.getOrderByDate().then((response) => {
    let result = response;
    console.log(result, "======");
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result[i].orders.length; j++) {
        let ans = {};
        ans["createdAt"] = result[i].orders[j].createdAt;
        days.push(ans);
      }
    }
    console.log(days, "}}}}}}");

    days.forEach((order) => {
      let day = order.createdAt.toLocaleDateString("en-US", {
        weekday: "long",
      });
      ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
    });
  });

  let getCodCount = await adminHelpers.getCodCount();

  let codCount = getCodCount.length;

  let getOnlineCount = await adminHelpers.getOnlineCount();
  let onlineCount = getOnlineCount.length;

  // let getWalletCount = await adminHelper.getWalletCount();
  // let WalletCount = getWalletCount.length;

  paymentCount.push(onlineCount);
  paymentCount.push(codCount);
  // paymentCount.push(WalletCount);

  let orderByCategory = await orderHelper.getOrderByCategory();

  let Plants = 0,
    Seeds = 0,
    Pots = 0,
    PlantCare = 0;
  orderByCategory.forEach((Products) => {
    console.log(Products, "------");

    if (Products.category == "Plants") Plants++;
    if (Products.category == "Seeds") Seeds++;
    if (Products.category == "Pots&Planters") Pots++;
    if (Products.category == "Plant Care") PlantCare++;
  });
  let category = [];
  category.push(Plants);
  category.push(Seeds);
  category.push(Pots);
  category.push(PlantCare);

  await orderHelper.getAllOrders().then((response) => {
    var length = response.length;

    let total = 0;

    for (let i = 0; i < length; i++) {
      total += response[i].orders.totalPrice;
    }
    console.log(
      admin,
      length,
      total,
      totalProducts,
      ordersPerDay,
      paymentCount,
      category,
      "---------"
    );

    res.render("admin/dashboard", {
      layout: "admin-layout",
      admin,
      length,
      total,
      totalProducts,
      ordersPerDay,
      paymentCount,
      category,
    });
  });
};
const returnedByAdmin = async (req, res) => {
  try {
    const id = req.body.orderId;
    console.log(id, "idddddddddddddd");

    const url = "/admin/ordersView?id=" + id;
    console.log(url, "urlllllllllllllllllllllllll");
    await adminHelpers.returningOrderByAdmin(id);

    res.redirect(url);
  } catch (error) {
    console.log(error.message);
  }
};
const loadSalesPage = async (req, res) => {
  try {
    const adminUser = await User.findOne({
      is_admin: req.session.is_admin,
    }).lean();
    console.log(adminUser, "adminuussseeerrrr");
    const orderSuccessDetails = await adminHelpers.orderSuccess();
    console.log(orderSuccessDetails.total, "order");
    const order = orderSuccessDetails.orderHistory;
    const total = orderSuccessDetails.total;
    res.render("admin/admin-sales", {
      layout: "adminlayout",
      order,
      total,
      admin: adminUser,
    });
  } catch (error) {
    console.log(error.message);
    //res.redirect("/admin/admin-error");
  }
};

const getSalesToday = async (req, res) => {
  try {
    const todaySales = await adminHelpers.salesToday();
    const adminUser = await User.findOne({
      is_admin: req.session.is_admin,
    }).lean();
    // console.log(todaySales,'todaySales');
    res.render("admin/admin-sales", {
      layout: "adminlayout",
      order: todaySales.orderHistory,
      total: todaySales.total,
      admin: adminUser,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/admin-error");
  }
};

const getWeekSales = async (req, res) => {
  try {
    const weeklySales = await adminHelpers.weeklySales();
    const adminUser = await User.findOne({
      is_admin: req.session.is_admin,
    }).lean();

    res.render("admin/admin-sales", {
      layout: "adminlayout",
      order: weeklySales.orderHistory,
      total: weeklySales.total,
      admin: adminUser,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/admin-error");
  }
};

const getMonthSales = async (req, res) => {
  try {
    const montlySales = await adminHelpers.monthlySales();
    const adminUser = await User.findOne({
      is_admin: req.session.is_admin,
    }).lean();
    res.render("admin/admin-sales", {
      layout: "adminlayout",
      order: montlySales.orderHistory,
      total: montlySales.total,
      admin: adminUser,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/admin-error");
  }
};

const getYearlySales = async (req, res) => {
  try {
    const yearlySales = await adminHelpers.yearlySales();
    const adminUser = await User.findOne({
      is_admin: req.session.is_admin,
    }).lean();
    res.render("admin/admin-sales", {
      layout: "adminlayout",
      order: yearlySales.orderHistory,
      total: yearlySales.total,
      admin: adminUser,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/admin-error");
  }
};

const salesWithDate = async (req, res) => {
  try {
    const salesWithDate = await adminHelpers.salesWithDate(req, res);
    const adminUser = await User.findOne({
      is_admin: req.session.is_admin,
    }).lean();
    res.render("admin/admin-sales", {
      layout: "adminlayout",
      order: salesWithDate.orderHistory,
      total: salesWithDate.total,
      admin: adminUser,
    });
  } catch (error) {
    console.log(error.message, "salesWithDate controller error");
    res.redirect("/admin/admin-error");
  }
};

const downloadSalesReport = async (req, res) => {
  try {
    const salesPdf = await adminHelpers.salesPdf(req, res);
  } catch (error) {
    console.log(error.message, "pdfSales controller error");
    res.redirect("/admin/admin-error");
  }
};
// let generatePdf = async (order, totalAmount, res) => {
//   const startY = 150;
//   const writeStream = fs.createWriteStream("order.pdf");
//   const printer = new pdfPrinter({
//     Roboto: {
//       normal: "Helvetica",
//       bold: "Helvetica-Bold",
//       italics: "Helvetica-Oblique",
//       bolditalics: "Helvetica-BoldOblique",
//     },
//   });

//   let dateOptions = { year: "numeric", month: "long", day: "numeric" };
//   // Create document definition for PDF
//   let docDefinition = {
//     content: [
//       { text: "Plant Story", style: "header" },
//       { text: "\n" },
//       { text: "Order Information", style: "header1" },
//       { text: "\n" },
//       { text: "\n" },
//     ],
//     styles: {
//       header: {
//         fontSize: 25,
//         alignment: "center",
//       },
//       header1: {
//         fontSize: 12,
//         alignment: "center",
//       },
//       total: {
//         fontSize: 18,
//         alignment: "center",
//       },
//     },
//   };

//   // Create the table data for PDF
//   let tableBody = [
//     ["Index", "Date", "User", "Status", "Method", "Amount"], // Table header
//   ];

//   for (let i = 0; i < order.length; i++) {
//     const data = order[i];
//     const formattedDate = new Intl.DateTimeFormat("en-US", dateOptions).format(
//       new Date(data.date)
//     );
//     tableBody.push([
//       (i + 1).toString(), // Index value
//       formattedDate,
//       data.userId.name,
//       data.orderStatus,
//       data.paymentMethod,
//       data.orderValue,
//     ]);
//   }

//   let table = {
//     table: {
//       widths: ["auto", "auto", "auto", "auto", "auto", "auto"],
//       headerRows: 1,
//       body: tableBody,
//     },
//   };

//   // Add the table to the document definition for PDF
//   docDefinition.content.push(table);
//   docDefinition.content.push([
//     { text: "\n" },
//     {
//       text: `Total: ${totalAmount[0]?.totalAmount || 0}`,
//       style: "total",
//     },
//   ]);

//   // Generate PDF from the document definition
//   let pdfDoc = printer.createPdfKitDocument(docDefinition);

//   // Pipe the PDF document to a write stream
//   pdfDoc.pipe(writeStream);

//   // Finalize the PDF and end the stream
//   pdfDoc.end();

//   writeStream.on("finish", () => {
//     res.download("order.pdf", "order.pdf");
//   });
// };

// let generateExcel = async (order, totalAmount, res) => {
//   const workbook = new exceljs.Workbook();
//   const worksheet = workbook.addWorksheet("Sales Report");

//   // Add column headers to the worksheet
//   worksheet.addRow(["Index", "Date", "User", "Status", "Method", "Amount"]);

//   for (let i = 0; i < order.length; i++) {
//     const data = order[i];
//     const formattedDate = new Intl.DateTimeFormat("en-US", dateOptions).format(
//       new Date(data.date)
//     );

//     // Add row data to the worksheet
//     worksheet.addRow([
//       (i + 1).toString(), // Index value
//       formattedDate,
//       data.userId.name,
//       data.orderStatus,
//       data.paymentMethod,
//       data.orderValue,
//     ]);
//   }

//   // Add the total amount to the worksheet
//   worksheet.addRow([
//     "",
//     "",
//     "",
//     "",
//     "Total:",
//     totalAmount[0]?.totalAmount || 0,
//   ]);

//   // Set the column widths to auto-fit the content
//   worksheet.columns.forEach((column) => {
//     column.width = column.header.length < 12 ? 12 : column.header.length;
//   });

//   const buffer = await workbook.xlsx.writeBuffer();
//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=sales_report.xlsx"
//   );
//   res.send(buffer);
// };

// const downloadSalesReport = (req, res) => {
//   try {
//     Promise.all([
//       Order.find({ orderStatus: { $in: ["Placed", "Delivered"] } }).populate(
//         "userId"
//       ),
//       Order.aggregate([
//         {
//           $match: {
//             orderStatus: { $nin: ["cancelled"] },
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalAmount: { $sum: "$orderValue" },
//           },
//         },
//       ]),
//     ])
//       .then(([order, totalAmount]) => {
//         generatePdf(order, totalAmount, res);
//         generateExcel(order, totalAmount, res);
//       })
//       .catch((error) => {
//         console.log("Sales report generation error:", error);
//         res.status(500).send("Error generating sales report");
//       });
//   } catch (error) {
//     console.log("pdfSales helper error");
//     res.status(500).send("Error generating sales report");
//   }
// };

module.exports = {
  loadLogin,
  verifyLogin,
  logout,
  loadDashboard,
  loadUserManage,
  editUser,
  updatingUser,
  blockUser,
  blockUserlist,
  unblockUserlist,
  loadproduct,
  addproduct,
  editProductsView,
  editProducts,
  product_activate,
  product_inactivate,
  addcategory,
  getcategory,
  category_activate,
  category_inactivate,
  loadOrdersList,
  loadOrdersView,
  cancelledByAdmin,
  rejectCancellation,
  packingOrder,
  deliveredOrder,
  getDashboard,
  retunedConfirmation,
  loadSalesPage,
  getSalesToday,
  getWeekSales,
  getMonthSales,
  getYearlySales,
  salesWithDate,
  downloadSalesReport,
};
