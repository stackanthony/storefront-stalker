const { SlashCommandBuilder } = require("discord.js");
const signale = require("signale");

const { Seller, User } = require("../../database/models");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("removeseller")
		.setDescription("Remove Seller from Tracking")
		.addStringOption((option) =>
			option
				.setName("sellerid")
				.setDescription("Amazon Seller ID")
				.setRequired(true)
		),

	async execute(interaction) {
		try {
			await interaction.deferReply();

			if(!(await User.checkUserWebhook(interaction.user.id))) {
				return interaction.editReply("You don't have a webhook set. Please set a webhook first.");
			}

			const sellerID = await interaction.options.getString("sellerid");

			// Check if the seller exists in DB
			const seller = await Seller.findSeller(sellerID);

			if (!seller) {
				return interaction.editReply("Seller ID not found in the tracking list.");
			}

			// Check if the user ID exists in the usersTracking array
			const userIndex = seller.usersTracking.indexOf(interaction.user.id);
			if (userIndex !== -1) {
				// Remove the user from usersTracking
				seller.usersTracking.splice(userIndex, 1);

				// Check if there are no other users tracking the seller
				if (seller.usersTracking.length === 0) {
					// If no other users are tracking, remove the seller from the database
					await Seller.removeSeller(sellerID);
				} else {
					// If there are other users still tracking, update the seller in the database
					await Seller.updateUsersTracking(sellerID, seller.usersTracking);
				}

				return interaction.editReply("Seller has been removed from tracking.");
			} else {
				return interaction.editReply("You were not tracking this seller.");
			}
		} catch (error) {
			signale.error("removeSeller Command Error: ", error);
			return interaction.reply(
				"An error has occurred while executing this command. Please check logs."
			);
		}
	},
};