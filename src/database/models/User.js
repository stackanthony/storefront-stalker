// Import necessary modules and dependencies
const db = require("../index.js");
const { Model, DataTypes } = require("sequelize");
const signale = require("signale");

// Define the User model using Sequelize
class User extends Model {
	static associate() { }

	/**
	 * Find a user by their discordUserID.
	 *
	 * @param {string} discordUserID - The Discord user ID.
	 * @returns {User|boolean} The user if found, otherwise false.
	 */
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

	/**
	 * Create a new user.
	 *
	 * @param {string} discordUserID - The Discord user ID.
	 * @returns {boolean} True if user creation is successful, otherwise false.
	 */
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

	/**
	 * Remove a user.
	 *
	 * @param {string} discordUserID - The Discord user ID.
	 * @returns {boolean} True if user removal is successful, otherwise false.
	 */
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

	/**
	 * Set a user's webhook.
	 *
	 * @param {string} discordUserID - The Discord user ID.
	 * @param {string} discordWebhook - The webhook URL.
	 * @returns {boolean} True if webhook setting is successful, otherwise false.
	 */
	static async setUserWebhook(discordUserID, discordWebhook) {
		try {
			const user = await this.findUser(discordUserID);
			if (user) {
				user.discordWebhook = discordWebhook;
				await user.save();
				return true; // Return true to indicate success
			} else {
				signale.warn("User Not Found, Webhook Not Set.");
				return false; // Return false when user is not found
			}
		} catch (error) {
			signale.error("Couldn't Set User Webhook: ", error);
			return false; // Return false in case of an error
		}
	}

	/**
	 * Check if a user's webhook exists.
	 *
	 * @param {string} discordUserID - The Discord user ID.
	 * @returns {boolean} True if user's webhook exists, otherwise false.
	 */
	static async checkUserWebhook(discordUserID) {
		try {
			const user = await this.findUser(discordUserID);
			if (user) {
				if (user.discordWebhook) {
					return true;
				}
			} else {
				return false;
			}
		} catch (error) {
			signale.error("Couldn't Check User Webhook: ", error);
			return false;
		}
	}
}

// Initialize the User model
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

// Log success message indicating User model initialization
signale.success("User Model Initialized");

// Export the User model
module.exports = User;
