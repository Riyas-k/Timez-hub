const { response } = require("express");
const mongoose = require("mongoose");
let userHelpers = require("../helpers/userHelper");
const session = require("express-session");
const productHelpers = require("../helpers/productHelpers");
const db = require("../models/connection");
const cartHelpers = require("../helpers/cartHelpers");
const nodemailer = require("nodemailer");
const wishListController = require("./wishListController");

let accountSID = process.env.Twilio_accountSID
let authToken = process.env.Twilio_authToken
let serviceId = process.env.Twilio_serviceId

let client = require("twilio")(accountSID, authToken);
const { Twilio } = require("twilio");

module.exports = {
  home: async (req, res) => {
    try {
      let pageNo = req.query.page;
      let perPage = 4;
      let doCount = await userHelpers.doCount();
      // console.log(doCount,'====');
      await productHelpers.getProducts(pageNo, perPage).then(async (data) => {
        let pages = Math.ceil(doCount / perPage);
      if (req.session.userLoggedIn) {
          let wishListCount = await userHelpers.wishListLength(
            req.session.user.id
          );
          let count = await cartHelpers.getCount(req.session.user.id);
          let user = req.session.user;
          res.render("user/user", { user, data, pages, count, wishListCount,'search':true });
        } else {
         res.render('user/user',{data,pages,'search':true})
        }
        });
    } catch (error) {
      res.status(500);
    }
  },
  shop: async (req, res) => {
    try {
      let pageNo = req.query.page;
      let perPage = 8;
      let doCount = await userHelpers.doCount();
      let user = req.session.user;
      let category = await productHelpers.getCategory();
      await productHelpers.getProducts(pageNo, perPage).then(async (data) => {
        let wishListCount = await userHelpers.wishListLength(
          req.session.user.id
        );
        if (req.session.userLoggedIn) {
          let count = await cartHelpers.getCount(req.session.user.id);
          let pages = Math.ceil(doCount / perPage);
          // console.log(data);
          res.render("user/shop", {
            data,
            user,
            pages,
            count,
            category,
            wishListCount,'search':true
          });
        } else {
          res.redirect("/login");
        }
      });
    } catch (error) {
      res.status(500);
    }
  },
  getLogin: (req, res) => {
    try {
      if (req.session.userLoggedIn) {
        res.redirect("/");
      } else {
        res.render("user/login");
      }
    } catch (error) {
      res.status(500);
    }
  },
  signup: (req, res) => {
    try {
      emailStatus = true;
      res.render("user/signup", { emailStatus });
    } catch (error) {
      res.status(500);
    }
  },
  postSignup: (req, res) => {
    try {
      userHelpers.postSignup(req.body).then((response) => {
        let emailStatus = response.status;
        // console.log(emailStatus);
        if (emailStatus == false) {
          res.render("user/signup", { emailStatus });
        } else {
          res.redirect("/login");
        }
      });
    } catch (error) {
      res.status(500);
    }
  },
  postLogin: (req, res) => {
    try {
      userHelpers.postLogin(req.body).then((response) => {
        // console.log(response);
        req.session.userLoggedIn = true;
        req.session.user = response;
        let loggedInStatus = response.loggedInStatus;
        let blockedStatus = response.blockedStatus;
        if (loggedInStatus) {
          res.redirect("/");
        } else {
          res.render("user/login", {
            block: blockedStatus,
            logged: loggedInStatus,
          });
        }
      });
    } catch (error) {
      res.status(500);
    }
  },
  logout: (req, res) => {
    try {
      req.session.userLoggedIn = false;
      res.redirect("/login");
    } catch (error) {
      req.status(500);
    }
  },
  getOtpNumber: (req, res) => {
    try {
      res.render("user/otpNumber");
    } catch (error) {
      res.status(500);
    }
  },
  postOtpNumber: async (req, res) => {
    try {
      let mobilNo = req.body.number;
      let userNo = await db.users.find({ PhoneNo: mobilNo });
      if (userNo == false) {
        res.render("user/otpNumber", { userExist: true });
      } else {
        req.session.mobilNo = mobilNo;
        client.verify.v2
          .services(serviceId)
          .verifications.create({ to: `+91${mobilNo}`, channel: "sms" }) // Remove the space between +91 and mobilNo
          .then(() => {
            req.session.userLoggedIn = true;
            res.render("user/verifyOtp");
          });
      }
    } catch (error) {
      res.status(500);
    }
  },
  getOtpVerify: (req, res) => {
    try {
      res.render("user/verifyOtp");
    } catch (error) {
      res.status(500);
    }
  },
  postOtpVerify: async (req, res) => {
    try {
      let otpNumber = req.body.otp;
      let mobilNo = req.session.mobilNo; // Get the mobilNo value from the session
      await client.verify.v2
        .services(serviceId)
        .verificationChecks.create({ to: `+91${mobilNo}`, code: otpNumber }) // Remove the space between +91 and mobilNo
        .then(async(verificationChecks) => {
          console.log(verificationChecks.valid);
          if (verificationChecks.valid) {
            let responseUser = await userHelpers.otpUserVerify(mobilNo)
            console.log(responseUser);
            // req.session.userLoggedIn = true;
            // user = responseUser;
            res.redirect("/");
          } else {
            res.render("user/verifyOtp", { invalidOtp: true });
          }
        });
    } catch (error) {
      res.status(500);
    }
  },
  getProfile: async (req, res) => {
    try {
      let user = req.session.user;
      let count = await cartHelpers.getCount(req.session.user.id);
      let data = await userHelpers.getUsers(req.session.user.id);
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);

      // console.log(data,'=');
      res.render("user/user-profile", { user, count, data, wishListCount });
    } catch (error) {
      res.status(500);
    }
  },
  postProfile: (req, res) => {
    try {
      // create a nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.user,
          pass: process.env.pass,
        },
      });
      console.log(transporter, "tr");
      const recipient = req.body.email;
      console.log(recipient, "kk");

      const mailOptions = {
        from: "mohammedriyazriyaz04@gmail.com",
        to: recipient,
        subject: "Welcome to My App",
        text: "http://localhost:3001/profile",
      };

      // send email verification
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err, "hi");
        } else {
          console.log("Email sent: ");
          userHelpers
            .postProfile(req.session.user.id, req?.body)
            .then((response) => {
              req.session.user.userName = req.body.fname;
              res.json(response);
            });
        }
      });
    } catch (error) {
      res.status(500);
    }
  },
  resetPassword: async (req, res) => {
    try {
      let user = req.session.user;
      let count = await cartHelpers.getCount(req.session.user.id);
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);

      res.render("user/reset-password", { user, count, wishListCount });
    } catch (error) {
      res.status(500);
    }
  },
  addNewAddress: async (req, res) => {
    try {
      let user = req.session.user;
      let count = await cartHelpers.getCount(req.session.user.id);
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);

      res.render("user/add-new-address", { user, count, wishListCount });
    } catch (error) {
      res.status(500);
    }
  },
  postAddress: (req, res) => {
    try {
      userHelpers
        .postAddress(req.body, req.session.user.id)
        .then((response) => {
          res.json(response);
        });
    } catch (error) {
      res.status(500);
    }
  },
  viewAddress: async (req, res) => {
    try {
      let user = req.session.user;
      let count = await cartHelpers.getCount(req.session.user.id);
      userHelpers.viewAddress(req.session.user.id).then(async (result) => {
        // console.log(result,'----');
        let wishListCount = await userHelpers.wishListLength(
          req.session.user.id
        );
        // console.log(result,'lllllllllllllllllllllllll');

        res.render("user/view-address", { user, result, count, wishListCount });
      });
    } catch (error) {
      res.status(500);
    }
  },
  deleteNewAddress: (req, res) => {
    try {
      userHelpers.deleteNewAddress(req.body.deleteId).then((response) => {
        res.json({ status: true });
      });
    } catch (error) {
      res.status(500);
    }
  },
  postResetPassword: (req, res) => {
    try {
      // console.log(req.body.password2);
      userHelpers
        .postResetPassword(req.body, req.session.user.id)
        .then((response) => {
          res.json(response);
        });
    } catch (error) {
      res.status(500);
    }
  },
  getSort: async (req, res) => {
    try {
      let user = req.session.user;
      let category = await productHelpers.getCategory();
      let count = await cartHelpers.getCount(req.session.user.id);
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);

      res.render("user/sort", { user, count, category, wishListCount });
    } catch (error) {
      res.status(500);
    }
  },
  editAddress: async (req, res) => {
    try {
      let user = req.session.user;
      let count = await cartHelpers.getCount(req.session.user.id);
      userHelpers.editAddress(req.params.id).then(async (data) => {
        let newAddress = data[0];
        let wishListCount = await userHelpers.wishListLength(
          req.session.user.id
        );
        // console.log(newAddress,'===');
        res.render("user/edit-address", {
          newAddress,
          user,
          count,
          wishListCount,
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  postEditAddress: (req, res) => {
    try {
      userHelpers.postEditAddress(req.params.id, req.body).then(() => {
        res.redirect("/view-address");
      });
    } catch (error) {
      res.status(500);
    }
  },
  getWallet:async(req,res)=>{
    try {
      let user = req.session.user
      let count = await cartHelpers.getCount(req.session.user.id);
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);
      let walletAmount = await userHelpers.getWalletAmount(req.session.user.id)
      console.log(walletAmount,'wa;let');
      res.render('user/wallet',{user,count,wishListCount,walletAmount})
      
    } catch (error) {
      console.log(error);
      res.status(500);
    }
  }
};
