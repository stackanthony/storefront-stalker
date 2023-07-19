const { SlashCommandBuilder } = require("discord.js");
const scrape = require("../../../scrape.js");

module.exports = {
	data: new SlashCommandBuilder().setName("scrape").setDescription("scrapes!"),
	async execute(interaction) {
		const sellerID = "A2QHNIQ1AC1T10";

		// Defer the reply before making the request
		await interaction.deferReply();

		try {
			const sellerAsins = await scrape(sellerID);
			// console.log(sellerAsins);

			// Send the reply after the request is complete
			await interaction.editReply(
				sellerAsins ? sellerAsins.join(", ") : "No ASINs found"
			);
		} catch (error) {
			console.error("Error occurred:", error);
			await interaction.editReply("An error occurred while scraping.");
		}
	},
};
