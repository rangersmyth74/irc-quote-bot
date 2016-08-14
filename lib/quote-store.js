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

    formatQuote(quote, index, total) {
        return {
            index: index,
            total: total || NaN,
            quote: quote.quote,
            submitter: quote.submitter,
            date: quote.date
        };
    }

    getQuote(context, index) {
        var quotes = this.getContext(context);
        var total = quotes.count();
        (index == -1) && (index += total);
        if (_.inRange(index, total)) {
            return this.formatQuote(quotes.find()[index], index, total);
        }

        return null;
    }

    randomQuote(context) {
        var quotes = this.getContext(context);
        var total = quotes.count();
        if (total) {
            let index = _.random(total - 1);
            return this.formatQuote(quotes.find()[index], index, total);
        }

        return null;
    }

    findQuote(context, term) {
        var quotes = this.getContext(context);
        var result = quotes.findOne({ quote: { $contains: term }});
        return result ? this.formatQuote(result) : null;
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