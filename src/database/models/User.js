const db = require("../index.js");
const { Model, DataTypes } = require("sequelize");
const signale = require("signale");

class User extends Model {
	static associate() { }

	async findUser(discordUserID) {
		try {
			const user = await User.findOne({ where: { discordUserID: discordUserID } });

			if (user) {
				return user;
			} else {
				throw new Error("Couldn't Find User");
			}
		} catch (error) {
			signale.error("Couldn't Complete Find Request: ", error);
		}
	}

	async createUser(discordUserID) {
		try {
			const user = await User.create({ discordUserID: discordUserID });

			signale.success("User Created: ", user.discordUserID);
		} catch (error) {
			signale.error("User DB Creation Error: ", error);
		}
	}

	async removeUser(discordUserID) {
		try {
			const user = await this.findUser(discordUserID);
			await user.destroy();
			signale.complete("User Removed: ", user);
		} catch (error) {
			signale.error("User Remove Error: ", error)
		}
	}

	async setUserWebhook(discordUserID, discordWebhook) {
		try {
			const user = await this.findUser(discordUserID);
			user.discordWebhook = discordWebhook;
			await user.save();
		} catch (error) {
			signale.error("Couldn't Set User Webhook. Ensure that user exists.");
		}
	}
}

User.init(
	{
		discordUserID: {
			type: DataTypes.BIGINT,
			unique: true,
			allowNull: false,
			primaryKey: true
		},
		discordWebhook: {
			type: DataTypes.STRING,
			unique: true,
		}
	},
	{ paranoid: true, sequelize: db, modelName: "User" }
);
signale.success("User Model Initalized");

module.exports = User;