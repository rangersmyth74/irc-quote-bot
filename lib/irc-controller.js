'use strict';

var irc = require('irc');
var _ = require('lodash');

var NO_QUOTES = 'There are no quotes.';

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
            this.handleRandomQuote(channel);
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
}

module.exports = IrcController;
