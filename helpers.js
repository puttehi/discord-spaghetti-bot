const path = require('path');
const glob = require('glob');
const Fuse = require('fuse.js/dist/fuse.common.js');
const fs = require('fs');
const config = require('./config.json');
let cache = require('memory-cache');

// Constants
const DATA_PATH = path.resolve(__dirname, './cache-dump.json');

const hasAdminPrivileges = (messageAuthorId) => {
  return config.adminUserIds.includes(messageAuthorId);
};

const truncateStr = (str, maxLength) => {
  return str.substr(0, maxLength);
};

const loadCommands = (commandDirectoryPath, client) => {
  // Create an empty array that will store all the file paths for the commands,
  // and push all files to the array.
  const commandArray = [];
  commandArray.push(
    ...glob.sync(`${path.join(__dirname, commandDirectoryPath)}/**/*.js`)
  );

  // Iterate through each element of the items array and add the commands / aliases
  // to their respective Collection.
  for (const commandItem of commandArray) {
    // Remove any cached commands
    if (require.cache[require.resolve(commandItem)])
      delete require.cache[require.resolve(commandItem)];

    // Store the command and aliases (if it has any) in their Collection.
    const command = require(commandItem);

    // Check if this command has some precondition that should prevent it from being loaded
    if ('shouldLoad' in command && !command.shouldLoad()) continue;

    // Add command to our commands collection and map aliases
    client.commands.set(command.name, command);
    if (command.aliases) {
      for (const alias of command.aliases) {
        client.aliases.set(alias, command.name);
      }
    }
  }
  if (client.commands) {
    commands = [...client.commands.keys()].toString();
    console.log(`Available commands:${commands}`);
  } else {
    console.log('No commands found!');
  }
};

const exitBot = (client) => {
  console.log('bye');
  // Destroy bot
  client.destroy();
  saveCacheToDisk();
  process.exit(0);
};

const saveCacheToDisk = () => {
  // Save cache
  const keys = cache.keys();
  console.log(`Saving ${keys.length} keys from cache: ${keys.join(', ')} ...`);
  cacheAsJson = cache.exportJson();
  try {
    fs.writeFileSync(DATA_PATH, cacheAsJson);
    console.log(`Saved cache!`);
  } catch (err) {
    console.error(err);
  }
};

const loadCacheFromDisk = () => {
  // Load cache
  console.log('Loading cache from disk ...');
  if (!fs.existsSync(DATA_PATH)) {
    console.warn(`Cache path ${DATA_PATH} is invalid. Cache loading failed.`);
  } else {
    try {
      cacheAsJson = fs.readFileSync(DATA_PATH, { encoding: 'utf8' });
      cache.importJson(cacheAsJson);
      const keys = cache.keys();
      console.log(`Loaded ${keys.length} keys from cache: ${keys.join(', ')}!`);
    } catch (err) {
      console.error(err);
    }
  }
};

const fuzzySearch = (list, searchedKeys, keywords, threshold = 0.3) => {
  if (!keywords) {
    console.warn("Attempted fuzzy search with null keywords")
    return []
  }
  if (!searchedKeys) {
    console.warn("Attempted fuzzy search with null searched keywords")
    return []
  }
  console.log('Fuzzy searching keywords: ' + keywords);
  const kw = Array.isArray(keywords) ? keywords : [keywords]; // force into array for .join
  const searchedKeywords = kw.join('|'); // Search for all keywords given
  const shortestKeyword = kw.reduce((a, b) => (a.length <= b.length ? a : b));
  // Fuzzy options
  const FUSE_OPTIONS = {
    keys: Array.isArray(searchedKeys) ? searchedKeys : [searchedKeys], // Must be array for fuse
    includeScore: true,
    minMatchCharLength: shortestKeyword
      ? Math.floor(shortestKeyword.length / 2)
      : 1, // At least half of the searched keywords must match
    threshold: threshold, // 0 = Perfect match, 1 = match anything
  };
  // Create fuzzy searcher
  const fuse = new Fuse(list, FUSE_OPTIONS); // Seems it needs to be a list object or converted into a list object..

  // Search
  console.log('searching with keyword: ' + searchedKeywords);
  result = fuse.search(searchedKeywords);
  console.log(typeof result);
  console.log('found ' + result);
  return result;
};

module.exports = {
  hasAdminPrivileges: hasAdminPrivileges,
  truncateStr: truncateStr,
  loadCommands: loadCommands,
  exitBot: exitBot,
  fuzzySearch: fuzzySearch,
  loadCacheFromDisk: loadCacheFromDisk,
};
