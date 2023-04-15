const { response } = require("../app");
const db = require("../models/connection");

module.exports = {
  postBanner: (bodyData, file) => {
    try {
      return new Promise(async (resolve, reject) => {
        let bannerData = new db.banner({
          Title: bodyData.title,
          Description: bodyData.description,
          Link: bodyData.link,
          Image: file,
        });
        await bannerData.save().then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  listBanner: () => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.banner.find().then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  deleteBanner: (bannerId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.banner.deleteOne({ _id: bannerId }).then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  getEditBanner: (bannerId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.banner.findOne({ _id: bannerId }).then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  postEditBanner: (bannerId, bodyData, file) => {
    // console.log(bannerId);
    try {
      return new Promise(async (resolve, reject) => {
        let banners = await db.banner.findOne({ _id: bannerId });
        // console.log(banners);
        await db.banner
          .updateOne(
            { _id: bannerId },
            {
              $set: {
                Title: bodyData.title,
                Description: bodyData.description,
                Link: bodyData.link,
                Image: file,
              },
            }
          )
          .then((response) => {
            console.log(response);
            resolve();
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
};
