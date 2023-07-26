const { SlashCommandBuilder } = require("discord.js");
const signale = require("signale");

const { Seller } = require("../../database/models");
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

				await Seller.updateUsersTracking(sellerID, interaction.user.id);
			} else {
				// Create the user if it doesn't exist
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
