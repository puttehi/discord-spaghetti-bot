const { hasAdminPrivileges } = require('../../helpers.js');
let cache = require('memory-cache');

const CLEAR_ALL_KEY = 'FULL_CLEAR_CACHE';
module.exports = {
  name: 'forceclearcache', // Command name (what's gonna be used to call the command)
  aliases: ['fcc', 'clearcache'], // Command aliases
  adminOnly: true,

  execute(client, message, args) {
    if (!hasAdminPrivileges(message.author.id)) return;
    let keyToClear = null;
    if (args) keyToClear = args[0];
    if (keyToClear != null && keyToClear != CLEAR_ALL_KEY && cache.get(keyToClear)) {
      const valueCount = cache.get(keyToClear).length
      cache.del(keyToClear);
      console.log(`Cleared key ${keyToClear} with ${valueCount} values from cache!`);
    } else if (keyToClear == CLEAR_ALL_KEY) {
      cache.clear();
      console.log('Cleared whole cache!');
    } else {
      console.warn("Invalid key given to clear")
    }
    message.delete();
  },
};
