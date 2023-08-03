const moment = require("moment-timezone");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");
const { ObjectId } = require("mongodb");
const { cancellOrder } = require("../../controllers/userController");
const fs = require("fs");
//const moment = require("moment-timezone");
const pdfPrinter = require("pdfmake");

module.exports = {
  loadingDashboard: async (req, res) => {
    return new Promise(async (resolve, reject) => {
      try {
        const users = await User.find({}).lean().exec();
        const totaluser = users.length;

        const totalSales = await Order.aggregate([
          {
            $match: {
              orderStatus: { $nin: ["cancelled", "return"] },
            },
          },
          {
            $group: {
              _id: null,
              totalSum: { $sum: "$orderValue" },
            },
          },
        ]);

        const salesbymonth = await Order.aggregate([
          {
            $match: {
              orderStatus: { $nin: ["cancelled", "return"] },
            },
          },
          {
            $group: {
              _id: { $month: "$date" },
              totalSales: { $sum: "$orderValue" },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]);
        const paymentMethod = await Order.aggregate([
          {
            $match: {
              orderStatus: {
                $in: ["Pending", "Delivered", "Placed", "Dispatched"],
              },
            },
          },
          {
            $group: {
              _id: "$paymentMethod",
              totalOrderValue: { $sum: "$orderValue" },
              count: { $sum: 1 },
            },
          },
        ]);
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const yearSales = await Order.aggregate([
          {
            $match: {
              orderStatus: { $nin: ["cancelled", "Return confirmed"] },
              date: {
                $gte: new Date(`${previousYear}-01-01`),
                $lt: new Date(`${currentYear + 1}-01-01`),
              },
            },
          },
          {
            $group: {
              _id: {
                $year: "$date",
              },
              totalSales: { $sum: "$orderValue" },
            },
          },
        ]).exec();

        //getting today sales
        const todaysalesDate = new Date();
        const startOfDay = new Date(
          todaysalesDate.getFullYear(),
          todaysalesDate.getMonth(),
          todaysalesDate.getDate(),
          0,
          0,
          0,
          0
        );
        const endOfDay = new Date(
          todaysalesDate.getFullYear(),
          todaysalesDate.getMonth(),
          todaysalesDate.getDate(),
          23,
          59,
          59,
          999
        );

        const todaySales = await Order.aggregate([
          {
            $match: {
              orderStatus: {
                $in: ["Pending", "Delivered", "Placed", "Dispatched"],
              },
              date: {
                $gte: startOfDay,
                $lt: endOfDay,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$orderValue" },
            },
          },
        ]);
        const dashBoardDetails = {
          totaluser,
          totalSales,
          salesbymonth,
          paymentMethod,
          yearSales,
          todaySales,
        };
        resolve(dashBoardDetails);
      } catch (error) {
        reject(error);
      }
    });
  },
  loadingOrdersViews: async (req, res) => {
    try {
      const orderId = req.query.id;

      console.log(orderId, "orderId");
      const order = await Order.findOne({ _id: orderId }).populate({
        path: "products.productId",
        select: "name price image",
      });

      const createdOnIST = moment(order.date)
        .tz("Asia/Kolkata")
        .format("DD-MM-YYYY h:mm A");
      order.date = createdOnIST;

      const orderDetails = order.products.map((product) => {
        const images = product.productId.image || []; // Set images to an empty array if it is undefined
        const image = images.length > 0 ? images[0] : ""; // Take the first image from the array if it exists

        return {
          productname: product.productId.productname,
          image: image,
          price: product.productId.price,
          total: product.total,
          quantity: product.quantity,
          status: order.orderStatus,
        };
      });

      const deliveryAddress = {
        name: order.addressDetails.name,
        homeAddress: order.addressDetails.homeAddress,
        city: order.addressDetails.city,
        street: order.addressDetails.street,
        postalCode: order.addressDetails.postalCode,
      };

      const total = order.orderValue + order.couponDiscount;
      const discountAmount = order.couponDiscount;
      const subtotal = order.orderValue;
      const cancellationStatus = order.cancellationStatus;
      console.log(cancellationStatus, "cancellationStatus");

      console.log(subtotal, "subtotal");

      console.log(orderDetails, "orderDetails");
      console.log(deliveryAddress, "deliveryAddress");

      res.render("admin/ordersView", {
        layout: "adminlayout",
        orderDetails: orderDetails,
        deliveryAddress: deliveryAddress,
        subtotal: subtotal,
        total: total,
        discountAmount: discountAmount,
        orderId: orderId,
        orderDate: createdOnIST,
        cancellationStatus: cancellationStatus,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  OrdersList: async (req, res) => {
    try {
      const { paymentMethod, orderStatus } = req.query;
      console.log(req.query, "req.query");
      let query = {};

      // Apply filters if provided
      if (paymentMethod) {
        query.paymentMethod = paymentMethod;
      }
      if (orderStatus) {
        query.orderStatus = orderStatus;
      }

      let orderDetails = await Order.find(query).populate("userId").lean();

      // Reverse the order of transactions
      orderDetails = orderDetails.reverse();

      const orderHistory = orderDetails.map((history) => {
        let createdOnIST = moment(history.date)
          .tz("Asia/Kolkata")
          .format("DD-MM-YYYY h:mm A");

        return {
          ...history,
          date: createdOnIST,
          userName: history.userId.name,
        };
      });

      return orderHistory;
    } catch (error) {
      console.log(error.message);
      res.redirect("/admin/admin-error");
    }
  },

  cancellingOrderByAdmin: async (requestData) => {
    try {
      const orderId = requestData;
      console.log(orderId, "orderidddddddddddddd");
      const id = new ObjectId(orderId);
      console.log(id);

      const canceledOrder = await Order.findById(orderId).exec();
      console.log(canceledOrder, "canceledOrder");

      if (!canceledOrder) {
        console.log("Order not found");
        // Handle error or return appropriate response
        return;
      }

      // Increase the stock count for each product in the canceled order
      for (const orderedProduct of canceledOrder.products) {
        const productId = orderedProduct.productId;
        const quantity = orderedProduct.quantity;

        // Update the product stock count in the database
        await Product.findOneAndUpdate(
          { _id: productId },
          { $inc: { stock: quantity } }
        );
      }

      const updateOrder = await Order.findByIdAndUpdate(
        { _id: new ObjectId(orderId) },
        { $set: { orderStatus: "cancelled", cancellationStatus: "cancelled" } },
        { new: true } // This ensures that the updated document is returned
      ).exec();

      console.log(updateOrder, "updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");

      // Check if the payment method is online and the order value is greater than 0
      if (
        (updateOrder.paymentMethod === "ONLINE" ||
          updateOrder.paymentMethod === "WALLET") &&
        updateOrder.orderValue > 0
      ) {
        // Check if a wallet exists for the user
        const wallet = await Wallet.findOne({
          userId: updateOrder.userId,
        }).exec();

        if (wallet) {
          // Wallet exists, increment the wallet amount
          const updatedWallet = await Wallet.findOneAndUpdate(
            { userId: updateOrder.userId },
            { $inc: { walletAmount: updateOrder.orderValue } },
            { new: true }
          ).exec();

          console.log(updatedWallet, "updated wallet with order value");
        } else {
          // Wallet doesn't exist, create a new wallet with the order value as the initial amount
          const newWallet = new Wallet({
            userId: updateOrder.userId,
            walletAmount: updateOrder.orderValue,
          });

          const createdWallet = await newWallet.save();
          console.log(createdWallet, "created new wallet with order value");
        }
      }

      return updateOrder;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  rejectingCancelOrderByAdmin: async (requestData) => {
    try {
      const orderId = requestData;
      console.log(orderId, "orderidddddddddddddd");
      const updateOrder = await Order.findByIdAndUpdate(
        { _id: new ObjectId(orderId) },
        {
          $set: { orderStatus: "Placed", cancellationStatus: "Not requested" },
        },
        { new: true } // This ensures that the updated document is returned
      ).exec();

      console.log(updateOrder, "updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");

      return updateOrder;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  packingOrderByAdmin: async (requestData) => {
    try {
      const orderId = requestData;
      console.log(orderId, "orderidddddddddddddd");
      const updateOrder = await Order.findByIdAndUpdate(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            orderStatus: "Dispatched",
            cancellationStatus: "Dispatched",
          },
        },
        { new: true } // This ensures that the updated document is returned
      ).exec();

      console.log(updateOrder, "updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");

      return updateOrder;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deliveredOrderByAdmin: async (requestData) => {
    try {
      const orderId = requestData;
      console.log(orderId, "orderidddddddddddddd");
      const updateOrder = await Order.findByIdAndUpdate(
        { _id: new ObjectId(orderId) },
        { $set: { orderStatus: "Delivered", cancellationStatus: "Delivered" } },
        { new: true } // This ensures that the updated document is returned
      ).exec();

      console.log(updateOrder, "updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");

      return updateOrder;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  returnconfirmedbyadmin: async (requestData) => {
    try {
      const orderId = requestData;
      console.log(orderId, "orderidddddddddddddd");
      const updateOrder = await Order.findByIdAndUpdate(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            orderStatus: "Return confirmed",
            cancellationStatus: "Return confirmed",
          },
        },
        { new: true } // This ensures that the updated document is returned
      ).exec();

      console.log(updateOrder, "updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");

      return updateOrder;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      await Product.find().then((response) => {
        resolve(response);
      });
    });
  },

  getCodCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentMethod": "COD",
          },
        },
      ]);
      resolve(response);
    });
  },

  getOnlineCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentMethod": "razorpay",
          },
        },
      ]);
      resolve(response);
    });
  },
  getOrderByDate: () => {
    return new Promise(async (resolve, reject) => {
      const startDate = new Date();
      await Order.find().then((response) => {
        resolve(response);
      });
    });
  },

  getOrderByCategory: () => {
    return new Promise(async (resolve, reject) => {
      await Order.aggregate([{ $unwind: "$orders" }]).then((response) => {
        const productDetails = response.map((order) => {
          return order.orders.productDetails;
        });

        resolve(productDetails);
      });
    });
  },
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      await cartModel.Order.aggregate([
        { $unwind: "$orders" },
        { $sort: { "orders.createdAt": -1 } },
      ]).then((response) => {
        resolve(response);
      });
    });
  },

  orderSuccess: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const order = await Order.find({
          orderStatus: { $in: ["Placed", "Delivered", "Dispatched"] },
        })
          .populate("userId")
          .sort({ date: -1 })
          .lean()
          .exec();

        const orderHistory = order.map((history) => {
          let createdOnIST = moment(history.date)
            .tz("Asia/Kolkata")
            .format("DD-MM-YYYY h:mm A");

          return {
            ...history,
            date: createdOnIST,
            userName: history.userId.name,
          };
        });

        const total = await Order.aggregate([
          {
            $match: {
              orderStatus: { $in: ["Placed", "Delivered", "Dispatched"] },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$orderValue" },
            },
          },
          {
            $sort: {
              totalAmount: 1,
            },
          },
        ]);

        console.log(total, "totallllllllllllll");

        // console.log(orderHistory, "orderHistoryyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
        const orderDetails = {
          orderHistory,
          total,
        };

        resolve(orderDetails);
      } catch (error) {
        reject(error);
      }
    });
  },

  salesToday: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const todaysales = new Date();
        const startOfDay = new Date(
          todaysales.getFullYear(),
          todaysales.getMonth(),
          todaysales.getDate(),
          0,
          0,
          0,
          0
        );
        const endOfDay = new Date(
          todaysales.getFullYear(),
          todaysales.getMonth(),
          todaysales.getDate(),
          23,
          59,
          59,
          999
        );
        const order = await Order.find({
          orderStatus: { $nin: ["cancelled"] },
          date: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        })
          .populate("userId")
          .sort({ date: -1 });

        const orderHistory = order.map((history) => {
          const createdOnIST = moment(history.date)
            .tz("Asia/Kolkata")
            .format("DD-MM-YYYY h:mm A");
          return {
            ...history._doc,
            date: createdOnIST,
            userName: history.userId.name,
          };
        });

        const total = await Order.aggregate([
          {
            $match: {
              orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] },

              date: {
                $gte: startOfDay, // Set the current date's start time
                $lt: endOfDay,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$orderValue" },
            },
          },
        ]);

        console.log(total, "total from helper");
        console.log(orderHistory, "order form helper");

        const salesToday = {
          orderHistory,
          total,
        };

        if (order) {
          resolve(salesToday);
        } else {
          resolve("No sales registerd today");
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  weeklySales: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const currentDate = new Date();

        // Calculate the start and end dates of the current week
        const startOfWeek = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - currentDate.getDay()
        );
        const endOfWeek = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + (6 - currentDate.getDay()),
          23,
          59,
          59,
          999
        );

        const order = await Order.find({
          orderStatus: { $nin: ["cancelled"] },
          date: {
            $gte: startOfWeek,
            $lt: endOfWeek,
          },
        })
          .populate("userId")
          .sort({ date: -1 });

        const orderHistory = order.map((history) => {
          const createdOnIST = moment(history.date)
            .tz("Asia/Kolkata")
            .format("DD-MM-YYYY h:mm A");
          return {
            ...history._doc,
            date: createdOnIST,
            userName: history.userId.name,
          };
        });

        const total = await Order.aggregate([
          {
            $match: {
              orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] },
              date: {
                $gte: startOfWeek,
                $lt: endOfWeek,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$orderValue" },
            },
          },
        ]);

        const weeklySales = {
          orderHistory,
          total,
        };
        resolve(weeklySales);
      } catch (error) {
        reject(error);
      }
    });
  },

  monthlySales: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const thisMonth = new Date().getMonth() + 1;
        const startofMonth = new Date(
          new Date().getFullYear(),
          thisMonth - 1,
          1,
          0,
          0,
          0,
          0
        );
        const endofMonth = new Date(
          new Date().getFullYear(),
          thisMonth,
          0,
          23,
          59,
          59,
          999
        );

        const order = await Order.find({
          orderStatus: { $nin: ["cancelled"] },
          date: {
            $lt: endofMonth,
            $gte: startofMonth,
          },
        })
          .populate("userId")
          .sort({ date: -1 });

        const orderHistory = order.map((history) => {
          const createdOnIST = moment(history.date)
            .tz("Asia/Kolkata")
            .format("DD-MM-YYYY h:mm A");
          return {
            ...history._doc,
            date: createdOnIST,
            userName: history.userId.name,
          };
        });

        const total = await Order.aggregate([
          {
            $match: {
              orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] },
              date: {
                $lt: endofMonth,
                $gte: startofMonth,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$orderValue" },
            },
          },
        ]);

        const monthlySales = {
          orderHistory,
          total,
        };

        resolve(monthlySales);
      } catch (error) {
        reject(error);
      }
    });
  },

  yearlySales: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const today = new Date().getFullYear();
        const startofYear = new Date(today, 0, 1, 0, 0, 0, 0);
        const endofYear = new Date(today, 11, 31, 23, 59, 59, 999);

        const order = await Order.find({
          orderStatus: { $nin: ["cancelled"] },
          date: {
            $lt: endofYear,
            $gte: startofYear,
          },
        })
          .populate("userId")
          .sort({ date: -1 });

        const orderHistory = order.map((history) => {
          const createdOnIST = moment(history.date)
            .tz("Asia/Kolkata")
            .format("DD-MM-YYYY h:mm A");
          return {
            ...history._doc,
            date: createdOnIST,
            userName: history.userId.name,
          };
        });

        const total = await Order.aggregate([
          {
            $match: {
              orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] },
              date: {
                $lt: endofYear,
                $gte: startofYear,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$orderValue" },
            },
          },
        ]);

        const yearlySales = {
          orderHistory,
          total,
        };

        resolve(yearlySales);
      } catch (error) {
        reject(error);
      }
    });
  },

  salesWithDate: (req, res) => {
    return new Promise(async (resolve, reject) => {
      try {
        const date = new Date();
        const fromDate = new Date(req.body.fromDate);
        const toDate = new Date(req.body.toDate);
        fromDate.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
        toDate.setHours(23, 59, 59, 999);

        const order = await Order.find({
          orderStatus: { $nin: ["cancelled"] },
          date: {
            $lt: toDate,
            $gte: fromDate,
          },
        })
          .populate("userId")
          .sort({ date: -1 });

        const orderHistory = order.map((history) => {
          const createdOnIST = moment(history.date)
            .tz("Asia/Kolkata")
            .format("DD-MM-YYYY h:mm A");
          return {
            ...history._doc,
            date: createdOnIST,
            userName: history.userId.name,
          };
        });

        const total = await Order.aggregate([
          {
            $match: {
              orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] },
              date: {
                $lt: toDate,
                $gte: fromDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$orderValue" },
            },
          },
        ]);

        const salesWithDate = {
          orderHistory,
          total,
        };

        resolve(salesWithDate);
      } catch (error) {
        console.log("salesWithDate helper error");
        reject(error);
      }
    });
  },

  salesPdf: (req, res) => {
    return new Promise(async (resolve, reject) => {
      try {
        let startY = 150;
        const writeStream = fs.createWriteStream("order.pdf");
        const printer = new pdfPrinter({
          Roboto: {
            normal: "Helvetica",
            bold: "Helvetica-Bold",
            italics: "Helvetica-Oblique",
            bolditalics: "Helvetica-BoldOblique",
          },
        });

        const order = await Order.find({
          orderStatus: { $in: ["Placed", "Delivered"] },
        })
          .populate("userId")
          .exec();

        const totalAmount = await Order.aggregate([
          {
            $match: {
              orderStatus: { $nin: ["cancelled"] },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$orderValue" },
            },
          },
        ]);

        const dateOptions = { year: "numeric", month: "long", day: "numeric" };
        // Create document definition
        const docDefinition = {
          content: [
            { text: "Plant Story", style: "header" },
            { text: "\n" },
            { text: "Order Information", style: "header1" },
            { text: "\n" },
            { text: "\n" },
          ],
          styles: {
            header: {
              fontSize: 25,
              alignment: "center",
            },
            header1: {
              fontSize: 12,
              alignment: "center",
            },
            total: {
              fontSize: 18,
              alignment: "center",
            },
          },
        };

        // Create the table data
        const tableBody = [
          ["Index", "Date", "User", "Status", "Method", "Amount"], // Table header
        ];

        for (let i = 0; i < order.length; i++) {
          const data = order[i];
          const formattedDate = new Intl.DateTimeFormat(
            "en-US",
            dateOptions
          ).format(new Date(data.date));
          tableBody.push([
            (i + 1).toString(), // Index value
            formattedDate,
            data.userId.name,
            data.orderStatus,
            data.paymentMethod,
            data.orderValue,
          ]);
        }

        const table = {
          table: {
            widths: ["auto", "auto", "auto", "auto", "auto", "auto"],
            headerRows: 1,
            body: tableBody,
          },
        };

        // Add the table to the document definition
        docDefinition.content.push(table);
        docDefinition.content.push([
          { text: "\n" },
          {
            text: `Total: ${totalAmount[0]?.totalAmount || 0}`,
            style: "total",
          },
        ]);
        // Generate PDF from the document definition
        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        // Pipe the PDF document to a write stream
        pdfDoc.pipe(writeStream);

        // Finalize the PDF and end the stream
        pdfDoc.end();

        writeStream.on("finish", () => {
          res.download("order.pdf", "order.pdf");
        });
      } catch (error) {
        console.log("pdfSales helper error");
        reject(error);
      }
    });
  },
};
