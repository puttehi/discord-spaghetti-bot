// Imports
const { MessageAttachment } = require('discord.js');
const Canvas = require('canvas');
const puppeteer = require('puppeteer');
const { fuzzySearch } = require('../../helpers.js');
// Constants
const BASE_URI = 'https://nwdb.info/db/recipe';
const ELEMENT_CLASS = '.panel-item-details';
const RECIPE_NAME_CLASS = '[class^="h5 mb-0"][class$="svelte-unnmgi"]';
const COOKIE_CONSENT_BUTTON_CLASS = '[class$=css-47sehv]';
const VIEWPORT_SETTINGS = {
  width: 650,
  height: 1300,
};
const RECIPE_CACHE_KEY = 'nw-recipe-id-cache';
let cache = require('memory-cache');

const cacheRecipe = (recipeName, recipeId) => {
  const existingCache = cache.get(RECIPE_CACHE_KEY);
  let updatedCache = existingCache ? [...existingCache] : [];
  const obj = {
    name: recipeName,
    id: recipeId,
  };
  // If the recipe exists, replace it, don't append a new entry
  const foundKeys = fuzzySearch(updatedCache, ['id'], [recipeId], 0.05); // 99% match required
  if (foundKeys.length > 0) {
    // Cache contained key, remove it
    console.log('Recreated recipe in cache, removed:');
    const removed = updatedCache.splice(foundKeys[0].refIndex, 1, obj); // Replace with new data
    console.log(removed);
    console.log('Inserted: ');
  } else {
    // Key was not found, insert it
    console.log('Stored new recipe to cache: ');
    updatedCache.push(obj);
  }
  cache.put(RECIPE_CACHE_KEY, updatedCache);
  console.log(obj);
};

const getExistingIdByName = (keywords) => {
  const result = fuzzySearch(cache.get(RECIPE_CACHE_KEY), 'name', keywords, 0.15);
  if (result.length > 0) {
    // Found result
    return result[0].item.id;
  } else {
    // No matches
    return null;
  }
};

module.exports = {
  name: 'nwcrafting', // Command name (what's gonna be used to call the command)
  aliases: ['nwc', 'nwch', 'nwcraft', 'nwcraftinghelper', 'nwcrafthelp'], // Command aliases
  adminOnly: false,
  category: 'New World',

  async execute(client, message, args) {
    let asyncFailed = false;
    let arg = 'foodharvestert4';
    if (args[0] == 'id' && args[1]) {
      // desired search by id (straight url attempt)
      arg = args[1];
    } else if (args[0] != 'id' && args.length > 0) {
      // desired search by name (find from cache)
      arg = getExistingIdByName(args);
    }
    if (!arg) {
      message.channel.send(
        `:warning: Beep boop. Recipe has not been cached yet, try searching by id: \`!nwc id <recipe_id>\`\nE.g. \`!nwc id foodharvestert4\` (https://nwdb.info/db/recipe/foodharvestert4)`
      );
      return;
    }
    const recipeURI = BASE_URI + '/' + arg;
    const browser = await puppeteer.launch({
      defaultViewport: VIEWPORT_SETTINGS,
    });
    const page = await browser.newPage();
    await page.goto(recipeURI);
    // Click consent 'Agree' button
    const cookieConsentAgreeButton = await page.$(COOKIE_CONSENT_BUTTON_CLASS);
    if (cookieConsentAgreeButton) {
      cookieConsentAgreeButton.evaluate((e) => e.click());
      console.log('Agreed cookie consent!');
    } else {
      console.warn(
        `No cookie button element found with class ${COOKIE_CONSENT_BUTTON_CLASS}`
      );
    }
    const recipeFrameElement = await page.$(ELEMENT_CLASS);
    const recipeNameElement = await page.$(RECIPE_NAME_CLASS);
    let recipeName;
    if (recipeNameElement) {
      recipeName = await recipeNameElement.evaluate((e) => e.textContent);
    }
    if (!recipeFrameElement) {
      message.channel.send(
        `:warning: Beep boop. Recipe frame with class \`${ELEMENT_CLASS}\` not found at \`${recipeURI}\` :robot:`
      );
    } else {
      let b64buffer;
      let recipeFrameElementBox = await recipeFrameElement.boxModel();
      let canvasSize = {
        width: recipeFrameElementBox.width,
        height: recipeFrameElementBox.height,
      };
      await recipeFrameElement
        .screenshot({
          encoding: 'base64',
          //fullPage: true,
          captureBeyondViewport: true,
        })
        .then((res) => {
          if (!res) {
            message.channel.send(
              `:warning: Beep boop. I'm tired of screenshots :robot:`
            );
          } else {
            b64buffer = Buffer.from(res, 'base64');
          }
        })
        .catch((err) => {
          asyncFailed = true;
          console.error(err);
        });
      if (!asyncFailed) {
        if (recipeName) {
          console.log(`Found recipe name: ${recipeName} for id ${arg}`);
          cacheRecipe(recipeName, arg);
        }
        const canvas = Canvas.createCanvas(canvasSize.width, canvasSize.height);
        const context = canvas.getContext('2d');
        const img = await Canvas.loadImage(b64buffer);
        // This uses the canvas dimensions to stretch the image onto the entire canvas
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Use the helpful Attachment class structure to process the file for you
        const attachment = new MessageAttachment(
          canvas.toBuffer(),
          'bufferedfilename.png'
        );

        message.channel.send({
          content: ':person_tipping_hand:',
          files: [attachment],
        });
      } else {
        message.channel.send(
          `:warning: Beep boop. My screenshot-machine broke :robot:`
        );
      }
    }
    await browser.close();
    // ...
  },
};
