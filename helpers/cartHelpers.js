const db = require("../models/connection");
const multer = require("multer");
const { response } = require("../app");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  addToCart: async (proId, userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let offerPrice = await db.product.findOne({ _id: proId });
        // await db.product.updateOne({_id: proId},{$set:{carted:true}})

        // console.log(offerPrice.OfferPrice,'oooo');
        let objCart = {
          productId: proId,
          quantity: 1,
          // Price:offerPrice.OfferPrice
        };

        let carts = await db.cart.findOne({ user: userId });
        // console.log(carts,'carts');

        if (carts) {
          let productExist = carts.cartItems.findIndex(
            (cartItems) => cartItems.productId == proId
          );
          
          if (productExist != -1) {

            // await db.product.updateOne({_id: proId},{$set:{carted:true}})
          
            db.cart
              .updateOne(
                { user: userId, "cartItems.productId": proId },
                { $inc: { "cartItems.$.Quantity": 1 } }
              )
              .then((response) => {
                resolve({ response, status: false });
              });
          } else {
            db.cart
              .updateOne({ user: userId }, { $push: { cartItems: objCart } })
              .then((response) => {
                resolve({ response, status: true });
              });
          }
        } else {
          let cartItems = new db.cart({
            user: userId,
            cartItems: objCart,
          });

          await cartItems.save().then(() => {
            resolve({ status: true });
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  getCount: async (userId) => {
    try {
      let count = 0;
      let cart = await db.cart.findOne({ user: userId });
      if (cart) {
        count = cart.cartItems.length;
      }
      // console.log(count,'count');
      return count;
    } catch (err) {
      console.log(err);
    }
  },
  listCart: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.cart
          .aggregate([
            {
              $match: {
                user: ObjectId(userId),
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
                as: "carted",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                carted: { $arrayElemAt: ["$carted", 0] },
              },
            },
          ])
          .then((cartItems) => {
            resolve(cartItems);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  changeQuantity: (data) => {
    try {
      // console.log(data);
      count = parseInt(data.count);
      // quantity = parseInt(data.quantity);
      return new Promise(async (resolve, reject) => {
        if (count == -1 && data.Quantity == 1) {
          await db.cart
            .updateOne(
              { user: data.user },
              { $pull: { cartItems: { productId: data.product } } }
            )
            .then((response) => {
              resolve({ removeProduct: true });
            });
        } else {
          await db.cart
            .updateOne(
              { user: data.user, "cartItems.productId": data.product },
              { $inc: { "cartItems.$.Quantity": count } }
            )
            .then(() => {
              resolve({ status: true });
            });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  removeItem: (data) => {
    // console.log(data,'===++++');
    try {
      return new Promise(async (resolve, reject) => {
        // await db.product.updateOne({_id:data.product},{$set:{carted:false}})
        await db.cart
          .updateOne(
            { user: data.user, "cartItems.productId": data.product },
            { $pull: { cartItems: { productId: data.product } } }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  getOfferTotal: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.cart
          .aggregate([
            {
              $match: {
                user: ObjectId(userId),
              },
            },
            { $unwind: "$cartItems" },
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
                as: "carted",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$carted", 0] },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: { $multiply: ["$quantity", "$product.OfferPrice"] },
                },
              },
            },
          ])
          .then((total) => {
            console.log(total,"'''''''''''''''''''");
            resolve(total[0]?.total);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  getTotal: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let total = await db.cart
          .aggregate([
            {
              $match: {
                user: ObjectId(userId),
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
                as: "carted",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$carted", 0] },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: { $multiply: ["$quantity", "$product.Price"] } },
              },
            },
          ])
          .then((total) => {
            // console.log(total[0]?.total);
            resolve(total[0]?.total);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  subTotal: (userId, proId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let subTotal = await db.cart.aggregate([
          {
            $match: {
              user: ObjectId(userId),
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
              as: "carted",
            },
          },
          {
            $match: {
              item: ObjectId(proId),
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$carted", 0] },
            },
          },
          {
            $project: {
              unitPrice: { $toInt: "$product.OfferPrice" },
              quantity: { $toInt: "$quantity" },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
            },
          },
        ]);
        //  console.log(subTotal[0].total,'subTotal');
        if (subTotal.length > 0) {
          await db.cart
            .updateOne(
              {
                user: ObjectId(userId),
                cartItems: { $elemMatch: { productId: ObjectId(proId) } },
              },
              {
                $set: {
                  "cartItems.$.Price": subTotal[0].total,
                },
              }
            )
            .then((response) => {
              // console.log(response,'responsetotsl======');
              resolve(subTotal[0]?.total);
            });
        } else {
          subTotal = 0;
          resolve(subTotal);
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  getSubTotal: (userId, proId) => {
    try {
      // console.log(userId,proId,';;;;');
      return new Promise(async (resolve, reject) => {
        await db.cart
          .findOne(
            { user: userId, "cartItems.productId": proId },
            { "cartItems.$": 1 }
          )
          .then((response) => {
            //  console.log(response,';;;;<<>>>');
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
};
