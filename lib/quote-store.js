'use strict';

var fs = require('fs');
var loki = require('lokijs');
var touch = require("touch");
var _ = require('lodash');

var QUOTES_FILE = 'quotes.json';

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
        _.forEach(initialQuotes, quote => {
            quotes.insert({
                quote: quote.quote,
                date: quote.date,
                submitter: 'Unknown'
            });
        });
    }

    getContext(context) {
        var collection = this.store.getCollection(context);
        if (!collection) {
            collection = this.store.addCollection(context);
        }
        return collection;
    }

    getQuote(collection, index) {
        var quote = collection.find()[index];
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
            return this.getQuote(quotes, index);
        }

        return null;
    }

    getRandomQuote(context) {
        var quotes = this.getContext(context);
        var totalQuotes = quotes.count();
        if (totalQuotes) {
            var index = _.random(totalQuotes - 1);
            return this.getQuote(quotes, index);
        }

        return null;
    }

    getLastQuote(context) {
        var quotes = this.getContext(context);
        var totalQuotes = quotes.count();
        if (totalQuotes) {
            return this.getQuote(quotes, totalQuotes - 1);
        }

        return null;
    }

    findQuote(context, term) {

    }

    addQuote(context, quote) {

    }

    delQuote(context, id) {

    }
}

module.exports = QuoteStore;