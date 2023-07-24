const { SlashCommandBuilder } = require("discord.js");
const signale = require("signale");

const { User } = require("../../database/models");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetwebhook")
    .setDescription("Reset the stored Discord Webhook."),

  async execute(interaction) {
    try {
      const discordUserID = interaction.user.id;

      // Reset the user's stored webhook and handle the result
      const webhookReset = await User.setUserWebhook(discordUserID, null);

      if (webhookReset) {
        return interaction.reply("Webhook reset successfully.");
      } else {
        // user not found
        return interaction.reply("Failed to reset webhook. Please check logs.");
      }
    } catch (error) {
      signale.error("resetWebhook Command Error: ", error);
      return interaction.reply(
        "An error has occurred while executing this command. Please check logs."
      );
    }
  },
};