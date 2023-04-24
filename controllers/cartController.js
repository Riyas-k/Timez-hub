const session = require("express-session");
const mongoose = require("mongoose");
const { response } = require("../app");
const cartHelpers = require("../helpers/cartHelpers");
const couponHelper = require("../helpers/couponHelper");
const orderHelpers = require("../helpers/orderHelper");
const productHelpers = require("../helpers/productHelpers");
const userHelpers = require("../helpers/userHelper");

module.exports = {
  addToCart: async (req, res) => {
    try {
      // let user = req.session.user
      await cartHelpers
        .addToCart(req.params.id, req.session.user.id)
        .then((response) => {
          res.json({ status: true });
        });
    } catch (error) {
      res.status(500);
    }
  },
  listCart: async (req, res) => {
    try {
      let count = await cartHelpers.getCount(req.session.user.id);
      let offerTotal = await cartHelpers.getOfferTotal(req.session.user.id);
      let total = await cartHelpers.getTotal(req.session.user.id);
      let subTotal = await cartHelpers.subTotal(req.session.user.id);
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);
      await cartHelpers.listCart(req.session.user.id).then((cartItems) => {
        let user = req.session.user;
        // console.log(cartItems,'=====cart');
       
        res.render("user/cart", {
          cartItems,
          user,
          count,
          offerTotal,
          subTotal,
          total,
          wishListCount,
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  changeQuantity: async (req, res) => {
    try {
      await cartHelpers.changeQuantity(req.body).then(async (response) => {
        response.offerTotal = await cartHelpers.getOfferTotal(
          req.session.user.id
        );
        response.total = await cartHelpers.getTotal(req.session.user.id);
        response.subTotal = await cartHelpers.getSubTotal(
          req.session.user.id,
          req.body.product
        );
        response.products = await productHelpers.getSingleProduct(
          req.body.product
        );
        //  console.log(response.products[0],'===>>>=====');
        res.json(response);
      });
    } catch (error) {
      res.status(500);
    }
  },
  removeItem: async (req, res) => {
    try {
      await cartHelpers
        .removeItem(req.body, req.session.user.id)
        .then((response) => {
          res.json(response);
        });
    } catch (error) {
      res.status(500);
    }
  },
  postCoupon:async(req,res)=>{
    try {
        if(req.body.coupon.length>0){
        req.session.coupon = req.body.coupon
       
          res.redirect('/placeOrder')
       
      }else{
        res.redirect('/placeOrder')
      }
    } catch (error) {
        res.status(500)
    }
  }
};
