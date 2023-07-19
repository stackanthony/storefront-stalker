const db = require("../index.js");
const { Model, DataTypes } = require("sequelize");
const signale = require("signale");

class User extends Model {
	static associate() {}

	async findUser(discordUserID) {
		try {
			const user = await User.findOne({
				where: { discordUserID: discordUserID },
			});

			return !!user; // Return true if user is found, false otherwise
		} catch (error) {
			signale.error("Couldn't Complete Find Request: ", error);
			return false; // Return false in case of an error
		}
	}

	async createUser(discordUserID) {
		try {
			await User.create({ discordUserID: discordUserID });

			signale.success("User Created: ", discordUserID);
			return true; // Return true to indicate success
		} catch (error) {
			signale.error("User DB Creation Error: ", error);
			return false; // Return false in case of an error
		}
	}

	async removeUser(discordUserID) {
		try {
			const user = await this.findUser(discordUserID);
			if (user) {
				await user.destroy();
				signale.complete("User Removed: ", user);
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

	async setUserWebhook(discordUserID, discordWebhook) {
		try {
			const user = await this.findUser(discordUserID);
			console.log(user);
			if (user === true) {
				console.log("user found");
				console.log("discordWebhook before assignment:", discordWebhook);
				user.discordWebhook = discordWebhook.toString();
				console.log(user.discordWebhook)
				console.log("bef save");
				await user.save();
				console.log("after save");
				return true; // Return true to indicate success
			} else {
				signale.warn("User Not Found, Webhook Not Set.");
				return false; // Return false when user is not found
			}
		} catch (error) {
			signale.error("Couldn't Set User Webhook. Ensure that user exists.");
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
			unique: true,
		},
	},
	{ paranoid: true, sequelize: db, modelName: "User" }
);
signale.success("User Model Initialized");

module.exports = User;
