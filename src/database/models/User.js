const db = require("../index.js");
const { Model, DataTypes } = require("sequelize");
const signale = require("signale");

class User extends Model {
	static associate() { }

	async findUser(discordUserID) {
		try {
			const user = await User.findOne({ where: { discordUserID: discordUserID } });

			return user;
		} catch (error) {
			signale.error("Couldn't Find User: ", error);
			return false;
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
			const user = await findUser(discordUserID);

			signale.complete("User Removed: ", user);
		} catch (error) {
			signale.error("User Remove Error: ", error)
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