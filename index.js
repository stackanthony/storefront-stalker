const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const signale = require("signale");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, "src/commands");
const commandFolders = fs.readdirSync(foldersPath);

const db = require("./src/database");
const models = require("./src/database/models");
const AmazonMonitor = require("./src/classes/AmazonMonitor");
const AmazonScraper = require("./src/classes/AmazonScraper");
const monitor = new AmazonMonitor();



for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      signale.warn(
        `The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const syncModelsAndAssociations = async () => {
  Object.keys(models).forEach((model) => {
    models[model].associate(models);
  });

  // refer to https://sequelize.org/docs/v6/core-concepts/model-basics/ for sync options. Specificically force and alter.
  await db.sync({ alter: true });
};

syncModelsAndAssociations()
  .then(() => signale.success("DB Synced!"))
  .catch((error) => signale.error("Sync Error: ", error));

client.once(Events.ClientReady, () => {
  signale.success("Bot Ready!");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  } else if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      signale.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  }
});

client.login(token);

const test = async () => {
  while (true) {
    await monitor.monitor();
  }
  // signale.info(await models.Seller.getASINSFromSellerID("ASBIGH1CERS24"))
};

test();
