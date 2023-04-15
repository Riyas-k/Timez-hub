const db = require("../models/connection");
const multer = require("multer");
const filename = require("../multer/multer");
// const { addCategory } = require('../controllers/adminController');
// const { response } = require('../app');
const session = require("express-session");
const { response } = require("../app");

module.exports = {
  postAddProduct: (bodyData, filename) => {
    return new Promise(async (resolve, reject) => {
      let addProduct = new db.product({
        ProductName: bodyData.name,
        Quantity: bodyData.quantity,
        Description: bodyData.description,
        Category: bodyData.category,
        Price: bodyData.price,
        Category: bodyData.category,
        OfferPrice: bodyData.OfferPrice,
        Image: filename,
      });
      await addProduct.save().then((productData) => {
        // console.log(productData);
        resolve(productData);
      });
    });
  },
  postCategory: (data) => {
    // console.log(data.categoryName);

    return new Promise(async (resolve, reject) => {
      let exist = await db.category.findOne({ Name: data.categoryName });

      if (!exist) {
        let addCategory = new db.category({
          Name: data.categoryName,
          offer:data.offer
        });
        await addCategory.save().then((data) => {
          // console.log(data);
          resolve(data);
        });
      } else {
        resolve({ status: true });
      }
    });
  },
  postSubCategory: (data) => {
    return new Promise(async (resolve, reject) => {
      let exist = await db.subCategory.findOne({ Name: data.subCategoryName });
      if (!exist) {
        let addSubCategory = new db.subCategory({
          Name: data.subCategoryName,
        });
        await addSubCategory.save().then((data) => {
          // console.log(data);
          resolve(data);
        });
      } else {
        resolve({ status: true });
      }
    });
  },
  getProducts: async (pageNo, perPage) => {
    try {
      let data = await db.product
        .find()
        .sort({ _id: -1 })
        .skip((pageNo - 1) * perPage)
        .limit(perPage);

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      await db.category
        .find()
        .sort({ _id: -1 })
        .then((data) => {
          // console.log(data);
          resolve(data);
        });
    });
  },
  getSubCategory: () => {
    return new Promise(async (resolve, reject) => {
      await db.subCategory
        .find()
        .sort({ _id: -1 })
        .then((data) => {
          resolve(data);
        });
    });
  },
  getEditProduct: (proId) => {
    return new Promise(async (resolve, reject) => {
      await db.product
        .findOne({ _id: proId })
        .exec()
        .then((data) => {
          // console.log(data,'======');
          resolve(data);
        });
    });
  },

  postEditProduct: async (proId, filename, body) => {
    try {
      let response = await db.product.updateOne(
        { _id: proId },
        {
          $set: {
            ProductName: body.name,
            Price: body.price,
            Category: body.category,
            Quantity: body.quantity,
            OfferPrice: body.OfferPrice,
            Description: body.description,
            Image: filename,
          },
        }
      );
      return response;
    } catch (err) {
      console.log(err);
    }
  },
  getEditCategory: async (proId) => {
    try {
      let data = await db.category.findOne({ _id: proId });
      // console.log(data,'====');
      return data;
    } catch (err) {
      console.log(err);
    }
  },
  postEditCategory: async (proId, bodyData) => {
    try {
      await db.category.updateOne(
        { _id: proId },
        {
          $set: {
            Name: bodyData.categoryName,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  },
  getEditSub: async (proId, bodyData) => {
    try {
      let data = await db.subCategory.findOne({ _id: proId });
      return data;
    } catch (err) {
      console.log(err);
    }
  },
  postEditSub: async (proId, bodyData) => {
    try {
      await db.subCategory.updateOne(
        { _id: proId },
        {
          $set: {
            Name: bodyData.subCategoryName,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  },
  deleteProduct: async (proId) => {
    try {
      await db.product.deleteOne({ _id: proId });
    } catch (error) {
      console.log(error);
    }
  },
  deleteCategory: (proId) => {
    return new Promise(async (resolve, reject) => {
      await db.category.deleteOne({ _id: proId }).then(() => {
        resolve();
      });
    });
  },
  deleteSub: async (proId) => {
    try {
      await db.subCategory.deleteOne({ _id: proId });
    } catch (err) {
      console.log(err);
    }
  },
  getFull: async (proId) => {
    try {
      let data = await db.product.find({ _id: proId });
      return data;
    } catch (error) {
      console.log(error);
    }
  },
  getSingleProduct: async (proId) => {
    try {
      let data = await db.product.findOne({ _id: proId });
      // console.log(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  },
  getCategoryProducts: (categoryId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let result = await db.category.findOne({ _id: categoryId });
        //    console.log(result,'>><<');
        await db.product.find({ Category: result.Name }).then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
    codLength: () => {
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
                  $in: ["Placed", "Delivered"],
                },
              },
            },
            {
              $match: {
                "orders.paymentMethod": "COD",
              },
            },
            {
              $count: "count",
            },
          ])
          .then((data) => {
            console.log(data, "cod");
            resolve(data);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  razorpayLength: () => {
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
                  $in: ["Placed", "Delivered"],
                },
              },
            },
            {
              $match: {
                "orders.paymentMethod": "online",
              },
            },
            {
              $count: "count",
            },
          ])
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  sortProducts: (value) => {
    try {
      return new Promise(async (resolve, reject) => {
        if (value == "price-low-to-high") {
          await db.product
            .find()
            .sort({ OfferPrice: 1 })
            .then((response) => {
              console.log(response);
              resolve(response);
            });
        } else {
          await db.product
            .find()
            .sort({ OfferPrice: -1 })
            .then((response) => {
              console.log(response);
              resolve(response);
            });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  search: (bodyData) => {
    try {
      return new Promise(async (resolve, reject) => {
        let product = await db.product.findOne({ ProductName: bodyData });
        // console.log(product);
        resolve(product);
      });
    } catch (error) {
      console.log(error);
    }
  },
  walletOrders:()=>{
   try {
    return new Promise(async(resolve,reject)=>{
      await db.order.aggregate([
       {
         $unwind:'$orders'
       },
       {
        $match:{
          'orders.orderStatus':{
            $in:['Placed','Delivered']
          }
        }
       },
      
       {
        $match:{
          'orders.paymentMethod':'Wallet'
        }
       }
       ,
       {
        $count:'count'
       }
      ]).then((response)=>{
       console.log(response,'klfgjgl');
       resolve(response)
      })
   })
 
   } catch (error) {
    
   }
}
}
