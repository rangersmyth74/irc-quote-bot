[![npm version](https://badge.fury.io/js/irc-quote-bot.svg)](https://badge.fury.io/js/irc-quote-bot)

# IRC quote bot

IRC quote bot is a Node.js application that will add, delete, and get quotes for multiple IRC channels on a single server.

## Features

* Add quotes
* Delete quotes
* Get a specific quote based on its id
* Get a random quote
* Get the last quote
* Find quotes containing a word or phrase

## Instructions

### Installation

1. Install by running:

  ```
  npm install -g irc-quote-bot
  ```

2. Edit a `config.json` to put at least the server name and channels the bot to join. See `config.json.example` for examples. If you place config.json in the base directory, the app will pick it up automatically.
3. Start up the quote bot by running it if the config file is in the default location.

  ```
  irc-quote-bot
  ```
  
  Otherwise, you'll need to specify where the config file is:
  
  ```
  irc-quote-bot -- -c <config path>
  ```

### Importing data

1. You can import data by creating a JSON file with an array of objects containing a `quote` key and a `date` key formatted (YYYY-MM-DD).
2. Run the following command to import the data:

  ```
  irc-quote-bot init <channel> <quote path>  
  ```
  
3. The app will quit when it's done importing.
4. Run again for each channel's quotes that you need to import.
5. If translating one quote database to this one, use a good editor that supports multiline and regex replacement like Sublime to process it.
6. If you're importing data from another instance of `quote-bot`, just copy over the `quotes.json` file.
