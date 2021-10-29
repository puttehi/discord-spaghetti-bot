// Imports
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { fuzzySearch } = require('../../helpers.js');
let cache = require('memory-cache');
// Constants
const DATA_PATH = path.resolve(
  __dirname,
  '../../assets/new-world-data/enemy-affixes.json'
);
const ENEMY_AFFIXES_CACHE_KEY = 'enemy-affixes'

const refreshCacheFromDisk = () => {
  //Load JSON data to memoryCache
  cache.put('enemy_affixes', fs.readFileSync(DATA_PATH));
};

const generateEmbed = (result, start, pageSize) => {
  if (!result || result.length == 0) {
    return new MessageEmbed({
      title: `New World Enemy Affixes`,
      description:
        'Search returned no results... :(\nTry `!nwea` to see the full list of enemy affixes.',
    });
  }
  const current = result.slice(start, start + pageSize);
  // you can of course customise this embed however you want
  return new MessageEmbed({
    title: `New World Enemy Affixes`,
    fields: current.map((r) => ({
      name: r.name,
      value: `*${r.description}*`,
    })),
  });
};

if (!cache.get(ENEMY_AFFIXES_CACHE_KEY)){
  refreshCacheFromDisk();
}

module.exports = {
  name: 'nwenemyaffixes', // Command name (what's gonna be used to call the command)
  aliases: ['nwea', 'nwenemies', 'nwaffixes', 'nwenemyaffix', 'nwaffix'], // Command aliases
  adminOnly: false,
  category: 'New World',
  
  async execute(client, message, args) {
    let result;
    const searchedList = JSON.parse(cache.get(ENEMY_AFFIXES_CACHE_KEY));
    //If args, post embed with single affix stats (find closest key with some useful search library and use value)
    if (args.length > 0) {
      searchResult = fuzzySearch(searchedList.data, ['name'], args);
      // Clean up fuse.js bloat
      result = searchResult.map((sr) => {
        return {
          name: sr.item.name,
          description: sr.item.description,
        };
      });
    }
    //If no args, post list of all as an embed
    else {
      result = searchedList.data;
    }

    console.log('Found matches: ');
    console.log(result);

    // Post as paged embed
    try {
      const PAGE_SIZE = 10;
      const ORIGINAL_AUTHOR = message.author.id;
      // send the embed with the first 10 results
      message.channel
        .send(generateEmbed(result, 0, PAGE_SIZE))
        .then((message) => {
          // exit if there is only one page of results (no need for all of this)
          if (result.length <= PAGE_SIZE) return;
          // react with the right arrow (so that the user can click it) (left arrow isn't needed because it is the start)
          message.react('➡️');
          console.log('initially reacted right');
          const collector = message.createReactionCollector(
            // only collect left and right arrow reactions from the message author
            (reaction, user) =>
              ['⬅️', '➡️'].includes(reaction.emoji.name) &&
              user.id === ORIGINAL_AUTHOR,
            // time out after a minute
            { time: 60000 }
          );

          let currentIndex = 0;
          collector.on('collect', async (reaction) => {
            // remove the existing reactions
            await message.reactions.removeAll();
            console.log('removed reactions');
            // increase/decrease index
            reaction.emoji.name === '⬅️'
              ? (currentIndex -= PAGE_SIZE)
              : (currentIndex += PAGE_SIZE);
            console.log('updated index');
            // edit message with new embed
            await message.edit(generateEmbed(result, currentIndex, PAGE_SIZE));
            console.log('edited message');
            // react with left arrow if it isn't the start
            if (currentIndex !== 0) {
              await message.react('⬅️');
              console.log('...reacted left');
            }
            // react with right arrow if it isn't the end
            if (currentIndex + PAGE_SIZE < result.length)
              await message.react('➡️');
            console.log('...reacted right');
          });
        });
    } catch (err) {
      console.error(err);
    }
  },
};
