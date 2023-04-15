const { response } = require("../app");
const db = require("../models/connection");

module.exports = {
  viewUsers: () => {
    return new Promise(async (resolve, reject) => {
      await db.users.find().then((data) => {
        // console.log(data);
        resolve(data);
      });
    });
  },
  blockUser: async (userId) => {
    try {
      await db.users.updateOne({ _id: userId }, { $set: { blocked: true } });
    } catch (err) {
      console.log(err);
    }
  },
  unBlock: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.users
        .updateOne({ _id: userId }, { $set: { blocked: false } })
        .then(() => {
          resolve();
        });
    });
  },
  ordersLength: () => {
    try {
      return new Promise(async (resolve, reject) => {
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
          }
        ]).then((response) => {
          console.log(response.length,'///');
          if (response == 0) {
            resolve(0);
          } else {
            resolve(response.length);
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  productsLength: () => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.product.find().then((response) => {
          if (response) {
            resolve(response?.length);
          } else {
            resolve(0);
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  usersLength: () => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.users.find().then((response) => {
          if (response) {
            resolve(response?.length);
          } else {
            resolve(0);
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  totalRevenue: () => {
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
              $group: {
                _id: null,
                total: { $sum: "$orders.total" },
              },
            },
          ])
          .then((result) => {
            if (result == 0) {
              resolve(0);
            } else {
              resolve(result[0]?.total);
            }
          });
        // console.log(result[0].total,'---->');
      });
    } catch (error) {
      console.log(error);
    }
  },
  getOrderByDate: () => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.order
          .aggregate([
            {
              $unwind: "$orders",
            },
            {
              $project: {
                _id: 0,
                "orders.createdAt": 1,
              },
            },
          ])
          .then((response) => {
            // console.log(response);
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  userGrowth: () => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.users
          .aggregate([
            {
              $project: {
                _id: 0,
                createdAt: 1,
              },
            },
          ])
          .then((response) => {
            // console.log(response);
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
};
