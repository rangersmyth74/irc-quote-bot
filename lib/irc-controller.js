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
        logger.info(`Received message from ${from} to ${channel}: '${message}'`);
        if (_.startsWith(message, this.config.aliases.quote)) {
            var arg = message.replace(this.config.aliases.quote, '').trim();
            var index = parseInt(arg);
            if (index) {
                this.handleQuote(channel, index - 1);
            } else if (arg) {
                this.handleFindQuote(channel, arg);
            } else {
                this.handleRandomQuote(channel);
            }
        } else if (_.startsWith(message, this.config.aliases.lastquote)) {
            this.handleQuote(channel, -1);
        } else if (_.startsWith(message, this.config.aliases.add_quote)) {
            var args = message.replace(this.config.aliases.add_quote, '').trim();
            this.handleAddQuote(channel, from, args);
        }
    }

    reply(channel, quotes, success, error) {
        if (quotes) {
            let responses = success(quotes);
            if (!Array.isArray(responses)) {
                logger.debug('Response only had one quote');
                responses = [responses];
            }
            logger.info(`Replying to ${channel} with ${responses.length} quotes`);
            _.forEach(_.take(responses, this.config.quote_limit), response => this.client.say(channel, response));
        } else {
            this.client.say(channel, error());
        }
    }

    handleQuote(channel, index) {
        this.reply(channel,
            this.quotes.getQuote(channel, index),
            quote => `Selected Quote (${quote.index + 1}/${quote.total}) [${quote.date}]: ${quote.quote}`,
            () => NO_SELECTED_QUOTE);
    }

    handleRandomQuote(channel) {
        this.reply(channel,
            this.quotes.randomQuote(channel),
            quote => `Random Quote [${quote.date}]: ${quote.quote}`,
            () => NO_QUOTES);
    }

    handleFindQuote(channel, term) {
        this.reply(channel,
            this.quotes.findQuote(channel, term),
            quotes => {
                this.client.say(channel, `Found quote(s) matching *${term}*:`);
                logger.debug(`Formatting ${quotes.length} found quotes`);
                return _.map(quotes, quote => `(${quote.index + 1}/${quote.total}) [${quote.date}]: ${quote.quote}`);
            },
            () => `No quotes found matching *${term}*`);
    }

    handleAddQuote(channel, submitter, quote) {
        this.reply(channel,
            this.quotes.addQuote(channel, submitter, quote),
            null,
            () => 'Quote added');
    }
}

module.exports = IrcController;
