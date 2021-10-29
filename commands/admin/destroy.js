const { MessageEmbed } = require('discord.js');
const { hasAdminPrivileges, exitBot } = require('../../helpers.js');

module.exports = {
  name: 'destroy', // Command name (what's gonna be used to call the command)
  aliases: ['shutdown', 'killbot'], // Command aliases
  adminOnly: true,

  execute(client, message) {
    if (!hasAdminPrivileges(message.author.id)) return;
    
    const embed = new MessageEmbed()
      .setTitle('Bye :(')
      .setColor('red')
      .setDescription(
        'Someone wanted to kill me, so bye.' + '\n*Shutting down...*'
      );

    message.channel.send({ embed }).then((m) => {
      exitBot(client)
    });
  },
};
