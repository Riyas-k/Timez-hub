const db = require("../models/connection");
const voucher_codes = require("voucher-code-generator");
const cartHelper = require("../helpers/cartHelpers");
const { response } = require("../app");
const objectId = require("mongodb").ObjectId;

module.exports = {
  generateCoupon: () => {
    return new Promise((resolve, reject) => {
      try {
        let couponCode = voucher_codes.generate({
          length: 5,
          count: 1,
          charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          prefix: "TIMES-HUB-",
        });
        // console.log(couponCode[0], "kkk");
        resolve({ status: true, couponCode: couponCode[0] });
      } catch (error) {
        console.log(error);
      }
    });
  },
  postCoupon: (bodyData) => {
    try {
      return new Promise(async (resolve, reject) => {
        let newData = new db.coupon({
          couponName: bodyData.coupenName,
          expiry: bodyData.validity,
          minPurchase: bodyData.minAmount,
          discountPercentage: bodyData.discountPercentage,
          maxDiscountValue: bodyData.maxDiscountValue,
          description: bodyData.description,
        });
        await newData.save().then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  viewCoupons: () => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.coupon.find().then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  deleteCoupon: (couponId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.coupon.deleteOne({ _id: couponId }).then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  addCouponIntUserDb: (couponName, userId) => {
    try {
  
        let objCart = {
          couponStatus: true,
          couponName: couponName,
        };
    
      return new Promise(async (resolve, reject) => {
        let response = await db.users.updateOne(
          { _id: objectId(userId) },
          {
            $push: {
              coupon: objCart,
            },
          }
        );
        // console.log(response, "res");
        resolve(response);
      });
    } catch (error) {
      console.log(error);
    }
  },
  validateCoupon: (couponCode, userId, total) => {
    try {
      return new Promise(async (resolve, reject) => {
        let discountAmount, couponTotal;
        let coupon = await db.coupon.findOne({ couponName: couponCode });
        console.log(coupon,'mmm');
        if (coupon) {
          if (total >= coupon?.minPurchase) {
            discountAmount = (total * coupon.discountPercentage) / 100;
            if (discountAmount > coupon?.maxDiscountValue) {
              discountAmount = coupon?.maxDiscountValue;
            }
          }
          couponTotal = total - discountAmount;
          
        } else {
          resolve({ status: false, err: "coupon does'nt exist" });
        }
        let couponExist = await db.coupon.findOne({
          "coupon.couponName": couponCode,
        });
        // console.log(couponExist, ";;");
        if (couponExist) {
          if (new Date(couponExist.expiry) - new Date() > 0) {
            let userCouponExist = await db.users.findOne({
              _id: userId,
              "coupon.couponName": couponCode,
            });
            if (!userCouponExist) {
              // console.log("jii");
              //update cart total value
               let result =   await db.cart.aggregate([
                    {
                      $match:{
                        user:objectId(userId)
                      }
                    },
                    {
                      $unwind:"$cartItems"
                    },
                    {
                      $project:{
                        item:'$cartItems.productId',
                        quantity:'$cartItems.Quantity'
                      }
                    },
                    {
                      $lookup:{
                        from:'products',
                        localField:'item',
                        foreignField:'_id',
                        as:'carted'
                      }
                    },
                    {
                      $unwind:'$carted'
                    }
                   
                  

                  ])
                  console.log(result,'-----coupons');
              resolve({
                discountAmount,
                couponTotal,
                total,
                success: `${couponCode}` + "Coupon  Applied  SuccessFully",
              });
            } else {
              resolve({ status: true, err: "This Coupon Already Used" });
            }
          } else {
            resolve({ status: false, err: "Coupon Expired" });
          }
        } else {
          resolve({ status: false, err: "Coupon doesn't Exist" });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
};
