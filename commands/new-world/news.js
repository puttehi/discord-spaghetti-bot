// NOTE: Doesn't handle edited articles, cache must be purged manually. -> Can add admin only force fetch

// Imports
const { MessageEmbed, Util } = require('discord.js');
const puppeteer = require('puppeteer');
const TurndownService = require('turndown');
let cache = require('memory-cache');
const { hasAdminPrivileges } = require('../../helpers');
const rimraf = require('del');

// Constants
const PATHS = {
  win32: {
    executablePath:
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    userDataDir:
      'C:\\Users\\ZittingPetteriTTV18S\\AppData\\Local\\Temp\\puppeteer_user_data',
  },
  linux: {
    executablePath:
      '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    userDataDir:
      '/mnt/c/Users/ZittingPetteriTTV18S/AppData/Local/Temp/puppeteer_user_data',
  },
};
const NEWS_ARTICLE_CACHE_KEY = 'nw-newest-news-article';
const NEWS_URI = 'https://www.newworld.com/en-us/news?tag=updates';
const NEWS_CONTAINER_CLASS = '[class$=ags-SlotModule-spacer]'; // maybe href selector too for news/article ...
const NEWS_ARTICLE_CLASS =
  '[class$=ags-NewsArticlePage-contentWrapper-articlePane]';
const VIEWPORT_SETTINGS = {
  width: 800,
  height: 600,
};

// Markdown pruning
const pruneImages = (md) => {
  console.warn('<<<<<<<<<<PRUNE IMAGES>>>>>>>>>>>');
  const reImageUrl =
    /(.*(!)\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\))/g;
  // /[!]\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/; // markdown image urls
  md = md.replace(reImageUrl, '');
  return md;
};

const headersToBolds = (md) => {
  console.log('<<<<<<<<<<HEADERS TO BOLDS>>>>>>>>>>>');
  const reHeaderHash = /((.*[#])( )(.*))/g;
  md = md.replace(reHeaderHash, (match, group) => {
    const headerStartIndex = match.indexOf(' ');
    const headerText = match.substr(headerStartIndex + 1); // Get text part of header e.g. ####>headertext<
    //console.log(headerText);
    return `**${headerText}**`;
  });
  return md;
};

const pruneEndShareClutter = (md) => {
  console.log('<<<<<<<<<<<<PRUNE SHARE MUMBOJUMBO>>>>>>>>>>>');
  possibleOutros = [
    'Thanks for your support! We’ll see you in Aeternum.',
    'Thank you for your support! We’ll see you in Aeternum.',
  ];
  possibleOutros.forEach((outro) => {
    let endIndex = md.lastIndexOf(outro);
    if (endIndex != -1) {
      md = md.substr(0, endIndex);
    }
  });
  return md;
};

const fetchAndPruneArticle = async (page, href) => {
  // Go to update news
  await page.goto(href);
  // Get HTML of page and turndown
  const htmlContent = await (await page.$(NEWS_ARTICLE_CLASS))
    .getProperty('innerHTML')
    .then((eh) => eh.jsonValue());
  const turndownService = new TurndownService();
  markdown = turndownService.turndown(htmlContent);
  console.log('<<<<<<<<<<ORIGINAL ARTICLE>>>>>>>>>>>');
  console.log(markdown);

  // Prune article
  console.log('>>>>>>>>>>>PRUNING ARTICLE>>>>>>>>>>>');
  markdown = pruneImages(markdown);
  console.log(markdown);
  markdown = headersToBolds(markdown);
  console.log(markdown);
  markdown = pruneEndShareClutter(markdown);
  console.log('<<<<<<<<<<Article markdown ready.<<<<<<<<<<');
  console.log(markdown);
  const cacheEntry = { href: href, markdown: markdown };
  cache.put(NEWS_ARTICLE_CACHE_KEY, cacheEntry);
  console.log('Article cached!');

  return markdown;
};

const postArticleEmbed = async (message, markdown, href) => {
  if (markdown == null || typeof markdown != 'string' || markdown == '') {
    await message.channel.send(
      `:warning: Beep boop. Interwebs has defeated me :robot:`
    );
    console.error(`markdown was ${markdown} with type of ${typeof markdown}`);
    cache.del(NEWS_ARTICLE_CACHE_KEY); // Invalidate cache as at this point, new markdown was cached or this markdown was fetched from cache
    console.log(`Cache key ${NEWS_ARTICLE_CACHE_KEY} invalidated.`);
    return;
  }
  let pages = await Util.splitMessage(markdown, { maxLength: 3000 });
  let promises = [];
  const updateTitle = pages[0].substr(0, pages[0].indexOf('\n'));
  pages.forEach((page, pageIndex) =>
    promises.push(
      new Promise((res, rej) => {
        message.channel.send(
          new MessageEmbed()
            .setTitle(`${updateTitle} - Page ${pageIndex + 1}/${pages.length}`)
            .setDescription(page)
            .setURL(href)
        ); // embed: Embed size exceeds maximum size of 6000
      })
    )
  );
  await Promise.all(promises).catch(console.error);
};

module.exports = {
  name: 'nwnews', // Command name (what's gonna be used to call the command)
  aliases: ['nwn', 'nwupdates'], // Command aliases
  adminOnly: false,
  category: 'New World',

  async execute(client, message, args) {
    let browser;
    const adminForceFetch =
      hasAdminPrivileges(message.author.id) && args[0] == 'FORCE_FETCH';
    try {
      browser = await puppeteer
        .launch({
          defaultViewport: VIEWPORT_SETTINGS,
          executablePath: PATHS[process.platform].executablePath,
          userDataDir: PATHS.win32.userDataDir,
          dumpio: true, // Debug
          //args: ['--no-sandbox', '--disable-setuid-sandbox'],
          //executablePath: '/usr/bin/chromium-browser'
        })
        .catch(console.error);
      const page = await browser.newPage().catch(console.error);
      await page.goto(NEWS_URI);
      // Get news container element
      const elementHandle = await page.$(NEWS_CONTAINER_CLASS);
      // Get link to newest update
      const href = await elementHandle
        .getProperty('href')
        .then((eh) => eh.jsonValue());
      // Check if cache contains key
      const cachedArticle = cache.get(NEWS_ARTICLE_CACHE_KEY);
      const wasCacheHit = cachedArticle != null;
      const wasCachedNewest = wasCacheHit && cachedArticle['href'] == href;
      // Didn't find article, fetch, create and cache it
      if (!wasCacheHit) {
        console.log(
          'No articles cached! Fetching and caching the most recent one...'
        );
      } else if (!wasCachedNewest) {
        console.log(
          'Article cached but outdated. Fetching and caching the most recent one...'
        );
      } else if (adminForceFetch) {
        console.log('Admin user wanted to force fetch article!');
      }
      const markdown =
        wasCachedNewest && !adminForceFetch
          ? cachedArticle['markdown']
          : await fetchAndPruneArticle(page, href); // Article as markdown
      // Post article
      await postArticleEmbed(message, markdown, href);
    } catch (err) {
      console.error(err);
    } finally {
      async () => {
        //Always close browser
        if (browser) {
          await browser
            .close()
            .then((res) => {
              console.log('Puppeteer closed succesfully. Response:'); // Never prints for some reason
              console.log(res);
            })
            .catch((err) => {
              console.error(err);
            });
          if (adminForceFetch) {
            await message.delete();
          }
        } else {
          console.error(
            'Puppeteer browser was already destroyed, cannot close!'
          );
        }
        await rimraf(PATHS[process.platform].userDataDir, {force: true})
      };
    }
  },
};
