const { hasAdminPrivileges } = require('../../helpers.js');

module.exports = {
  name: 'nukechannel', // Command name (what's gonna be used to call the command)
  aliases: ['nukech'], // Command aliases
  adminOnly: true,

  execute(client, message) {
    if (!hasAdminPrivileges(message.author.id)) return;

    message.channel.messages.fetch({ limit: 100 }).then((messages) => {
      message.channel
        .bulkDelete(messages)
        .then((deletedMessages) =>
          console.log(
            `Deleted ${deletedMessages.size} messages from channel ${message.channel.name}`
          )
        );
    });
  },
};
