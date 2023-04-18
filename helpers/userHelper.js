const db = require("../models/connection");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const { resolveContent } = require("nodemailer/lib/shared");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  postSignup: (bodyData) => {
    let emailStatus = {};
    return new Promise(async (resolve, reject) => {
      try {
        let email = bodyData.email;
        let existingUser = await db.users.findOne({ Email: email });
        // console.log(existingUser,'====');
        if (existingUser) {
          emailStatus = { status: false };
          resolve(emailStatus);
        } else {
          // console.log('===');
          let hashPassword = await bcrypt.hash(bodyData.password, 10);
          let newUser = new db.users({
            Name: bodyData.name,
            Email: bodyData.email,
            PhoneNo: bodyData.number,
            Password: hashPassword,
          });
          await newUser.save().then((data) => {
            //   console.log(data);
            resolve({ data: data, status: true });
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  postLogin: (bodyData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db.users.findOne({ Email: bodyData.email });
      // console.log(user);
      if (user) {
        if (user.blocked == false) {
          await bcrypt
            .compare(bodyData.password, user.Password)
            .then((status) => {
              // console.log(status);
              if (status) {
                userName = user.Name;
                id = user._id;
                resolve({ response, loggedInStatus: true, userName, id });
              } else {
                resolve({ loggedInStatus: false });
              }
            });
        } else {
          resolve({ blockedStatus: true });
        }
      } else {
        resolve({ loggedInStatus: false });
      }
    });
  },
  doCount: async () => {
    try {
      let count = await db.product.find().countDocuments();
      return count;
    } catch (error) {
      console.log(error);
    }
  },
  getUsers: async (userId) => {
    try {
      let data = await db.users.findOne({ _id: userId });
      return data;
    } catch (error) {
      console.log(error);
    }
  },
  postProfile: (userId, bodyData) => {
    console.log(userId, "body");
    try {
      return new Promise(async (resolve, reject) => {
        await db.users
          .updateOne(
            { _id: ObjectId(userId) },
            {
              $set: {
                Name: bodyData?.fname,
                Email: bodyData?.email,
                PhoneNo: bodyData?.phone,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  postAddress: (bodyData, userId) => {
    // console.log(userId,'====');
    try {
      return new Promise(async (resolve, reject) => {
        let newAddress = {
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
        let Address = await db.address.findOne({ user: ObjectId(userId) });
        if (Address) {
          await db.address
            .updateOne({ user: userId }, { $push: { Address: newAddress } })
            .then((response) => {
              resolve(response);
            });
        } else {
          let address = new db.address({
            user: userId,
            Address: newAddress,
          });
          await address.save().then((response) => {
            // console.log(response,'>>>');
            resolve(response);
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  viewAddress: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let result = await db.address.findOne({ user: ObjectId(userId) });
        resolve(result);
      });
    } catch (error) {
      console.log(error);
    }
  },
  deleteNewAddress: (addressId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let result = await db.address
          .updateOne(
            { "Address._id": addressId },
            { $pull: { Address: { _id: addressId } } }
          )
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  postResetPassword: (bodyData, userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let userPassword = await db.users.findOne({ _id: ObjectId(userId) });
        // console.log(userPassword.Password,'///');
        let compare = await bcrypt.compare(
          bodyData.password,
          userPassword.Password
        );
        // console.log(compare,'===');
        if (compare) {
          let hashPassword = await bcrypt.hash(bodyData.password2, 10);
          console.log(hashPassword, "???");
          await db.users
            .updateOne(
              { _id: ObjectId(userId) },
              { $set: { Password: hashPassword } }
            )
            .then((response) => {
              resolve({ status: true });
            });
        } else {
          resolve({ status: false });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  editAddress: (addressId) => {
    console.log(addressId, ";;");
    try {
      return new Promise(async (resolve, reject) => {
        await db.address
          .aggregate([
            {
              $unwind: "$Address",
            },
            {
              $match: {
                "Address._id": ObjectId(addressId),
              },
            },
          ])
          .then((response) => {
            // console.log(response,'kk');
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  postEditAddress: (addressId, bodyData) => {
    try {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await db.address.updateOne(
            {
              "Address._id": ObjectId(addressId),
            },
            {
              $set: {
                "Address.$.fname": bodyData.fname,
                "Address.$.lname": bodyData.lname,
                "Address.$.street": bodyData.street,
                "Address.$.apartment": bodyData.apartment,
                "Address.$.city": bodyData.city,
                "Address.$.state": bodyData.state,
                "Address.$.pincode": bodyData.pincode,
                "Address.$.mobile": bodyData.mobile,
                "Address.$.email": bodyData.email,
              },
            }
          );
          console.log(response, "kkk");
          resolve(response);
        } catch (err) {
          reject(err);
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  addToWishList: (proId, userId) => {
    console.log(proId,'===');
    console.log(userId,'ll');
    let objWishList = {
      product: proId,
      Quantity: 1,
    };
    try {
      return new Promise(async (resolve, reject) => {
        let result = await db.wishList.findOne({ user: userId });
        if (result) {
          let productExist = result.wishList.findIndex(
            (items) => items.product == proId
          );
          // console.log(productExist,'LLLLLlllll');
          if (productExist == -1) {
            await db.wishList
              .updateOne(
                { product: proId },
                { $push: { wishList: objWishList } }
              )
              .then((response) => {
                resolve(response);
              });
          }
        } else {
          let wishList = new db.wishList({
            user: userId,
            wishList: objWishList,
          });
          await wishList.save().then((response) => {
            resolve(response);
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  wishListLength: (userId) => {
    try {
      let count = 0;
      return new Promise(async (resolve, reject) => {
        let user = await db.wishList.findOne({ user: userId });
        //    console.log(user);
        if (user) {
          count = user.wishList.length;
        }
        //    console.log(count);
        resolve(count);
      });
    } catch (error) {
      console.log(error);
    }
  },
  getListWishList: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.wishList
          .aggregate([
            {
              $match: { user: ObjectId( userId) },
            },
            {
              $unwind: "$wishList",
            },
            {
              $project: {
                _id: "$wishList._id",
                item: "$wishList.product",
                Quantity: "$wishList.Quantity",
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "item",
                foreignField: "_id",
                as: "wishListed",
              },
            },
            {
              $unwind: "$wishListed",
            },
          ])
          .then((response) => {
            console.log(response,'=====================');
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  removeItem: (bodyData, userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.wishList
          .updateOne(
            { user: userId, product: bodyData.proId },
            { $pull: { wishList: { _id: bodyData.wishListId } } }
          )
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
 
  getWalletAmount:(userId)=>{
    try {
      return new Promise(async(resolve,reject)=>{
        await db.users.findOne({_id:userId}).then((response)=>{
          console.log(response);
          resolve(response?.Wallet)
        })
      })
      
    } catch (error) {
      console.log(error);
    }
  },
  otpUserVerify:(number)=>{
    return new Promise(async(resolve,reject)=>{
      console.log(number);
      try {
        let result = await db.users.findOne({PhoneNo:number})
        resolve(result)
        // console.log(result,'=====otpuser');
        
      } catch (error) {
        console.log(error);
      }
    })
  },
  findProductInCart:(userId)=>{
      try {
        return new Promise(async(resolve,reject)=>{
            let orders = await db.cart.aggregate([
              {
                $match:{
                  user:ObjectId(userId)
                }
              },
              {
                $unwind:"$cartItems"
              },
               {
                $project:{
                  data:'$cartItems.productId'
                }
               }
            ])

            // console.log(orders,'kkklkflfld');
           let result =  orders.map((order)=>order.data)
           resolve(result)
          //  console.log(result,'=====');
        })
      } catch (error) {
        console.log(error);
      }
  }
};
