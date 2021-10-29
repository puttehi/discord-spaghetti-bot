const { getWorldsList, getWorldInfo } = require('../../nwws-api/endpoints.js');

const { MessageEmbed } = require('discord.js');

let memoryCache = require('memory-cache');
const WORLDS_CACHE_EXPIRATION_TIME_MS = 60 * 15 * 1000; // seconds * minutes * ms
const WORLD_INFO_CACHE_EXPIRATION_TIME_MS = 60 * 1 * 1000; // seconds * minutes * ms

const generateEmbed = (worldsOrWorld, start, pageSize) => {
  // List is empty, show error
  if (!worldsOrWorld || worldsOrWorld.length == 0) {
    return new MessageEmbed({
      title: `New World Worlds List`,
      description:
        'Search returned no results... :(\nTry `!nwws` to see the full list of worlds.',
    });
  }
  // List had one item so it must be a single world, show single world embed
  else if (worldsOrWorld.length == 1) {
    // .name is mutated to the element
    const world = worldsOrWorld[0];
    return new MessageEmbed({
      title: `New World Worlds List - ${world.name} **(${world.status_enum})**`,
      description: `Players: ${world.players_current}/${world.players_maximum}\nQueue: ${world.queue_current} players (ETA: ${world.queue_wait_time_minutes} min)`,
    });
  }
  // List had multiple items so it must be the full list, show full list embed with pages
  else {
    const current = worldsOrWorld.slice(start, start + pageSize);
    return new MessageEmbed({
      title: `New World Worlds List`,
      description: `Showing ${start + 1}-${start + current.length} out of ${
        worldsOrWorld.length
      } worlds`,
      fields: current.sort().map((world) => ({
        name: world.name,
        value: world.identifier,
        inline: true,
      })),
    });
  }
};

module.exports = {
  name: 'nwstatus', // Command name (what's gonna be used to call the command)
  aliases: ['nwws', 'nwstat', 'nwworldstat', 'nwworldstatus'], // Command aliases
  adminOnly: false,
  category: 'New World',

  async execute(client, message, args) {
    const AUTHOR = message.author;
    const PAGE_SIZE = 29;
    let worldsList = memoryCache.get('worlds');
    // No args: Get worlds list (identifiers)
    if (args.length == 0) {
      try {
        // If cache is empty, fetch
        if (worldsList == null || worldsList.length == 0) {
          await getWorldsList().then(
            (res) =>
              (worldsList = memoryCache.put(
                'worlds',
                res,
                WORLDS_CACHE_EXPIRATION_TIME_MS
              ))
          );
        }
        // Got worlds, show paged embed
        // send the embed with the first 10 guilds
        message.channel
          .send(generateEmbed(worldsList, 0, PAGE_SIZE))
          .then((message) => {
            // exit if there is only one page of guilds (no need for all of this)
            if (worldsList.length <= PAGE_SIZE) return;
            // react with the right arrow (so that the user can click it) (left arrow isn't needed because it is the start)
            message.react('➡️');
            const collector = message.createReactionCollector(
              // only collect left and right arrow reactions from the message author
              (reaction, user) =>
                ['⬅️', '➡️'].includes(reaction.emoji.name) &&
                user.id === AUTHOR.id,
              // time out after a minute
              { time: 60000 }
            );

            let currentIndex = 0;
            collector.on('collect', async (reaction) => {
              // remove the existing reactions
              await message.reactions.removeAll();
              // increase/decrease index
              reaction.emoji.name === '⬅️'
                ? (currentIndex -= PAGE_SIZE)
                : (currentIndex += PAGE_SIZE);
              // edit message with new embed
              await message.edit(
                generateEmbed(worldsList, currentIndex, PAGE_SIZE)
              );
              // react with left arrow if it isn't the start
              if (currentIndex !== 0) await message.react('⬅️');
              // react with right arrow if it isn't the end
              if (currentIndex + PAGE_SIZE < worldsList.length)
                await message.react('➡️');
            });
          });
      } catch (err) {
        console.error(err);
        return;
      }
    }
    // Args: Get a single worlds info
    else {
      const arg = args[0]; // world to fetch
      let worldInfo = memoryCache.get(arg);
      try {
        // We need cached worlds to get the .name for the embed
        if (worldsList == null || worldsList.length == 0) {
          await getWorldsList().then(
            (res) =>
              (worldsList = memoryCache.put(
                'worlds',
                res,
                WORLDS_CACHE_EXPIRATION_TIME_MS
              ))
          );
        }
        // Now we must have cached worlds list so fetch world info but check cache first
        if (worldInfo == null) {
          await getWorldInfo(arg).then((res) => {
            // Save in cache to reduce fetches
            worldInfo = memoryCache.put(
              arg,
              res,
              WORLD_INFO_CACHE_EXPIRATION_TIME_MS
            );
          });
        }
        // Now we must have the world info and worlds list cached, so add .name identifier and send embed
        worldAsList = [
          {
            ...worldInfo,
            name: worldsList.find((e) => e.identifier == arg).name,
          },
        ];
        message.channel.send(generateEmbed(worldAsList, 0, PAGE_SIZE));
      } catch (err) {
        console.error(err);
        return;
      }
    }
  },
};
