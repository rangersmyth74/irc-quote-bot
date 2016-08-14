'use strict';

const fs = require('fs');
const loki = require('lokijs');
const touch = require('touch');
const _ = require('lodash');
const logger = require('winston');

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
        quotes.insert(initialQuotes);
    }

    close(onClose) {
        this.store.close(onClose);
    }

    getContext(context) {
        var collection = this.store.getCollection(context);
        if (!collection) {
            collection = this.store.addCollection(context);
        }
        return collection;
    }

    formatQuote(quote) {
        return {
            id: quote.$loki,
            quote: quote.quote,
            submitter: quote.submitter,
            date: quote.date
        };
    }

    getSpecificQuote(context, index) {
        var quotes = this.getContext(context);
        var totalQuotes = quotes.count();
        if (_.inRange(index, totalQuotes - 1)) {
            return this.formatQuote(quotes.find()[index]);
        }

        return null;
    }

    getRandomQuote(context) {
        var quotes = this.getContext(context);
        var totalQuotes = quotes.count();
        if (totalQuotes) {
            var index = _.random(totalQuotes - 1);
            return this.formatQuote(quotes.find()[index]);
        }

        return null;
    }

    getLastQuote(context) {
        var quotes = this.getContext(context);
        var totalQuotes = quotes.count();
        if (totalQuotes) {
            return this.formatQuote(quotes.find()[totalQuotes - 1]);
        }

        return null;
    }

    findQuote(context, term) {
        var quotes = this.getContext(context);
        var result = quotes.findOne({ quote: { $contains: term }});
        return this.formatQuote(result);
    }

    addQuote(context, submitter, quote) {
        var quotes = this.getContext(context);
        quotes.insert({
            quote: quote,
            date: new Date(Date.now()).toJSON().slice(0, 10),
            submitter: submitter
        });
    }

    delQuote(context, id) {

    }
}

module.exports = QuoteStore;