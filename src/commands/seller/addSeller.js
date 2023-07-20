const { SlashCommandBuilder } = require("discord.js");
const signale = require("signale");

const { Seller } = require("../../database/models");
const sellerInstance = new Seller();

signale.note("Change command to query if user is monitoring seller. Currently, checks the whole seller table.");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addseller")
        .setDescription("Add Stalker to Seller")
        .addStringOption((option) =>
            option
                .setName("sellerid")
                .setDescription("Amazon Seller ID")
                .setRequired(true)
        ),

    async execute(interaction) {
        try {

            await interaction.deferReply();

            const sellerID = await interaction.options.getString("sellerid");
            // Check if the user exists
            const sellerExists = await sellerInstance.findSeller(sellerID);

            if (sellerExists) {
                return interaction.editReply("Seller already exists.");
            } else {
                // Create the user if it doesn't exist
                await sellerInstance.createSeller(sellerID);
                return interaction.editReply("Seller added to the database!");
            }
        } catch (error) {
            signale.error("createSeller Command Error: ", error);
            return interaction.reply(
                "An error has occurred while executing this command. Please check logs."
            );
        }
    },
};
