const { hasAdminPrivileges } = require('../../helpers.js');
const token = require('../../config.json').token;
const { loadCommands } = require('../../helpers.js');

module.exports = {
  name: 'reload', // Command name (what's gonna be used to call the command)
  aliases: ['reloadbot', 'restart', 'restartbot'], // Command aliases
  adminOnly: true,

  execute(client, message) {
    if (!hasAdminPrivileges(message.author.id)) return;

    client.destroy();
    loadCommands('commands', client);
    client.login(token);
  },
};
