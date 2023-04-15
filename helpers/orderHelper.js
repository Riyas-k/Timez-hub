const db = require("../models/connection");
const multer = require("multer");
const { response } = require("../app");
const ObjectId = require("mongodb").ObjectId;
var crypto = require("crypto");
const Razorpay = require("razorpay");
// const razorPayDetails = require("../otp/razorpay");
const { resolve } = require("path");
const { rejects } = require("assert");

let id = process.env.Razorpay_id;
let secret_key = process.env.Razorpay_secret_key

var instance = new Razorpay({
  key_id: id,
  key_secret:secret_key,
});

module.exports = {
  placeOrder: (bodyData, offerTotal) => {
    // console.log(bodyData.address,'>>>>>=======');
    try {
      return new Promise(async (resolve, reject) => {
        let productDetails = await db.cart.aggregate([
          {
            $match: {
              user: ObjectId(bodyData.user),
            },
          },
          {
            $unwind: "$cartItems",
          },
          {
            $project: {
              item: "$cartItems.productId",
              quantity: "$cartItems.Quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "orderDetails",
            },
          },
          {
            $unwind: "$orderDetails",
          },
          {
            $project: {
              image: "$orderDetails.Image",
              productName: "$orderDetails.ProductName",
              quantity: 1,
              category: "$orderDetails.Category",
              price: "$orderDetails.OfferPrice",
              _id: "$orderDetails._id",
            },
          },
        ]);
        // bodyData.address = bodyData.address.toString()

        let Address = await db.address.aggregate([
          {
            $match: { user: ObjectId(bodyData.user) },
          },
          {
            $unwind: "$Address",
          },
          {
            $match: { "Address._id": ObjectId(bodyData.address) },
          },
          {
            $unwind: "$Address",
          },
        ]);
        console.log(bodyData["payment-method"]);
        let orderStatus =
          bodyData["payment-method"] === "COD" || "Wallet" ? "Placed" : "Pending";
          console.log(orderStatus,'status====');
        let status =
          bodyData["payment-method"] === "COD" ? "Success" : "Pending";

        let orderDetailsData = {
          paymentStatus: status,
          paymentMethod: bodyData["payment-method"],
          productDetails: productDetails,
          shippingAddress: Address,
          orderStatus: orderStatus,
          total: offerTotal,
        };

        let order = await db.order.findOne({ user: bodyData.user });
        if (order) {
          await db.order
            .updateOne(
              { user: bodyData.user },
              {
                $push: { orders: orderDetailsData },
              }
            )
            .then(async(orders) => {
              await db.cart.deleteMany({ user: bodyData.user })
              resolve(orders);
            });
        } else {
          let newOrder = db.order({
            user: bodyData.user,
            orders: orderDetailsData,
          });
          await newOrder.save().then(async(orders) => {
            await db.cart.deleteMany({ user: bodyData.user })
            resolve(orders);
            // console.log(details,'===============================///');
          });
        }
      
        for (let i = 0; i < productDetails.length; i++) {
          const productId = productDetails[i]._id;
          const productQuantity = productDetails[i].quantity;

          // Update the quantity of the current product
          await db.product.updateOne(
            { _id: productId },
            { $inc: { Quantity: -productQuantity } }
          );
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  getOrders: (userId) => {
    console.log(userId,'kkkk');
    try {
      return new Promise(async (resolve, reject) => {
        let orders = await db.order
          .aggregate([
            {
              $match: {
                user: ObjectId(userId),
              },
            },
            {
              $unwind: "$orders",
            },
            {
              $sort: {
                "orders.createdAt": -1,
              },
            },
          ])
          .then((orders) => {
            resolve(orders);
            console.log(orders,'=======');
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  cancelOrder: (proId, userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        const order = await db.order.findOneAndUpdate(
          { "orders._id": ObjectId(proId) },
          { $set: { "orders.$.orderStatus": "Cancelled" } }
        );

        let productDetails = await db.order.aggregate([
          {
            $match: { user: userId },
          },
          {
            $unwind: "$orders",
          },
          {
            $project: {
              productDetails: "$orders.productDetails",
            },
          },
          {
            $unwind: "$productDetails",
          },
          {
            $project: {
              _id: "$productDetails._id",
              quantity: "$productDetails.quantity",
            },
          },
        ]);
        // console.log(productDetails,'==========>>>');

        for (let i = 0; i < productDetails.length; i++) {
          let productId = productDetails[i]._id;
          let productQuantity = productDetails[i].quantity;
          console.log(productId, productQuantity);
          await db.product.updateOne(
            { _id: ObjectId(productId) },
            { $inc: { Quantity: productQuantity } }
          );
        }

        resolve(order);
      });
    } catch (error) {
      console.log(error);
    }
  },

  viewOrders: () => {
    try {
      return new Promise(async (resolve, reject) => {
        let orders = await db.order
          .aggregate([
            {
              $unwind: "$orders",
            },
            {
              $sort: {
                "orders.createdAt": -1,
              },
            },
          ])
          .then((orders) => {
            resolve(orders);
          });
        // console.log(orders,'======');
      });
    } catch (error) {
      console.log(error);
    }
  },
  postAddress: (bodyData, userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let AddressInfo = {
          fname: bodyData.fname,
          lname: bodyData.lname,
          street: bodyData.street,
          apartment: bodyData.apartment,
          city: bodyData.city,
          state: bodyData.state,
          pincode: bodyData.pincode,
          mobile: bodyData.mobile,
          email: bodyData.email,
        };
        let address = await db.address.findOne({ user: userId });
        if (address) {
          await db.address
            .updateOne({ user: userId }, { $push: { Address: AddressInfo } })
            .then((address) => {
              resolve(address);
            });
        } else {
          let newAddress = new db.address({
            user: userId,
            Address: AddressInfo,
          });
          await newAddress.save().then((address) => {
            // console.log(address,'>>>>');
            resolve(address);
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  getAddress: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.address
          .findOne({ user: userId })
          .then((address) => {
           console.log(address,'adress===');
              resolve(address)
            
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  deleteOrder: (orderId) => {
    try {
      // console.log(orderId, "====");
      return new Promise(async (resolve, reject) => {
        await db.order
          .updateOne(
            { "orders._id": orderId },
            { $pull: { orders: { _id: orderId } } }
          )
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  deleteAddress: (addId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.address
          .updateOne(
            { "Address._id": addId },
            { $pull: { Address: { _id: addId } } }
          )
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  orderDetails: (orderId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let productId = await db.order.findOne(
          { "orders._id": orderId },
          { "orders.$": 1 }
        );
        let details = productId?.orders[0];
        let order = productId?.orders[0]?.productDetails;
        let address1 = await db.order.aggregate([
          {
            $unwind: "$orders",
          },
          {
            $match: { "orders._id": ObjectId(orderId) },
          },
          {
            $unwind: "$orders.shippingAddress",
          },
          {
            $project: {
              _id: 0,
              shippingAddress: "$orders.shippingAddress",
              Address: "$orders.shippingAddress.Address",
            },
          },
        ]);

        let productDetails = productId?.orders.map(
          (object) => object.productDetails
        );
        let products = productId?.orders.map((object) => object);
        resolve({ productDetails, address1, products, details });
      });
    } catch (error) {
      console.log(error);
    }
  },
  getWallet:(userId)=>{
    try {
      return new Promise(async(resolve,reject)=>{
         let response =  await db.order.aggregate([
            {
              $match:{
                user:ObjectId(userId)
              }
            },
            {
              $unwind:'$orders'
            },
            {
              $match:{
                'orders.orderStatus':'Return Confirmed'
              }
            },
            {
              $project:{
                'orders.total':1
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$orders.total' }
              }
            }
          ])
          console.log(response[0]?.total,'total');
          let data = response[0]?.total
   
            await db.users.updateOne({_id:ObjectId(userId)},{$set:{Wallet:data}})
          resolve(data)
          
        })
    } catch (error) {
      console.log(error);
    }
  },
  changeOrderStatus: (status, orderId) => {
    try {
      return new Promise(async (resolve, reject) => {
        // console.log(orderId);
        let result = await db.order.findOneAndUpdate(
          { "orders._id": ObjectId(orderId) },
          { $set: { "orders.$.orderStatus": status } }
        );
        resolve(result);
      });
    } catch (error) {
      console.log(error);
    }
  },
  
  generateRazorPay: (userId, offerTotal) => {
    try {
      return new Promise(async (resolve, reject) => {
        let orders = await db.order.find({ user: userId });
        let orderId = orders[0].orders.slice().reverse()[0]._id;

        instance.orders
          .create({
            amount: offerTotal * 10,
            currency: "INR",
            receipt: "" + orderId,
            notes: {
              key1: "value3",
              key2: "value2",
            },
          })
          .then((orders) => {
            // console.log(orders, "<<>>>");
            resolve(orders);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  verifyPaymentRazorPay: (details) => {
    try {
      return new Promise((resolve, reject) => {
        let hmac = crypto.createHmac("sha256", razorPayDetails.secret_key);
        hmac.update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"],
          razorPayDetails.secret_key
        );
        hmac = hmac.digest("hex");
        // console.log(hmac,'hmac');
        if (hmac == details["payment[razorpay_signature]"]) {
          resolve();
        } else {
          reject();
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  changeOnlineStatus: (orderId) => {
    console.log(orderId, "id");
    try {
      return new Promise(async (resolve, reject) => {
        let result = await db.order.findOne(
          { "orders._id": orderId },
          { "orders.$": 1 }
        );
        // console.log(result,'????');
        let orderIds = result.orders.map((order) => order._id);
        // console.log(orderIds,'Id=====');
        await db.order
          .updateOne(
            { "orders._id": orderIds },
            { $set: { "orders.$.orderStatus": "Placed" } }
          )
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  returnOrder: async (proId, userId) => {
    try {
      const order = await db.order.updateOne(
        { "orders._id": ObjectId(proId) },
        { $set: { "orders.$.orderStatus": "Return Pending" } }
      );
      // console.log(order);
      let productDetails = await db.order.aggregate([
        {
          $match: { user: userId },
        },
        {
          $unwind: "$orders",
        },
        {
          $project: {
            productDetails: "$orders.productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
        {
          $project: {
            _id: "$productDetails._id",
            quantity: "$productDetails.quantity",
          },
        },
      ]);
      for (let i = 0; i < productDetails.length; i++) {
        let productId = productDetails[i]._id;
        let productQuantity = productDetails[i].quantity;
        console.log(productId, productQuantity);
        await db.product.updateOne(
          { _id: ObjectId(productId) },
          { $inc: { Quantity: productQuantity } }
        );
      }
      return Promise.resolve(order);
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  },
  
  findTotal: () => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.order
          .aggregate([
            {
              $unwind: "$orders",
            },
            {
              $match: {
                "orders.orderStatus": {
                  $in: ["Delivered"],
                },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$orders.total",
                },
              },
            },
          ])
          .then((response) => {
            
            resolve(response[0]?.total);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  salesDetails: () => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.order
          .aggregate([
            {
              $unwind: "$orders",
            },

            {
              $match: {
                "orders.orderStatus": "Delivered",
              },
            },
          ])
          .then((response) => {
            console.log(response,'sales===-');
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  getDate: () => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.order
          .aggregate([
            {
              $unwind: "$orders",
            },
            {
              $match: {
                "orders.orderStatus": "Delivered",
              },
            },
            {
              $project: {
                _id: 0,
                createdAt: "$orders.createdAt",
              },
            },
          ])
          .then((response) => {
            //  console.log(response[0].orders.createdAt,',,,');
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  createData: (details) => {
    try {
      // console.log(details,'ll');
      let address = details.address1[0];
      let product = details.productDetails[0][0];
      // console.log("=== ", product.quantity, "===");
      let orderDetails = details.details.createdAt;
      let myDate = orderDetails;
      // console.log(";;", myDate, "kkk");

      let data = {
        customize: {},
        images: {
          logo: "https://images.cooltext.com/5651103.png",
          'background':'https://myhappydeals.ae/wp-content/uploads/2019/03/Sansdo-New-men-and-women-leather-watch-steel-ring-retro-digital-pointer-dial-solid-color-high-quality-fashion-student-watch.jpg'
        },
        sender: {
          company: "Times Hub",
          address: "Bournivilla tower",
          zip: "4567 CD",
          city: "Los santos",
          country: "America",
        },
        client: {
          company: address.Address.fname,
          address: address.Address.street,
          zip: address.Address.pincode,
          city: address.Address.city,
          country: "India",
        },
        information: {
          number: address.Address.mobile,
          date: myDate,
          "due-date": myDate,
        },
        products: [
          {
            quantity: product.quantity,
            description: product.productName,
            "tax-rate": 0,
            price: product.price,
          },
        ],
        "bottom-notice": "Thank you for your order from Times Hub",
        settings: {
          currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
        },
      };
      return data;
    } catch (error) {
      console.log(error);
    }
  },
  updateWallet:(userId,offerTotal)=>{
    try {
        return new Promise(async (resolve, reject) => {
        const response = await db.users.updateOne(
          { _id: userId },
          { $inc: { Wallet: -offerTotal } },
          { new: true }
        );
        console.log(response, "resp");
        resolve(response);
    
      });
    } catch (error) {
      reject(error);
      }
    
  },
  cancelWalletIncrease:(userId,offerTotal)=>{
   return new Promise(async(resolve,reject)=>{
    try {
      const response = await db.users.updateOne(
        { _id: userId },
        { $inc: { Wallet: offerTotal } },
        { new: true }
      )
      console.log(response,'llllllfjgsdfkhku');
      resolve()
    } catch (error) {
      console.log(error);
    }
   })
 
},
getOrderTotal:(orderId)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      await db.order.findOne({'orders._id':ObjectId(orderId)},{'orders.$':1}).then((response)=>{
        // console.log(response.orders[0].total,'kkk');
        resolve(response?.orders[0].total)
      })
      
    } catch (error) {
      console.log(error);
    }
  })
},
postSales:(bodyData)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      let result = await db.order.aggregate([
        {
          $unwind:'$orders'
        },
        {
          $match:{
            'orders.orderStatus':{
              $in:['Delivered']
            },
            'orders.createdAt':{
              $gte:new Date(bodyData.startdate),
              $lte:new Date(bodyData.enddate)
            }

          }
        }
      ])
      resolve(result)
      console.log(result,'llllllll');
      
    } catch (error) {
      console.log(error);
    }
  })
}
}
