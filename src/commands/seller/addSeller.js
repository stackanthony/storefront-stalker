const { SlashCommandBuilder } = require("discord.js");
const signale = require("signale");

const { Seller, User } = require("../../database/models");
const AmazonScraper = require("../../classes/AmazonScraper");

signale.note(
	"Change command to query if user is monitoring seller. Currently, checks the whole seller table."
);

module.exports = {
	data: new SlashCommandBuilder()
		.setName("addseller")
		.setDescription("Add Stalker to Seller")
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

			if (!(await AmazonScraper.checkValidSellerID(sellerID))) {
				return interaction.editReply("Seller ID doesn't exist. Make sure you have inputted the Seller ID correctly.");
			}
			// Check if the seller exists in DB
			const sellerExists = await Seller.findSeller(sellerID);

			if (sellerExists) {
				// Check if the user ID exists in the usersTracking array
				if (
					sellerExists.usersTracking &&
					sellerExists.usersTracking.includes(interaction.user.id)
				) {
					return interaction.editReply("You are already tracking this seller!");
				}

				await Seller.updateUsersTracking(sellerID, interaction.user.id); // update usersTracking array in Seller model DB
			} else {
				// Create the seller if it doesn't exist, and add user's ID to usersTracking array
				await Seller.createSeller(sellerID, interaction.user.id);
			}

			return interaction.editReply("Seller is now being tracked!");
		} catch (error) {
			signale.error("createSeller Command Error: ", error);
			return interaction.reply(
				"An error has occurred while executing this command. Please check logs."
			);
		}
	},
};
