# Spaghetti Bot for small scale Discord usage

Originally a fork of [lem-n's awesome boilerplate](https://github.com/lem-n/discord.js-boilerplate.git).

I just added some functionality and stripped the audio playback away.

## Dependencies

- [Node.js](https://nodejs.org/en/) = 12
  - `canvas` breaks on some newer version. Use 12.22 to be safe.

## Pre-requisites

### Environment variables

Create `./.env` with the following keys:

- `NEW_WORLD_WORLD_STATUS_API_KEY=<api key>`: Your API key for [New World Status](https://newworldstatus.com) API to use `!nwws`
- `BOT_TOKEN=<bot token>`: Your Discord bot token from the developer application portal

### Config

Update `./config.json` with your settings

- Set `adminUserIds` to Discord user IDs you consider admin users to the bot (allow usage of `command.adminOnly` commands)
- Set `prefix` to what you want to prefix the bot commands with for usage `prefix: '!'` => `!help`

## Running

1. `npm install` to install dependencies
2. `npm start` to start execution

## Adding commands

Commands are loaded on startup or with the command `!reloadc` so it is as easy as:

1. Copy-paste some command to a new file
2. Set unique command name and aliases + other flags
3. Restart bot or `!reloadc`

## TODOs

- **Update to Discord.js 13 and newest supported Node. Node 17 possibly.**
- **Add `command.disabled` and toggle if key is not found or is reported invalid**
  - **Add `!setDisabled <command> <true|false>` to toggle said flag without ability to set itself**
- **Fix `!fcc FORCE_FETCH` not deleting the message**
- **Handle exception for invalid world IDs and tidy cache usage in `!nwws`**
- **Add "bot permissions" information to this README**
- **Add proper injectable logger and get rid of `console.*`**
