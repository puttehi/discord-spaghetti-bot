const { hasAdminPrivileges } = require('../../helpers.js');
const { loadCommands } = require('../../helpers.js');

module.exports = {
  name: 'reloadcommands', // Command name (what's gonna be used to call the command)
  aliases: ['refreshcommands', 'reloadc', 'refreshc'], // Command aliases
  adminOnly: true,

  execute(client, message) {
    if (!hasAdminPrivileges(message.author.id)) return;

    loadCommands('commands', client);
  },
};
