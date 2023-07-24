const db = require("../index.js");
const { Model, DataTypes } = require("sequelize");
const signale = require("signale");

class User extends Model {
	static associate() { }

	static async findUser(discordUserID) {
		try {
			const user = await User.findOne({
				where: { discordUserID: discordUserID },
			});
			if (user) {
				return user; // Return true if user is found, false otherwise
			} else {
				return false;
			}
		} catch (error) {
			signale.error("Error in findUser: ", error);
		}
	}

	static async createUser(discordUserID) {
		try {
			await User.create({ discordUserID: discordUserID });

			signale.success("User Created: ", discordUserID);
			return true; // Return true to indicate success
		} catch (error) {
			signale.error("User DB Creation Error: ", error);
			return false; // Return false in case of an error
		}
	}

	static async removeUser(discordUserID) {
		try {
			const user = await this.findUser(discordUserID);
			if (user) {
				signale.complete("User Removed: ", user.discordUserID);
				await user.destroy();
				return true; // Return true to indicate success
			} else {
				signale.warn("User Not Found, No Action Taken.");
				return false; // Return false when user is not found
			}
		} catch (error) {
			signale.error("User Remove Error: ", error);
			return false; // Return false in case of an error
		}
	}

	static async setUserWebhook(discordUserID, discordWebhook) {
		try {
			const user = await this.findUser(discordUserID);
			console.log(user);
			if (user) {
				user.discordWebhook = discordWebhook;
				await user.save();
				return true; // Return true to indicate success
			} else {
				signale.warn("User Not Found, Webhook Not Set.");
				return false; // Return false when user is not found
			}
		} catch (error) {
			signale.error("Couldn't Set User Webhook: ", error)
			return false; // Return false in case of an error
		}
	}
}

User.init(
	{
		discordUserID: {
			type: DataTypes.BIGINT,
			unique: true,
			allowNull: false,
			primaryKey: true,
		},
		discordWebhook: {
			type: DataTypes.STRING,
			unique: false,
		},
	},
	{ paranoid: true, sequelize: db, modelName: "User" }
);
signale.success("User Model Initialized");

module.exports = User;
