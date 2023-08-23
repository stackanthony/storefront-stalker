const { SlashCommandBuilder } = require("discord.js");
const signale = require("signale");

const { User } = require("../../database/models");

// Regular expression pattern for Discord webhook URL
const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("setwebhook")
		.setDescription("Set Webhook to Receive Notifications.")
		.addStringOption((option) =>
			option
				.setName("webhook")
				.setDescription(
					"Discord Webhook. In order to create a webhook, refer to Discord guides."
				)
				.setRequired(true)
		),

	async execute(interaction) {
		try {
			const discordUserID = interaction.user.id;
			const discordWebhook = await interaction.options.getString("webhook");

			// Validate the webhook URL using regex
			if (!webhookRegex.test(discordWebhook)) {
				return interaction.reply(
					"Invalid webhook URL. Please provide a valid Discord webhook URL."
				);
			}

			// Set the user's webhook and handle the result
			const user = await User.findUser(discordUserID);

			// if the user doesn't exist, create user in DB and set webhook
			if (!user) {
				await User.createUser(discordUserID);
				await User.setUserWebhook(discordUserID, discordWebhook);
			}

			return interaction.reply("Webhook set successfully.");
			// const webhookSet = await User.setUserWebhook(
			// 	discordUserID,
			// 	discordWebhook
			// );

			// if (webhookSet) {
			// 	return interaction.reply("Webhook set successfully.");
			// } else {
			// 	// user not found
			// 	return interaction.reply("Failed to set webhook. Please check logs.");
			// }
		} catch (error) {
			signale.error("setWebhook Command Error: ", error);
			return interaction.reply(
				"An error has occurred while executing this command. Please check logs."
			);
		}
	},
};
