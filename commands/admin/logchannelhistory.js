const { hasAdminPrivileges } = require('../../helpers.js');

module.exports = {
  name: 'logchannelhistory100', // Command name (what's gonna be used to call the command)
  aliases: ['logch100'], // Command aliases
  adminOnly: true,

  execute(client, message) {
    if (!hasAdminPrivileges(message.author.id)) return;
    
    message.channel.messages.fetch({ limit: 100 }).then(messages => {
        console.log(`Received ${messages.size} messages`);
        //Iterate through the messages here with the variable "messages".
        messages.forEach(message => console.log(message.content))
      })
  },
};
