'use strict';

var irc = require('irc');
var _ = require('lodash');

var NO_QUOTES = 'There are no quotes.';
var NO_SELECTED_QUOTE = "That quote does not exist.";

class IrcController {
    constructor(quotes, config) {
        this.quotes = quotes;
        this.client = new irc.Client(config.server, config.bot_name, config);
        this.config = config;

        this.client.addListener('message#',
            (from, to, message) => this.handleChanMessage(from, to, message));
    }

    handleChanMessage(from, channel, message) {
        if (_.startsWith(message, this.config.aliases.quote)) {
            var index = parseInt(message.replace(this.config.aliases.quote, "").trim());
            if (index) {
                this.handleQuote(channel, index);
            } else {
                this.handleRandomQuote(channel);
            }
        } else if (_.startsWith(message, this.config.aliases.lastquote)) {
            this.handleLastQuote(channel);
        }
    }

    handleQuote(channel, index) {
        var quote = this.quotes.getSpecificQuote(channel, index)
        if (quote) {
            this.client.say(channel, `Selected quote from ${quote.date}: ${quote.quote}`);
        } else {
            this.client.say(channel, NO_SELECTED_QUOTE);
        }
    }

    handleRandomQuote(channel) {
        var quote = this.quotes.getRandomQuote(channel);
        if (quote) {
            this.client.say(channel, `Random quote from ${quote.date}: ${quote.quote}`);
        } else {
            this.client.say(channel, NO_QUOTES);
        }
    }

    handleLastQuote(channel) {
        var quote = this.quotes.getLastQuote(channel)
        if (quote) {
            this.client.say(channel, `Selected quote from ${quote.date}: ${quote.quote}`);
        } else {
            this.client.say(channel, NO_QUOTES);
        }
    }
}

module.exports = IrcController;
