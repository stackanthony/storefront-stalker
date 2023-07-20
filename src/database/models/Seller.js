const db = require("../index.js");
const { Model, DataTypes } = require("sequelize");
const signale = require("signale");
const AmazonScraper = require("../../classes/AmazonScraper.js");
const scraper = new AmazonScraper();

class Seller extends Model {
  static associate() {}

  async findSeller(sellerID) {
    try {
      const seller = await Seller.findOne({
        where: { sellerID: sellerID },
      });
      if (seller) {
        return seller;
      } else {
        return false;
      }
    } catch (error) {
      signale.error("Error in findSeller: ", error);
    }
  }

  async createSeller(sellerID, userID) {
    try {
      const asins = await scraper.getSellerASINS(sellerID);
      await Seller.create({
        sellerID: sellerID,
        asinCount: asins.length,
        sellerASINS: asins,
        usersTracking: [userID],
      });
      // usersTracking.push(userID);
      signale.success("Seller Created: ", sellerID);
    } catch (error) {
      signale.error("Seller DB Creation Error: ", error);
      throw error;
    }
  }

  async updateUsersTracking(sellerID, userID) {
    try {
      const seller = await this.findSeller(sellerID);
      if (seller) {
        console.log("1" + seller.usersTracking)
        console.log(typeof seller.usersTracking)
        seller.usersTracking.push(userID.toString());
        console.log("2" + seller.usersTracking)
        await seller.save();
        console.log("3" + seller.usersTracking)
        signale.success("Seller Updated: ", sellerID);
        return true;
      } else {
        signale.warn("Seller Not Found, No Action Taken.");
        return false;
      }
    } catch (error) {
      signale.error("Seller Update Error: ", error);
      return false;
    }
  }

  async removeSeller(sellerID) {
    try {
      const seller = await this.findSeller(sellerID);
      if (seller) {
        signale.complete("Seller Removed: ", seller.sellerID);
        await seller.destroy();
        return true;
      } else {
        signale.warn("Seller Not Found, No Action Taken.");
        return false;
      }
    } catch (error) {
      signale.error("Seller Remove Error: ", error);
      return false;
    }
  }
}

Seller.init(
  {
    sellerID: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true,
    },
    asinCount: {
      type: DataTypes.INTEGER,
    },
    sellerASINS: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    usersTracking: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      // allowNull: false,
    },
  },
  { paranoid: true, sequelize: db, modelName: "Seller" }
);

signale.success("Seller Model Initalized");

module.exports = Seller;
