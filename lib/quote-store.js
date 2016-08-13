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

    getRandomQuote(context) {
        var quotes = this.getContext(context);
        var totalQuotes = quotes.count();
        if (totalQuotes) {
            var index = _.random(totalQuotes - 1);
            var quote = quotes.find()[index];
            return {
                id: quote.$loki,
                quote: quote.quote,
                submitter: quote.submitter,
                date: quote.date
            };
        }

        return null;
    }

    getLastQuote(context) {

    }

    getQuote(context, term) {

    }

    addQuote(context, quote) {

    }

    delQuote(context, id) {

    }
}

module.exports = QuoteStore;