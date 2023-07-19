const { SlashCommandBuilder } = require('discord.js');
const scrape = require("../../../scrape.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scrape')
		.setDescription('scrapes!'),
	async execute(interaction) {
		const sellerID = "A2QHNIQ1AC1T10";
		const sellerAsins = await scrape(sellerID);
		console.log(sellerAsins);
		return interaction.reply("Done");
		// return interaction.reply(`Seller ASINs: ${sellerAsins.join(", ")}`);
	},
};