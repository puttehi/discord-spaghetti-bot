const { MessageEmbed } = require('discord.js');

const links = {
  'newworld-map.com': 'https://www.newworld-map.com/#/',
  'mapgenie.io': 'https://mapgenie.io/new-world/maps/aeternum',
};

module.exports = {
  name: 'nwmap', // Command name (what's gonna be used to call the command)
  aliases: ['nwmaps', 'nwkartta', 'nwkartat'], // Command aliases
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
