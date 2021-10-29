require('dotenv').config();
const { Client, Collection } = require('discord.js');

const config = require('./config.json');
const client = new Client();
const {
  loadCommands,
  exitBot,
  loadCacheFromDisk,
  hasAdminPrivileges,
} = require('./helpers');

// Create two Collections where we can store our commands and aliases in.
// Store these collections on the client object so we can access them inside commands etc.
client.commands = new Collection();
client.aliases = new Collection();

var botClient;

// Load commands from the './commands' folder
loadCommands('commands', client);
loadCacheFromDisk();

client
  .on('ready', () => {
    console.log('Bot is ready...');
    client.user.setStatus('online');
    botClient = client;
  })
  // Client message event, contains the logic for the command handler.
  .on('message', (message) => {
    // Make sure the message contains the command prefix from the config.json.
    if (!message.content.startsWith(config.prefix)) return;
    // Make sure the message author isn't a bot
    if (message.author.bot) return;
    // Make sure the channel the command is called in is a text channel.
    if (message.channel.type !== 'text') return;

    // Split the message content and store the command called, and the args.
    const messageSplit = message.content.split(/\s+/g);
    const cmd = messageSplit[0].slice(config.prefix.length);
    const args = messageSplit.slice(1);

    try {
      // Check if the command called exists in either the commands Collection
      // or the aliases Collection.
      let command;
      if (client.commands.has(cmd)) {
        command = client.commands.get(cmd);
      } else if (client.aliases.has(cmd)) {
        command = client.commands.get(client.aliases.get(cmd));
      }

      // Make sure command is defined.
      if (!command) return;
      // Make sure user has appropriate privileges
      if (command.adminOnly && !hasAdminPrivileges(message.author.id)) return;
      // If the command exists then run the execute function inside the command file.
      command.execute(client, message, args);
    } catch (err) {
      console.error(err);
    }
  });

process.on('SIGINT', function () {
  exitBot(client);
});

client.login(process.env.BOT_TOKEN);

module.exports = {
  loadCommands: loadCommands,
};
