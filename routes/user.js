var express = require("express");
var router = express.Router();
const userControllers = require('../controllers/userController');
const mongoose = require('mongoose');
const auth = require('../middlewares/middleware');
const productController = require("../controllers/productController");
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const multer = require("../multer/multer");
const wishListController = require('../controllers/wishListController')
// const slugify   = require('slugify');

// const slugify = (string) => {
//     return string
//       .toLowerCase()
//       .normalize('NFD')
//       .replace(/[\u0300-\u036f]/g, '')
//       .split('')
//       .map(character=>(/[a-z0-9]/.test(character)?character:'-'))
//       .join('')
//       .replace(/^-+/g, '')
//     .replace(/-+$/g, ''); 
//   }

// get home
router.get("/", userControllers.home);

//get shop
router.get("/shop",auth.user,auth.userCheck, userControllers.shop);

//get login
router.get("/login",auth.user,userControllers.getLogin);

//post login
router.post('/login',userControllers.postLogin)

//get signup
router.get("/signup",userControllers.signup);

//post signup
router.post('/signup',userControllers.postSignup);

//logout
router.get('/logout',userControllers.logout);

//otpNumber
router.get('/otpNumber',userControllers.getOtpNumber);

//postOtpNumber
router.post('/otpNumber',userControllers.postOtpNumber);

//verifyOtp
router.get('/otpVerify',userControllers.getOtpVerify)

router.post('/otpVerify',userControllers.postOtpVerify);

//full Image
router.get('/fullImage/:id',auth.user,auth.userCheck,productController.fullImage);

//add to cart
router.get('/addToCart/:id',auth.user,auth.userCheck,cartController.addToCart);

//list items in cart
router.get('/cart',auth.user,auth.userCheck,cartController.listCart);

//put coupon
router.post('/cart',auth.user,auth.userCheck,cartController.postCoupon);

//change cart Quantity
router.put('/change-quantity',auth.user,auth.userCheck,cartController.changeQuantity);

//delete product from cart
router.delete('/removeProduct',auth.user,auth.userCheck,cartController.removeItem);

//place Order
router.get('/placeOrder',auth.user,auth.userCheck,orderController.placeOrder);

//post place Order
router.post('/placeOrder',auth.user,auth.userCheck,orderController.postPlaceOrder);

//successOrder
router.get('/success',auth.user,auth.userCheck,orderController.getSuccess);

//view Order
router.get('/orders',auth.user,auth.userCheck,orderController.getOrders);

//cancelOrder
router.put('/cancel-order/:id',auth.user,auth.userCheck,orderController.cancelOrder);

//deleteOrder
router.delete('/deleteOrder/:id',auth.user,auth.userCheck,orderController.deleteOrder)

//new-Address
router.get('/add-address',auth.user,auth.userCheck,orderController.addNewAddress);

//post--Address
router.post('/add-address',auth.user,auth.userCheck,orderController.postAddress);

//delete Address
router.delete('/delete-address/:id',auth.user,auth.userCheck,orderController.deleteAddress);

//order-details
router.get('/order-details/:id',auth.user,auth.userCheck,orderController.orderDetails);

//profile
router.get('/profile',auth.user,auth.userCheck,userControllers.getProfile);

//put profile
router.put('/profile/:id',auth.user,auth.userCheck,userControllers.postProfile);

//get reset password
router.get('/reset-password',auth.user,auth.userCheck,userControllers.resetPassword);

//put reset password
router.put('/reset-password',auth.user,auth.userCheck,userControllers.postResetPassword)

//add-new-address
router.get('/add-new-address',auth.user,auth.userCheck,userControllers.addNewAddress);

//post new address
router.post('/add-new-address',auth.user,auth.userCheck,userControllers.postAddress);

//view address
router.get('/view-address',auth.user,auth.userCheck,userControllers.viewAddress);

//delete new address
router.delete('/delete-new-address',auth.user,auth.userCheck,userControllers.deleteNewAddress);

//verify-payment
router.post('/verify-payment',auth.user,auth.userCheck,orderController.verifyPaymentRazorPay);

//category-products
router.get('/get-categoryProducts/:id',auth.user,auth.userCheck,productController.getCategoryProducts);

//return-order
router.put('/return-order/:id',auth.user,auth.userCheck,orderController.returnOrder);

//sort
router.post('/sort',auth.user,auth.userCheck,productController.sortProducts);

//search
router.post('/search',auth.user,auth.userCheck,productController.search);

//edit address
router.get('/edit-address/:id',auth.user,auth.userCheck,userControllers.editAddress);

router.post('/edit-address/:id',auth.user,auth.userCheck,userControllers.postEditAddress);

//wishlist
router.get('/wish-list/:id',auth.user,auth.userCheck,wishListController.getWishList);

router.get('/wish-list',auth.user,auth.userCheck,wishListController.getListWishList);

//delete from wishlist
router.delete('/remove-item',auth.user,auth.userCheck,wishListController.removeItem);

//validate  coupon
router.post('/validate-coupon',auth.user,auth.userCheck,orderController.validateCoupon);

//wallet
router.get('/wallet',auth.user,auth.userCheck,userControllers.getWallet)

module.exports = router;
