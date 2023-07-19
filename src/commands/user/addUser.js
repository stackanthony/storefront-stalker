const { SlashCommandBuilder } = require("discord.js");
const signale = require("signale");

const { User } = require("../../database/models");

signale.note("Temporary Add Command, need to add users a different way whether based on server / key, etc")

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

            const userInstance = new User();

            const user = await userInstance.createUser(discordUserID);

            signale.info(user);
            // if (await userInstance.findUser(discordUserID) === null) {
            //     userInstance.createUser(discordUserID);

            //     return interaction.reply("Added User!");
            // } else {
            //     return interaction.reply("Error Occurred. Check Logs.");
            // }

            return interaction.reply("Test");
        } catch (error) {
            signale.error("createUser Command Error: ", error);
            return interaction.reply("An error has occurred while executing this command. Please check logs.");
        }
    }
}