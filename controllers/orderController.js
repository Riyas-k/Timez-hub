const session = require("express-session");
const mongoose = require("mongoose");
const { response, off } = require("../app");
const cartHelpers = require("../helpers/cartHelpers");
const orderHelpers = require("../helpers/orderHelper");
const Razorpay = require("razorpay");
const paypal = require("paypal-rest-sdk");
// const razorPayDetails = require("../otp/razorpay");
// const paypalDetails = require("../otp/paypal");
const userHelpers = require("../helpers/userHelper");
const couponHelper = require("../helpers/couponHelper");
const { orders } = require("@paypal/checkout-server-sdk");

let id = process.env.Razorpay_id;
let secret_key = process.env.Razorpay_secret_key

var instance = new Razorpay({
  key_id: id,
  key_secret:secret_key,
});

module.exports = {
  placeOrder: async (req, res) => {
    try {
      user = req.session.user;
      // user.id = user.id.toString()
      let count = await cartHelpers.getCount(req.session.user.id);
      let cartItems = await cartHelpers.listCart(req.session.user.id);
      let offerTotal = await cartHelpers.getOfferTotal(req.session.user.id);
      let wallet = await userHelpers.getWalletAmount(req.session.user.id)
      // console.log('riaaz');
      // console.log(offerTotal, "==");
      let Address = await orderHelpers.getAddress(req.session.user.id);
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);
      console.log(offerTotal,
        user,
        count,
        cartItems,
        Address,
        wishListCount,
        wallet
        );
      if (cartItems.length != 0) {
        res.render("user/order", {
          offerTotal,
          user,
          count,
          cartItems,
          Address,
          wishListCount,
          wallet
        });
      } else {
        res.redirect("/shop");
      }
    } catch (error) {
      console.log(error);
      // res.status(500);
    }
  },
  postPlaceOrder: async (req, res) => {
    // console.log(req.body["payment-method"],'[]]]]]]');
    try {
      let offerTotal = await cartHelpers.getOfferTotal(req.session.user.id);
      await orderHelpers
        .placeOrder(req.body, offerTotal)
        .then(async (response) => {
          // console.log(response,'lllllllllllll');
          if (req.body["payment-method"] === "COD") {
            res.json({ codStatus: true });
          } else if (req.body["payment-method"] === "online") {
            orderHelpers
              .generateRazorPay(req.session.user.id, offerTotal)
              .then((response) => {
                res.json(response);
              });
          }
          else if(req.body['payment-method']==='Wallet'){
          
            await  orderHelpers.updateWallet(req.session.user.id,offerTotal).then((response)=>{
              if(response){
                console.log(response,'jjjj');
                res.json({wallet:true})
              }
            })
          }
        });
    } catch (error) {
      // res.status(500);
    }
  },
  getSuccess: async (req, res) => {
    try {
      let count = await cartHelpers.getCount(req.session.user.id);
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);
      let user = req.session.user;

      res.render("user/success", { user, count, wishListCount });
    } catch (error) {
      res.status(500);
    }
  },
  getOrders: async (req, res) => {
    try {
      let count = await cartHelpers.getCount(req.session.user.id);
      let user = req.session.user;
      let orders = await orderHelpers.getOrders(req.session.user.id);
      orders.map((order) => {
        order.orders.createdAt = order.orders.createdAt.toLocaleString(
          "en-US",
          {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          }
        );
      });
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);
       console.log(orders.length,'===');
      res.render("user/view-orders", { count, user, orders, wishListCount });
    } catch (error) {
      res.status(500);
    }
  },
  addNewAddress: async (req, res) => {
    try {
      let count = await cartHelpers.getCount(req.session.user.id);
      let user = req.session.user;
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);
      res.render("user/addNewAddress", { count, user, wishListCount });
    } catch (error) {
      res.status(500);
    }
  },
  cancelOrder: async (req, res) => {
    try {
      console.log(req.params.id,'=------');
      let offerTotal = await orderHelpers.getOrderTotal(req.params.id);
      console.log(offerTotal,'kkkkk');
     await  orderHelpers.cancelWalletIncrease(req.session.user.id,offerTotal)
     await  orderHelpers.cancelOrder(req.params.id, req.session.user.id)
        .then((result) => {
          if(result){
            res.json({ status: true });
          }
          res.json({ status: true });
        });
    } catch (error) {
      res.status(500);
    }
  },
  viewOrders: async (req, res) => {
    try {
      await orderHelpers.viewOrders().then((orders) => {
        orders.map((order) => {
          order.orders.createdAt = order.orders.createdAt.toLocaleString(
            "en-US",
            {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }
          );
        });
        let admins = req.session.admin;

        res.render("admin/view-orders", {
          orders,
          layout: "adminLayout",
          admins,
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  postAddress: async (req, res) => {
    try {
      await orderHelpers.postAddress(req.body, req.session.user.id).then(() => {
        res.redirect("/placeOrder");
      });
    } catch (error) {
      res.status(500);
    }
  },
  deleteOrder: async (req, res) => {
    try {
      await orderHelpers.deleteOrder(req.params.id).then((response) => {
        res.json({ status: true });
      });
    } catch (error) {
      res.status(500);
    }
  },
  deleteAddress: async (req, res) => {
    try {
      await orderHelpers.deleteAddress(req.params.id).then((response) => {
        res.json({ status: true });
      });
    } catch (error) {
      res.status(500);
    }
  },
  orderDetails: async (req, res) => {
    try {
      await orderHelpers.orderDetails(req.params.id).then(async (response) => {
        // console.log(response,'response==>>');
        let count = await cartHelpers.getCount(req.session.user.id);
        await orderHelpers.viewOrders().then(async (orders) => {
          orders.map((order) => {
            order.orders.createdAt = order.orders.createdAt.toLocaleString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }
            );
          });
          let user = req.session.user;
          let products = response.productDetails[0];
          let address = response.address1;
          let orderDetails = response.details;
          let wishListCount = await userHelpers.wishListLength(
            req.session.user.id
          );
          let data = await orderHelpers.createData(response);
          res.render("user/orderDetails", {
            products,
            address,
            orderDetails,
            user,
            count,
            orders,
            wishListCount,
            data,
          });
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  adminOrderDetails: async (req, res) => {
    try {
      await orderHelpers.orderDetails(req.params.id).then(async (response) => {
        await orderHelpers.viewOrders().then((orders) => {
          orders.map((order) => {
            order.orders.createdAt = order.orders.createdAt.toLocaleString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }
            );
          });
          let products = response.productDetails[0];
          let address = response.address1;
          let orderDetails = response.details;
          let admins = req.session.admin;
            console.log(address[0].shippingAddress.user,'kkk');
          res.render("admin/order-details", {
            layout: "adminLayout",
            admins,
            products,
            address,
            orders,
            orderDetails,
          });
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  changeOrderStatus: (req, res) => {
    console.log(req.body,'body data');
    try {
      orderHelpers
        .changeOrderStatus(req.body.status, req.params.id)
        .then((response) => {
          const orders = [];
          for (let i = 0; i <response.orders.length; i++) {
            if (response.orders[i].orderStatus === "Return Confirmed") {
              orders.push(response.orders[i].orderStatus);
            }
          }
          console.log(orders,'resp');
        if(orders){
          console.log('there is orders');
           orderHelpers.getWallet(req.body.userId)
        }

          res.json({ status: true });
        });
    } catch (error) {
      res.status(500);
    }
  },
  verifyPaymentRazorPay: (req, res) => {
    try {
      console.log(req.body, "body");
      orderHelpers
        .verifyPaymentRazorPay(req.body)
        .then(async () => {
          console.log(req.body["order[receipt]"], "//");
          await orderHelpers
            .changeOnlineStatus(req.body["order[receipt]"])
            .then((response) => {
              console.log("razorpay successfull");
              res.json({ status: true });
            });
        })
        .catch((err) => {
          res.json({ status: false });
        });
    } catch (error) {
      res.status(500);
    }
  },
  returnOrder:async (req, res) => {
    // console.log(req.params.id,'id');
    try {
    
      orderHelpers
        .returnOrder(req.params.id, req.session.user.id)
        .then((response) => {
          res.json({ status: true });
        });
    } catch (error) {
      res.status(500);
    }
  },
  getSales: async (req, res) => {
    try {
      let admins = req.session.admin;
      await orderHelpers.findTotal().then(async (total) => {
        await orderHelpers.salesDetails().then((Details) => {
          Details.map((Detail) => {
            Detail.orders.createdAt = Detail.orders.createdAt.toLocaleString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }
            );
          });
          let shipping = Details.map((detail) => detail.orders);
          // let productDetails = shipping.map((data) => data.productDetails);
          // let Details1 = productDetails.map((datas) => datas[0]);
            console.log(Details,';;');
          res.render("admin/sales", {
            layout: "adminLayout",
            admins,
            total,
            Details,
            shipping,
          
          });
        });
      });
    } catch (error) {
      console.log(error);
      res.status(500);
    }
  },
  postSales: async(req, res) => {
    try {
      //need
      let admins = req.session.admin
      let total =  await orderHelpers.findTotal()
    
      orderHelpers.postSales(req.body).then((Details)=>{
      Details.map((Detail) => {
        Detail.orders.createdAt = Detail.orders.createdAt.toLocaleString(
          "en-US",
          {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          }
        );
      });
      let shipping = Details.map((detail) => detail.orders);
      console.log(req.body,'===============');
        res.render('admin/sort-sales',{layout:'adminLayout',admins,total,Details,shipping})
      })
    } catch (error) {
      console.log(error);
      res.status(500);
    }
  },
  validateCoupon:async(req,res)=>{
    try {
      // console.log(req.query.coupon);
      let total = await cartHelpers.getOfferTotal(req.session.user.id)
       couponHelper.validateCoupon(req.query.coupon,req.session.user.id,total).then((response)=>{
         res.json(response)
       })
    } catch (error) {
      res.status(500)
    }
  }
};
