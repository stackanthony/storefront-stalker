const db = require("../index.js");
const { Model, DataTypes } = require("sequelize");
const signale = require("signale");

class User extends Model {
	static associate() { }
}

User.init(
	{
		discordUserID: {
			type: DataTypes.INTEGER,
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

const createUser = async ({ discordUserID }) => {
	try {
		const user = await User.create({ discordUserID: discordUserID });

		signale.success("User Created: ", user.discordUserID);
	} catch (error) {
		signale.error("User DB Creation Error: ", error);
	}
}

module.exports = User;