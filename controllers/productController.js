const mongoose = require("mongoose");
const productHelpers = require("../helpers/productHelpers");
const session = require("express-session");
const cartController = require("./cartController");
const cartHelpers = require("../helpers/cartHelpers");
const userHelpers = require("../helpers/userHelper");

module.exports = {
  getAddProduct: async (req, res) => {
    try {
      if (req.session.adminLogIn) {
        await productHelpers.getCategory().then((data) => {
          let admins = req.session.admin;
          res.render("admin/add-product", {
            layout: "adminLayout",
            admins,
            data,
          });
        });
      } else {
        res.redirect("/admin/adminLogin");
      }
    } catch (error) {
      res.status(500);
    }
  },
  postAddProduct: (req, res) => {
    try {
      let Image = req.files.map((files) => files.filename);
      // console.log(Image);
      productHelpers.postAddProduct(req.body, Image).then(() => {
        res.redirect("/admin/view-products");
      });
    } catch (error) {
      res.status(500);
    }
  },

  getCategory: async (req, res) => {
    try {
      if (req.session.adminLogIn) {
        let admins = req.session.admin;
        await productHelpers.getCategory().then((data) => {
          //  console.log(data.status,'===status');
          res.render("admin/add-category", {
            layout: "adminLayout",
            admins,
            data,
          });
        });
      } else {
        res.redirect("/admin/adminLogin");
      }
    } catch (error) {
      res.status(500);
    }
  },
  postCategory: (req, res) => {
    try {
      productHelpers.postCategory(req.body).then(async (status) => {
        let admins = req.session.admin;
        let data = await productHelpers.getCategory();
        if (status.status) {
          res.render("admin/add-category", {
            layout: "adminLayout",
            status,
            data,
            admins,
          });
        } else {
          res.redirect("/admin/add-category");
        }
      });
    } catch (error) {
      res.status(500);
    }
  },
  getSubCategory: async (req, res) => {
    try {
      if (req.session.adminLogIn) {
        let admins = req.session.admin;
        await productHelpers.getSubCategory().then((data) => {
          res.render("admin/add-subcategory", {
            layout: "adminLayout",
            admins,
            data,
          });
        });
      } else {
        res.redirect("/admin/adminLogin");
      }
    } catch (error) {
      res.status(500);
    }
  },
  postSubCategory: async (req, res) => {
    try {
      await productHelpers.postSubCategory(req.body).then(async (status) => {
        if (status.status) {
          let data = await productHelpers.getSubCategory();
          let admins = req.session.admin;
          res.render("admin/add-subcategory", {
            layout: "adminLayout",
            data,
            admins,
            status,
          });
        } else {
          res.redirect("/admin/add-sub");
        }
      });
    } catch (error) {
      res.status(500);
    }
  },
  getViewProduct: async (req, res) => {
    try {
      await productHelpers.getProducts().then((data) => {
        let admins = req.session.admin;
        res.render("admin/view-products", {
          layout: "adminLayout",
          admins,
          data,
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  getEditProduct: (req, res) => {
    try {
      let admins = req.session.admin;
      productHelpers.getEditProduct(req.params.id).then((data) => {
        // console.log(data.Description,'******');
        res.render("admin/edit-product", {
          layout: "adminLayout",
          admins,
          data,
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  postEditProduct: async (req, res) => {
    try {
      await productHelpers
        .postEditProduct(req.params.id, req?.file?.filename, req.body)
        .then((data) => {
          res.redirect("/admin/view-products");
        });
    } catch (error) {
      res.status(500);
    }
  },
  getEditCategory: async (req, res) => {
    try {
      let admins = req.session.admin;
      await productHelpers.getEditCategory(req.params.id).then((data) => {
        res.render("admin/edit-category", {
          layout: "adminLayout",
          data,
          admins,
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  postEditCategory: async (req, res) => {
    try {
      await productHelpers
        .postEditCategory(req.params.id, req.body)
        .then(() => {
          res.redirect("/admin/add-category");
        });
    } catch (error) {
      res.status(500);
    }
  },
  getEditSub: async (req, res) => {
    try {
      let admins = req.session.admin;
      await productHelpers.getEditSub(req.params.id, req.body).then((data) => {
        res.render("admin/edit-subcategory", {
          layout: "adminLayout",
          data,
          admins,
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  postEditSub: async (req, res) => {
    try {
      await productHelpers.postEditSub(req.params.id, req.body).then(() => {
        res.redirect("/admin/add-sub");
      });
    } catch (error) {
      res.status(500);
    }
  },
  deleteProduct: async (req, res) => {
    try {
      await productHelpers.deleteProduct(req.params.id).then(() => {
        res.redirect("/admin/view-products");
      });
    } catch (error) {
      res.status(500);
    }
  },
  deleteCategory: async (req, res) => {
    try {
      await productHelpers.deleteCategory(req.params.id).then(() => {
        res.redirect("/admin/add-category");
      });
    } catch (error) {
      res.status(500);
    }
  },
  deleteSub: async (req, res) => {
    try {
      await productHelpers.deleteSub(req.params.id).then(() => {
        res.redirect("/admin/add-sub");
      });
    } catch (error) {
      res.status(500);
    }
  },
  fullImage: async (req, res) => {
    try {
      let count = await cartHelpers.getCount(req.session.user.id);
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);
      await productHelpers.getFull(req.params.id).then((datas) => {
        // console.log(datas,'====');
        let data = datas[0];
        let user = req.session.user;
        res.render("user/viewFull", { data, user, count, wishListCount });
      });
    } catch (error) {
      res.status(500);
    }
  },
  singleView: async (req, res) => {
    try {
      let data = await productHelpers.getFull(req.params.id);
      // console.log(data,'data');
      let admins = req.session.admin;
      res.render("admin/viewFull", { layout: "adminLayout", admins, data });
    } catch (error) {
      res.status(500);
    }
  },
  getCategoryProducts: async (req, res) => {
    try {
      let user = req.session.user;
      let category = await productHelpers.getCategory();
      let count = await cartHelpers.getCount(req.session.user.id);

      productHelpers.getCategoryProducts(req.params.id).then(async (data) => {
        let wishListCount = await userHelpers.wishListLength(
          req.session.user.id
        );

        res.render("user/filterProducts", {
          user,
          data,
          category,
          count,
          wishListCount,
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
  sortProducts: async (req, res) => {
    try {
      let user = req.session.user;
      let count = await cartHelpers.getCount(req.session.user.id);
      // console.log(req.body.selectedValue, "//");
      let category = await productHelpers.getCategory();
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);
      productHelpers.sortProducts(req.body.selectedValue).then((data) => {
        res.render("user/sort", { user, data, category, count, wishListCount,'search':true });
      });
    } catch (error) {
      res.status(500);
    }
  },
  search: async (req, res) => {
    try {
      let user = req.session.user;
      let category = await productHelpers.getCategory();
      let count = await cartHelpers.getCount(req.session.user.id);
      let wishListCount = await userHelpers.wishListLength(req.session.user.id);
      productHelpers.search(req.body.search).then((data) => {
        res.render("user/search", {
          data,
          user,
          category,
          wishListCount,
          count, 
        });
      });
    } catch (error) {
      res.status(500);
    }
  },
};
