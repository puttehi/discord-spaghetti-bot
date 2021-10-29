const { MessageEmbed } = require('discord.js');
const { hasAdminPrivileges } = require('../../helpers');

module.exports = {
  name: 'help', // Command name (what's gonna be used to call the command)
  aliases: ['commands'], // Command aliases
  adminOnly: false,

  execute(client, message) {
    // Create a string with all commands sepearated by ','.
    sortedCommands = client.commands.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    adminCommandsArr = sortedCommands.filter((c) => c.adminOnly);
    normalCommandsArr = sortedCommands.filter(
      (c) => !c.adminOnly && !c.category
    );
    newWorldCommandsArr = sortedCommands.filter(
      (c) => !c.adminOnly && c.category == 'New World'
    );
    // TODO: Get categories instead and then map those in description, this is ugly
    // TODO/WIP: Fails if aliases is null, maybe put empty array on all

    const smth = newWorldCommandsArr
      .map((c) => {
        return (
          `\`${c.name}\`: ` +
          c.aliases
            .map((al) => {
              return `\`${al}\``;
            })
            .join(', ')
        );
      })
      .join('\n');

    console.log(newWorldCommandsArr.length);
    console.log(typeof smth);
    console.log(smth);

    const normalCommandsField = {
      name: 'General',
      value: normalCommandsArr
        .map((c) => {
          return (
            `\`${c.name}\`: ` +
            c.aliases
              .map((al) => {
                return `\`${al}\``;
              })
              .join(', ')
          );
        })
        .join('\n'),
    };

    console.log * normalCommandsField.description;

    const nwCommandsField = {
      name: 'New World',
      value: smth,
      // description: newWorldCommandsArr.map((c) => {
      //   return (
      //     `\`${c.name}\`: ` +
      //     c.aliases
      //       .map((al) => {
      //         return `\`${al}\``;
      //       })
      //       .join(', ')
      //   );
      // }).join('\n'),
    };

    const adminCommandsField = {
      name: 'Admin',
      value: adminCommandsArr
        .map((c) => {
          return (
            `\`${c.name}\`: ` +
            c.aliases
              .map((al) => {
                return `\`${al}\``;
              })
              .join(', ')
          );
        })
        .join('\n'),
    };

    const embed = new MessageEmbed()
      .setTitle('Commands')
      .setColor('RANDOM')
      .addField(normalCommandsField.name, normalCommandsField.value)
      .addField(nwCommandsField.name, nwCommandsField.value);

    message.channel.send({ embed });

    if (hasAdminPrivileges(message.author.id)) {
      message.author.send(
        `--\n\n**${adminCommandsField.name} commands**:\n${adminCommandsField.value}`
      );
    }
  },
};
