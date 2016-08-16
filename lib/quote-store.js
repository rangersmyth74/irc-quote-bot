'use strict';

const fs = require('fs');
const logger = require('winston');
const loki = require('lokijs');
const touch = require('touch');
const _ = require('lodash');

const QUOTES_FILE = 'quotes.json';

class QuoteStore {
    constructor(onLoaded) {
        touch(QUOTES_FILE, null, () => {
            this.store = new loki(QUOTES_FILE, {
                autoload: true,
                autoloadCallback: onLoaded,
                autosave: true
            });
        });
    }

    init(context, path) {
        var quotes = this.getContext(context);
        var initialQuotes = JSON.parse(fs.readFileSync(path, 'utf8'));
        logger.info(`Loading ${initialQuotes.length} quotes for ${context}`);
        quotes.insert(initialQuotes);
    }

    close(onClose) {
        this.store.close(onClose);
    }

    getContext(context) {
        var collection = this.store.getCollection(context);
        if (!collection) {
            logger.warn(`Collection for ${context} being created`);
            collection = this.store.addCollection(context);
        }
        return collection;
    }

    formatQuotes(quotes, index, total) {
        if (Array.isArray(quotes)) {
            logger.debug(`${quotes.length} quotes returned`);
            return quotes.map((quote, index) => this.formatQuotes(quote, index, quotes.length));
        } else {
            logger.debug('Formatting one quote');
            return {
                index: index,
                total: total || NaN,
                quote: quotes.quote,
                submitter: quotes.submitter,
                date: quotes.date
            };
        }
    }

    getQuote(context, index) {
        logger.info(`Getting quote #${index} for ${context}`);
        var quotes = this.getContext(context);
        var total = quotes.count();
        (index == -1) && (index += total);
        if (_.inRange(index, total)) {
            logger.debug(`${index} is in range of ${total}`);
            return this.formatQuotes(quotes.find()[index], index, total);
        }

        logger.debug(`${index} is out of range of ${total}`);
        return null;
    }

    randomQuote(context) {
        logger.info(`Getting random quote for ${context}`);
        var quotes = this.getContext(context);
        var total = quotes.count();
        if (total) {
            let index = _.random(total - 1);
            logger.debug(`Random index was ${index} from a max of ${total - 1}`);
            return this.formatQuotes(quotes.find()[index], index, total);
        }

        logger.debug('There are no quotes to random from');
        return null;
    }

    findQuote(context, term) {
        logger.info(`Finding quote for ${context} that contains ${term}`);
        var quotes = this.getContext(context);
        var results = quotes.find({ quote: { $contains: term }});
        logger.info(`${results.length} result(s) found`);
        return results.length ? this.formatQuotes(results) : null;
    }

    addQuote(context, submitter, quote) {
        logger.info(`Adding quote for ${context} from ${submitter}: ${quote}`);
        var quotes = this.getContext(context);
        var result = quotes.insert({
            quote: quote,
            date: new Date(Date.now()).toJSON().slice(0, 10),
            submitter: submitter
        });
        var total = quotes.count();
        return result ? this.formatQuotes(result, total - 1, total) : null;
    }

    delQuote(context, index) {
        logger.info(`Deleting quote for ${context} at ${index}`);
        var quotes = this.getContext(context);
        var total = quotes.count();
        if (_.inRange(index, total)) {
            logger.debug(`${index} is in range of ${total}`);
            let result = quotes.find()[index];
            quotes.remove(result);
            return this.formatQuotes(result, index, total - 1);
        }

        logger.debug(`${index} is out of range of ${total}`);
        return null;
    }
}

module.exports = QuoteStore;
