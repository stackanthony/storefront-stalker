const db = require("../index.js");
const { Model, DataTypes } = require("sequelize");
const signale = require("signale");
const scraper = require("../../classes/AmazonScraper.js");

class Seller extends Model {
	static associate() { }

	static async findSeller(sellerID) {
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
			throw error;
		}
	}

	static async getAllSellerIDs() {
		try {
			const sellers = await Seller.findAll({
				attributes: ["sellerID"],
			});
			if (sellers) {
				return sellers;
			} else {
				return false;
			}
		} catch (error) {
			signale.error("Error in getAllSellers: ", error);
			throw error;
		}
	}

	static async getASINSFromSellerID(sellerID) {
		try {
			const sellerASINS = await Seller.findOne({
				attributes: ["sellerASINS"],
				where: { sellerID: sellerID },
			});

			if (sellerASINS) {
				return sellerASINS.dataValues.sellerASINS;
			} else {
				return false;
			}
		} catch (error) {
			signale.error("Error in getASINSFromSellerID: ", error);
			throw error;
		}
	}

	static async createSeller(sellerID, userID) {
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

	static async updateUsersTracking(sellerID, userID) {
		try {
			const seller = await Seller.findByPk(sellerID);

			if (seller) {
				let newArray = Object.assign([], seller.usersTracking);
				newArray.push(userID.toString());

				// Update the usersTracking array in the database
				await seller.update({ usersTracking: newArray });

				signale.success("Seller Updated:", sellerID);
				return true;
			} else {
				signale.error("Seller Not Found, No Action Taken.");
				return false;
			}
		} catch (error) {
			signale.error("Seller Update Error:", error);
			throw error;
		}
	}

	//update seller ASINS array by appending single ASIN (parameter)
	static async updateSellerASINS(sellerID, ASIN) {
		try {
			const seller = await Seller.findByPk(sellerID);

			if (seller) {
				let newArray = Object.assign([], seller.sellerASINS);
				newArray.push(ASIN.toString());

				let newAsinCount = seller.asinCount + 1;

				// Update the usersTracking array in the database, and incremement the asinCount variable
				await seller.update({ sellerASINS: newArray, asinCount: newAsinCount });

				signale.success("Updated SellerASINS with new value:", ASIN);
				return true;
			} else {
				signale.error("Seller Not Found, No Action Taken.");
				return false;
			}
		} catch (error) {
			signale.error("Seller Update Error:", error);
			throw error;
		}
	}

	static async deleteASIN(sellerID, ASIN) {
		try {
			// First, fetch the seller record from the database
			const seller = await Seller.findByPk(sellerID);

			if (!seller) {
				throw new Error("Seller not found.");
			}

			// Remove the ASIN from the sellerASINS array if it exists
			const updatedSellerASINS = seller.sellerASINS.filter((existingASIN) => existingASIN !== ASIN);
			const newASINcount = seller.asinCount - 1;
			// Update the sellerASINS array in the database
			await seller.update({ sellerASINS: updatedSellerASINS, asinCount: newASINcount });

			signale.success(`Successfully deleted ASIN ${ASIN} from seller ${sellerID}.`);
		} catch (error) {
			signale.error("Error deleting ASIN from seller: ", error);
		}
	}

	static async removeSeller(sellerID) {
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
			throw error;
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
	{ sequelize: db, modelName: "Seller" }
);

signale.success("Seller Model Initalized");

module.exports = Seller;
