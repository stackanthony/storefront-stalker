const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const signale = require("signale");
const fetch = require("node-fetch");

const { User } = require("../../database/models");
const userInstance = new User();

// Regular expression pattern for Discord webhook URL
const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("testwebhook")
		.setDescription("Test the stored Discord Webhook."),

	async execute(interaction) {
		try {
			const discordUserID = interaction.user.id;

			// Check if the user has a stored webhook
			const user = await userInstance.findUser(discordUserID);
			const discordWebhook = user?.discordWebhook || null;

			if (!discordWebhook) {
				return interaction.reply(
					"No webhook set for this user. Please use `/setwebhook` to set a Discord webhook first."
				);
			}

			// Validate the webhook URL using regex
			if (!webhookRegex.test(discordWebhook)) {
				return interaction.reply(
					"Invalid stored webhook URL. Please provide a valid Discord webhook URL."
				);
			}

			// Send a test message to the stored webhook URL
			try {
				let embed = new EmbedBuilder()
					.setTitle("Webhook Test")
					.setDescription("Success! Your webhook is good to go.")
					.addFields(
						{
							name: "Webhook URL",
							value: discordWebhook,
							inline: false,
						},
						{
							name: "Tested By",
							value: interaction.user.tag,
							inline: false,
						}
					)
					.setColor("#00ff00")
					.setTimestamp();

				await fetch(discordWebhook, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						embeds: [embed],
					}),
				});

				return interaction.reply(
					"Webhook test successful. You should receive a test message in the configured channel."
				);
			} catch (error) {
				signale.error("Webhook Test Error: ", error);
				return interaction.reply(
					"Failed to send a test message to the webhook. Please check the URL and try again."
				);
			}
		} catch (error) {
			signale.error("testWebhook Command Error: ", error);
			return interaction.reply(
				"An error has occurred while executing this command. Please check logs."
			);
		}
	},
};
