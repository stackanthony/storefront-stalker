const db = require("../index.js");
const { Model, DataTypes } = require("sequelize");
const signale = require("signale");

class User extends Model {
	static associate() {}
}

try {
	User.init(
		{
			discordUserID: {
				type: DataTypes.STRING,
				unique: true,
			},
		},
		{ paranoid: true, sequelize: db, modelName: "User" }
	);

	signale.success("User Model Initalized");
} catch (error) {
	signale.error("Couldn't Initialize User Model: ", error);
}
