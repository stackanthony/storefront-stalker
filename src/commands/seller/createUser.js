const { SlashCommandBuilder } = require("discord.js");
const signale = require("signale");

const { User } = require("../../database/models/exportmodels");

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

            if (userInstance.findUser(discordUserID) === false) {
                userInstance.createUser(discordUserID);

                return interaction.reply("Added User!");
            } else {
                return interaction.reply("Error Occurred. Check Logs.");
            }
        } catch (error) {
            signale.error("createUser Command Error: ", error);
            return interaction.reply("An error has occurred while executing this command. Please check logs.");
        }
    }
}