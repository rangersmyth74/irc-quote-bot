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

    reply(channel, quote, success, error) {
        if (quote) {
            this.client.say(channel, success(quote));
        } else {
            this.client.say(channel, error());
        }
    }

    handleQuote(channel, index) {
        this.reply(channel,
            this.quotes.getSpecificQuote(channel, index),
            quote => `Selected quote #${index} from ${quote.date}: ${quote.quote}`,
            () => NO_SELECTED_QUOTE);
    }

    handleRandomQuote(channel) {
        this.reply(channel,
            this.quotes.getRandomQuote(channel),
            quote => `Random quote from ${quote.date}: ${quote.quote}`,
            () => NO_QUOTES);
    }

    handleLastQuote(channel) {
        this.reply(channel,
            this.quotes.getLastQuote(channel),
            `Last quote from ${quote.date}: ${quote.quote}`,
            () => NO_QUOTES);
    }
}

module.exports = IrcController;
