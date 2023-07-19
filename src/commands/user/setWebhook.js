const { SlashCommandBuilder } = require("discord.js");
const signale = require("signale");

const { User } = require("../../database/models/exportmodels");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setwebhook")
        .setDescription("Set Webhook to Receive Notifications to.")
        .addStringOption((option) =>
            option
                .setName("webhook")
                .setDescription("Discord Webhook. In order to create a webhook, refer to Discord guides.")
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const discordUserID = interaction.user.id;
            const discordWebhook = await interaction.options.getString("webhook");

            const userInstance = new User();

            //TODO: Add Discord Webhook Link Validation on this
            await userInstance.setUserWebhook(discordUserID, discordWebhook);

            // user.setUserWebhook(discordWebhook);
            // if (await userInstance.findUser(discordUserID) === null) {
            //     userInstance.createUser(discordUserID);

            //     return interaction.reply("Added User!");
            // } else {
            //     return interaction.reply("Error Occurred. Check Logs.");
            // }

            return interaction.reply("Set Webhook");
        } catch (error) {
            signale.error("setWebhook Command Error: ", error);
            return interaction.reply("An error has occurred while executing this command. Please check logs.");
        }
    }
}