const mongoose = require("mongoose");
const adminHelper = require("../helpers/adminHelper");
const session = require("express-session");
const { ordersLength } = require("../helpers/adminHelper");
const productHelpers = require("../helpers/productHelpers");
const bannerHelpers = require("../helpers/bannerHelpers");
const couponHelper = require("../helpers/couponHelper");
const { response } = require("../app");

let adminCredentials = {
  email: "mohammedriyazriyaz04@gmail.com",
  password: 123,
};

module.exports = {
  adminLogin: (req, res) => {
    try {
      if (req.session.adminLogIn) {
        res.redirect("/admin");
      } else {
        res.render("admin/login", {
          layout: "adminLayout",
          loginErr: req.session.loginErr,
        });
        // req.session.loginErr = false;
      }
    } catch (error) {
      res.status(500);
    }
  },
  postAdminLogin: (req, res) => {
    try {
      if (
        req.session.adminLogIn ||
        (req.body.email == adminCredentials.email &&
          req.body.password == adminCredentials.password)
      ) {
        req.session.adminLogIn = true;
        req.session.admin = adminCredentials;
        res.redirect("/admin");
      } else {
        req.session.loginErr = "Invalid Username or Password";
        res.redirect("/admin/adminLogin");
      }
    } catch (error) {
      res.status(500);
    }
  },
  adminHome: async (req, res) => {
    try {
      if (req.session.adminLogIn) {
      
        adminHelper.ordersLength().then(async (ordersLength) => {
          let admins = req.session.admin;
          let payment = [];
          let ordersPerDay = {};
          let usersPerDay = {};
  
          let response = await adminHelper.getOrderByDate();
          let userGrowth = await adminHelper.userGrowth();
  
          // console.log(userGrowth, "users==");
          userGrowth.forEach((user) => {
            const userDay = user.createdAt.toLocaleDateString("en-US", {
              month: "long",
            });
            usersPerDay[userDay] = (usersPerDay[userDay] || 0) + 1;
          });
  
          response.forEach((order) => {
            const day = order.orders.createdAt.toLocaleDateString("en-US", {
              month: "long",
            });
            ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
            console.log(ordersPerDay,'kk');
          });
  
          let codLength = await productHelpers.codLength();
          if (codLength) {
            payment.push(codLength[0]?.count);
          }
          let razorPayLength = await productHelpers.razorpayLength();
          if (razorPayLength[0]?.count > 0) {
            payment.push(razorPayLength[0]?.count);
          }
        
          await adminHelper.productsLength().then(async (productsLength) => {
            await adminHelper.usersLength().then(async (usersLength) => {
              await adminHelper.totalRevenue().then((response) => {
                console.log(';;', payment,
                ordersPerDay,
                usersPerDay,
                admins,
                ordersLength,
                productsLength,
                usersLength,
                response,'==');
                res.render("admin/admin-dashboard", {
                  layout: "adminLayout",
                  payment,
                  ordersPerDay,
                  usersPerDay,
                  admins,
                  ordersLength,
                  productsLength,
                  usersLength,
                  response,
                });
              });
            });
          });
        });
      } else {
        res.redirect("/admin/adminLogin");
      }
    } catch (error) {
      res.status(500);
    }
  },
  adminLogout: (req, res) => {
    try {
      req.session.adminLogIn = false;
      res.redirect("/admin/adminLogin");
    } catch (error) {
      res.status(500);
    }
  },
  viewUsers: async (req, res) => {
    try {
      let admins = req.session.admin;
      await adminHelper.viewUsers().then((data) => {
        res.render("admin/view-users", { layout: "adminLayout", admins, data });
      });
    } catch (error) {
      res.status(500);
    }
  },
  blockUser: async (req, res) => {
    try {
      await adminHelper.blockUser(req.params.id).then(() => {
        res.redirect("/admin/view-users");
      });
    } catch (error) {
      res.status(500);
    }
  },
  unBlock: async (req, res) => {
    try {
      await adminHelper.unBlock(req.params.id).then(() => {
        res.redirect("/admin/view-users");
      });
    } catch (error) {
      res.status(500);
    }
  },
  getAddCoupons: (req, res) => {
    try {
      let admins = req.session.admin;
      res.render("admin/add-coupon", { layout: "adminLayout", admins });
    } catch (error) {
      res.status(500);
    }
  },
  addBanner: (req, res) => {
    try {
      let admins = req.session.admin;
      res.render("admin/add-banner", { layout: "adminLayout", admins });
    } catch (error) {
      res.status(500);
    }
  },
  postBanner: (req, res) => {
    try {
      bannerHelpers.postBanner(req.body, req.file.filename).then(() => {
        res.redirect("/admin/banners");
      });
    } catch (error) {
      res.status(500);
    }
  },
  listBanner: (req, res) => {
    try {
      let admins = req.session.admin;
      bannerHelpers.listBanner().then((response) => {
        // console.log(response);
        res.render("admin/list-banner", {
          layout: "adminLayout",
          admins,
          response,
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  deleteBanner: (req, res) => {
    try {
      bannerHelpers.deleteBanner(req.body.bannerId).then((response) => {
        res.json({ status: true });
      });
    } catch (error) {
      res.status(500);
    }
  },
  editBanner: (req, res) => {
    try {
      bannerHelpers.getEditBanner(req.query.banner).then((response) => {
        let admins = req.session.admin;
        res.render("admin/edit-banner", {
          layout: "adminLayout",
          admins,
          response,
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  postEditBanner: (req, res) => {
    try {
      bannerHelpers
        .postEditBanner(req.query.editbanner, req.body, req.file.filename)
        .then(() => {
          res.redirect("/admin/banners");
        });
    } catch (error) {
      res.status(500);
    }
  },
  generateCoupon: (req, res) => {
    try {
      couponHelper.generateCoupon().then((response) => {
        res.json(response);
      });
    } catch (error) {
      res.status(500);
    }
  },
  postCoupon: (req, res) => {
    try {
      couponHelper.postCoupon(req.body).then((response) => {
        res.json(response);
      });
    } catch (error) {
      res.status(500);
    }
  },
  viewCoupons: (req, res) => {
    try {
      let admins = req.session.admin;
      couponHelper.viewCoupons().then((coupon) => {
        coupon.map((Detail) => {
          coupon.expiry = Detail.expiry.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          });
        });
        // const formattedDates = coupon.slice(0, 2).map(coupon => {
        //   const options = {
        //     weekday: 'short',
        //     month: 'short',
        //     day: 'numeric',
        //     hour: 'numeric',
        //     minute: 'numeric',
        //     timeZone: 'Asia/Kolkata'
        //   };
        //   return coupon.expiry.toLocaleString('en-US', options);
        // });
        // console.log(formattedDates,'kk');
        res.render("admin/view-coupons", {
          layout: "adminLayout",
          admins,
          coupon,
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  deleteCoupon: (req, res) => {
    try {
      couponHelper.deleteCoupon(req.body.couponId).then((response) => {
        res.json({ status: true });
      });
    } catch (error) {
      res.status(500);
    }
  },
};
