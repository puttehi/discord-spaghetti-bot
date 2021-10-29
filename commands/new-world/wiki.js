const { MessageEmbed } = require('discord.js');

const links = {
  'somewikisite.com': 'https://www.somewikisite.com',
};

module.exports = {
  name: 'nwwiki', // Command name (what's gonna be used to call the command)
  aliases: ['nwwikipedia'], // Command aliases
  adminOnly: false,
  category: 'New World',
  
  execute(client, message, args) {
    for (const [key, value] of Object.entries(links)) {
      markdownedURL = `[${key}](${value})`;
      embed = new MessageEmbed()
        .setTitle(key)
        .setURL(value)
        .setDescription(markdownedURL);
      message.channel.send({ embed });
    }
  },
};
