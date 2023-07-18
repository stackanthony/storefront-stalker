const { SlashCommandBuilder } = require('discord.js');
const scrape = require("../../../scrape.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scrape')
		.setDescription('scrapes!'),
	async execute(interaction) {
		const sellerID = "ASBIGH1CERS24";
		const sellerAsins = await scrape(sellerID);
		return interaction.reply(`Seller ASINs: ${sellerAsins.join(", ")}`);
	},
};