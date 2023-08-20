const { SlashCommandBuilder } = require("discord.js");
const signale = require("signale");

const { User } = require("../../database/models");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("adduser")
		.setDescription("Add User to Database (Temp Command)")
		.addStringOption((option) =>
			option
				.setName("userid")
				.setDescription("discord user id")
				.setRequired(true)
		),

	async execute(interaction) {
		try {
			const discordUserID = await interaction.options.getString("userid");
			// Check if the user exists
			const userExists = await User.findUser(discordUserID);

			if (userExists) {
				return interaction.reply("User already exists.");
			} else {
				// Create the user if it doesn't exist
				await User.createUser(discordUserID);
				return interaction.reply("User added to the database!");
			}
		} catch (error) {
			signale.error("createUser Command Error: ", error);
			return interaction.reply(
				"An error has occurred while executing this command. Please check logs."
			);
		}
	},
};
