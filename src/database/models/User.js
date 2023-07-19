const db = require("../index.js");
const { Model, DataTypes } = require("sequelize");
const signale = require("signale");

class User extends Model {
	static associate() { }
}

User.init(
	{
		discordUserID: {
			type: DataTypes.STRING,
			unique: true,
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