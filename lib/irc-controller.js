'use strict';

const irc = require('irc');
const logger = require('winston');
const _ = require('lodash');

const NO_QUOTES = 'There are no quotes';
const NO_PERMISSION = 'Permission denied';
const GET = 'get';
const PUT = 'put';
const DEL = 'del';

class IrcController {
    constructor(quotes, config) {
        this.quotes = quotes;
        this.client = new irc.Client(config.server, config.bot_name, config);
        this.config = config;

        this.client.addListener('message#',
            (from, to, message) => this.handleChanMessage(from, to, message));
    }

    hasAccess(channel, nick, type) {
        var status = this.client.chans[channel].users[nick];
        var access = !this.config.access.type || _.includes(this.config.access.type, status);
        logger.info(`${nick} in ${channel} ${access ? 'does' : 'does not'} have access to ${type}`);
        return access;
    }

    handleChanMessage(from, channel, message) {
        logger.info(`Received message from ${from} to ${channel}: '${message}'`);
        if (_.startsWith(message, this.config.aliases.quote)) {
            if (!this.hasAccess(channel, from, GET)) return this.denied(channel);
            let arg = message.replace(this.config.aliases.quote, '').trim();
            let index = parseInt(arg);
            if (index) {
                this.handleQuote(channel, index - 1);
            } else if (arg) {
                this.handleFindQuote(channel, arg);
            } else {
                this.handleRandomQuote(channel);
            }
        } else if (_.startsWith(message, this.config.aliases.lastquote)) {
            if (!this.hasAccess(channel, from, GET)) return this.denied(channel);
            this.handleQuote(channel, -1);
        } else if (_.startsWith(message, this.config.aliases.add_quote)) {
            if (!this.hasAccess(channel, from, PUT)) return this.denied(channel);
            let args = message.replace(this.config.aliases.add_quote, '').trim();
            this.handleAddQuote(channel, from, args);
        } else if (_.startsWith(message, this.config.aliases.del_quote)) {
            if (!this.hasAccess(channel, from, DEL)) return this.denied(channel);
            let index = parseInt(message.replace(this.config.aliases.del_quote, '').trim());
            if (index) {
                this.handleDelQuote(channel, index - 1);
            }
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

    denied(channel) {
        this.client.say(channel, NO_PERMISSION);
    }

    handleQuote(channel, index) {
        this.reply(channel,
            this.quotes.getQuote(channel, index),
            quote => `Selected Quote (${quote.index + 1}/${quote.total}) [${quote.date}]: ${quote.quote}`,
            () => `Quote #${index + 1} does not exist`);
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
            quote => `Quote #${quote.index + 1} added`,
            () => 'Unable to add quote');
    }

    handleDelQuote(channel, index) {
        this.reply(channel,
            this.quotes.delQuote(channel, index),
            quote => `Quote #${quote.index + 1} deleted`,
            () => `Unable to delete quote #${index + 1}`);
    }
}

module.exports = IrcController;
