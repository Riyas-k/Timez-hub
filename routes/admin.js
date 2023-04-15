var express = require("express");
var router = express.Router();
const adminControllers = require('../controllers/adminController');
const productControllers = require('../controllers/productController');
const auth = require('../middlewares/middleware');
const multer = require("../multer/multer");
const mongoose = require('mongoose');
const { admin } = require("../middlewares/middleware");
const orderController = require("../controllers/orderController");

//get dashboard
router.get("/",auth.admin, adminControllers.adminHome);

// get adminLogin
router.get("/adminLogin",auth.admin,adminControllers.adminLogin);

//post adminLogin
router.post('/adminLogin',adminControllers.postAdminLogin);

//admin logout
router.get('/adminLogout',adminControllers.adminLogout)

//get addProduct
router.get("/add-product",auth.admin, productControllers.getAddProduct);

//post addProduct
router.post('/add-product',multer.uploads,productControllers.postAddProduct);

//get category
router.get("/add-category",auth.admin,productControllers.getCategory);

//post category
router.post('/add-category',productControllers.postCategory);

//get subCategory
// router.get("/add-sub",auth.admin,productControllers.getSubCategory);

//post subCategory
// router.post('/add-sub',productControllers.postSubCategory);

//viewProducts
router.get('/view-products',auth.admin,productControllers.getViewProduct);

//get edit product
router.get('/edit-product/:id',auth.admin,productControllers.getEditProduct);

//post edit product
router.post('/edit-product/:id',multer.uploads,productControllers.postEditProduct);

//edit getEditCategory
router.get('/edit-category/:id',auth.admin,productControllers.getEditCategory)

//post editCategory
router.post('/edit-category/:id',productControllers.postEditCategory);

// //edit subCategory
// router.get('/edit-sub/:id',auth.admin,productControllers.getEditSub);

// //post editSubCategory
// router.post('/edit-sub/:id',productControllers.postEditSub);

//delete product
router.get('/delete-product/:id',auth.admin,productControllers.deleteProduct);

//delete Category
router.get('/delete-category/:id',auth.admin,productControllers.deleteCategory);

//delete subCategory
router.get('/delete-sub/:id',auth.admin,productControllers.deleteSub);

//view-users
router.get('/view-users',auth.admin,adminControllers.viewUsers);

//block-users
router.get('/block-user/:id',auth.admin,adminControllers.blockUser);

//unblock
router.get('/unblock-user/:id',auth.admin,adminControllers.unBlock);

//view Orders
router.get('/orders',auth.admin,orderController.viewOrders);

//cancel order
router.get('/cancel-order/:id',auth.admin,orderController.cancelOrder);

//view order details 
router.get('/order-details/:id',auth.admin,orderController.adminOrderDetails)   

//view-single   
router.get('/fullImage/:id',auth.admin,productControllers.singleView);

//changeOrderStatus
router.post('/change-order-status/:id',auth.admin,orderController.changeOrderStatus);

//sales-report
router.get('/sales-report',auth.admin,orderController.getSales);

// post sales-report
router.post('/sales-report',auth.admin,orderController.postSales);

//add-coupons
router.get('/add-coupons',auth.admin,adminControllers.getAddCoupons);

//post coupon
router.post('/add-coupons',auth.admin,adminControllers.postCoupon)

//add-banner
router.get('/add-banner',auth.admin,adminControllers.addBanner);
router.post('/add-banner',auth.admin,multer.bannerUploads,adminControllers.postBanner);

//list banner
router.get('/banners',auth.admin,adminControllers.listBanner);

//delete banner
router.put('/delete-banner',auth.admin,adminControllers.deleteBanner);

//edit banner
router.get('/edit-banner',auth.admin,adminControllers.editBanner);
router.post('/edit-banner',auth.admin,multer.bannerUploads,adminControllers.postEditBanner);

//generate coupons
router.get('/generate-coupon',auth.admin,adminControllers.generateCoupon);

//view-coupons
router.get('/coupons',auth.admin,adminControllers.viewCoupons);

//delete-coupons
router.delete('/delete-coupon',auth.admin,adminControllers.deleteCoupon)

module.exports = router;
