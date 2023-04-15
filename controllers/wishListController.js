const session = require("express-session");
const { response } = require("../app");
const userHelpers = require("../helpers/userHelper");
const cartHelpers = require("../helpers/cartHelpers");

module.exports = {
  
  getWishList: (req, res) => {
  try {
      console.log(req.params.id, req.session.user.id);
      userHelpers
        .addToWishList(req.params.id, req.session.user.id)
        .then((response) => {
          res.json({ status: true });
        })
    } catch (error) {
      res.status(500);
    }
  },
  getListWishList: async (req, res) => {
    try {
      userHelpers
        .getListWishList(req.session.user.id)
        .then(async (wishlistItems) => {
          let user = req.session.user;
          let wishListCount = await userHelpers.wishListLength(
            req.session.user.id
          );
          let count = await cartHelpers.getCount(req.session.user.id);
          console.log('lllll');
          res.render("user/wishlist", {
            wishlistItems,
            user,
            count,
            wishListCount,
          });
        });
    } catch (error) {
      res.status(500);
    }
  },
  removeItem: (req, res) => {
    try {
      userHelpers.removeItem(req.body, req.session.user.id).then((response) => {
        res.json({ status: true });
      });
    } catch (error) {
      res.status(500);
    }
  },
};
