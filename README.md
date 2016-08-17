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
* Control who gets access to the above functions

## Instructions

### Installation

1. Install by running:

  ```
  npm install -g irc-quote-bot
  ```

2. Create a `config.json` formatted as a dictionary. The two required fields in the config are `server` which specifies the IRC server to connect to and `channels` which is an array specifying which channels on the IRC server to join. The app will not be able to connect to IRC without those two config fields. If you run the app in the same directory as `config.json`, the app will pick it up automatically. An example `config.json` may look like:

  ```
  {
    "server": "irc.rizon.net",
    "bot_name": "QuoteBot",
    "channels": ["#quotebot"],
    "floodProtection": true,
    "aliases": {
        "quote": "!quote",
        "lastquote": "!lastquote",
        "add_quote": "+quote",
        "del_quote": "-quote"
    },
    "quote_limit": 5,
    "access": {
        "get": ["~", "&", "@", "%", "+"],
        "put": ["~", "&", "@", "%"],
        "del": ["~", "&"]
    }
  }
  ```
  
  * `server`: the IRC server to join
  * `bot_name`: the nick that the bot will use on IRC (default is `QuoteBot`)
  * `channels`: an array of channels that the bot will join upon connecting
  * `floodProtection`: a boolean that specifies whether flood protection is on or not (default is `true`)
  * `aliases`: a dictionary that defines the IRC triggers to use for the quote bot functions (default is shown in the example)
  * `quote_limit`: the max number of quotes that a quote search can return
  * `access`: a dictionary that restricts access to the bot triggers by channel operator status (default is unrestricted)
    * `get`: restricts any retrieval of quotes
    * `put`: restricts any adding of quotes
    * `del`: restricts any deleting of quotes
    * The operator statuses of `~`, `&`, `@`, `%`, `+` correspond to the irc modes of `+q`, `+s`, `+a`, `+h`, `+v`
  * You can add more advanced options for connecting to irc like `port`, `secure`, `realName`, etc. by also including them in `config.json` and the app will automatically use them to connect to IRC. The specification and their default values can be found at: http://node-irc.readthedocs.io/en/latest/API.html#client

3. Start up the quote bot by just running it if the config file is in the default location.

  ```
  irc-quote-bot
  ```
  
  Otherwise, you'll need to pass in the path where the config file is:
  
  ```
  irc-quote-bot -c <config path>
  ```
  
4. The bot maintains separate quotes for each channel that it is. If you have not modified the triggers in the `aliases` key in the config, then you can trigger the bot by entering the following in a channel where the bot resides:
  * `+quote <insert quote here>`: adds a quote. The bot will return what the quote id of the quote that was just added.
  * `-quote <quote id>`: deletes a quote. The bot will return the quote id of the quote that was just deleted.
  * `!quote`: returns a random quote. The bot will return the quote id, the date it was submitted, and the quote content.
  * `!quote <quote id>`: returns a specific quote. The bot will return the same as above.
  * `!lastquote`: returns the last quote. The bot will return the same as above.
  * `!quote <search term>`: returns a search for any quotes containing the search term. The bot will only return the date and the quote content. The number of results it will print out is capped by the `quote_limit` in the config.

### Importing data

1. You can import data by creating a JSON file with an array of objects containing a `quote` key and a `date` key formatted (YYYY-MM-DD). An example would look like:

  ```
  [{
    "quote": "<i8b4uUnderground> d-_-b <BonyNoMore> how u make that inverted b? <BonyNoMore> wait <BonyNoMore> never mind",
    "date": "2007-02-19"
  }, {
    "quote: "<mage> what should I give sister for unzipping? <Kevyn> Um. Ten bucks? <mage> no I mean like, WinZip?",
    "date": "2033-01-17"
  }]
  ```

2. Run the following command to import the data:

  ```
  irc-quote-bot init <channel> <quote path>  
  ```
  
3. The app will quit when it's done importing.
4. Run it again for each channel's quotes that you need to import.
5. To translate one quote database to the format used in this one, use an editor that supports multi-line editing and regex replacement like Sublime Text to process it.
6. If you're importing data from another instance of `irc-quote-bot`, just copy over the `quotes.json` file.

### Upgrading

1. Update the npm package:

  ```
  npm update -g irc-quote-bot
  ```

2. Kill the previously running instance and restart the app.
