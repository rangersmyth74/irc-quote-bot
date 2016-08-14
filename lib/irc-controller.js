'use strict';

const irc = require('irc');
const _ = require('lodash');
const logger = require('winston');

const NO_QUOTES = 'There are no quotes.';
const NO_SELECTED_QUOTE = 'That quote does not exist.';

class IrcController {
    constructor(quotes, config) {
        this.quotes = quotes;
        this.client = new irc.Client(config.server, config.bot_name, config);
        this.config = config;

        this.client.addListener('message#',
            (from, to, message) => this.handleChanMessage(from, to, message));
    }

    handleChanMessage(from, channel, message) {
        logger.debug(`Received message from ${from} to ${channel}: '${message}'`);
        if (_.startsWith(message, this.config.aliases.quote)) {
            var arg = message.replace(this.config.aliases.quote, '').trim();
            var index = parseInt(arg);
            if (index) {
                this.handleQuote(channel, index);
            } else if (arg) {
                this.handleFindQuote(channel, arg);
            } else {
                this.handleRandomQuote(channel);
            }
        } else if (_.startsWith(message, this.config.aliases.lastquote)) {
            this.handleLastQuote(channel);
        } else if (_.startsWith(message, this.config.aliases.add_quote)) {
            var args = message.replace(this.config.aliases.add_quote, '').trim();
            this.handleAddQuote(channel, from, args);
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
            quote => `Last quote from ${quote.date}: ${quote.quote}`,
            () => NO_QUOTES);
    }

    handleFindQuote(channel, term) {
        this.reply(channel,
            this.quotes.findQuote(channel, term),
            quote => `Found quote matching *${term}* from ${quote.date}: ${quote.quote}`,
            () => `No quote found matching *${term}*`);
    }

    handleAddQuote(channel, submitter, quote) {
        this.reply(channel,
            this.quotes.addQuote(channel, submitter, quote),
            null,
            () => 'Quote added');
    }
}

module.exports = IrcController;
