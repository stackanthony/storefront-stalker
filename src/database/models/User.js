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
	 * @returns {Promise<User>} The user if found, otherwise false.
	 */
	static async findUser(discordUserID) {
		try {
			const user = await User.findOne({
				where: { discordUserID },
			});
			return user;
		} catch (error) {
			signale.error("Error in findUser: ", error);
			throw error;
		}
	}

	/**
	 * Create a new user.
	 *
	 * @param {string} discordUserID - The Discord user ID.
	 * @returns {Promise<void>} 
	 */
	static async createUser(discordUserID) {
		try {
			await User.create({ discordUserID });

			signale.success("User Created: ", discordUserID);
		} catch (error) {
			signale.error("User DB Creation Error: ", error);
			throw error;
		}
	}

	/**
	 * Remove a user.
	 *
	 * @param {string} discordUserID - The Discord user ID.
	 * @returns {Promise<Boolean>} True if user removal is successful, otherwise false.
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
			throw error;
		}
	}

	/**
	 * Set a user's webhook.
	 *
	 * @param {string} discordUserID - The Discord user ID.
	 * @param {string} discordWebhook - The webhook URL.
	 * @returns {Promise<Boolean>} True if webhook setting is successful, otherwise false.
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
			throw error;
		}
	}

	/**
	 * Check if a user's webhook exists.
	 *
	 * @param {string} discordUserID - The Discord user ID.
	 * @returns {Promise<Boolean>} True if user's webhook exists, otherwise false.
	 */
	static async checkUserWebhook(discordUserID) {
		try {
			const user = await this.findUser(discordUserID);

			return user.discordWebhook;
		} catch (error) {
			signale.error("Couldn't Check User Webhook: ", error);
			throw error;
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
