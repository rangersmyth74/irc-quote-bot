#!/usr/bin/env node
'use strict';

var argv = require('yargs')
    .usage('Usage: quote-bot -c <config_path>')
    .command('init <channel> <quotes_path>', 'Initialize with quotes from a channel')
    .config('config')
    .default('config', 'config.json')
    .alias('c', 'config')
    .version(() => require('../package.json').version)
    .help('h')
    .alias('h', 'help')
    .argv;

var QuoteStore = require('../lib/quote-store.js');
var IrcController = require('../lib/irc-controller.js');

var quotes = new QuoteStore(() => {
    if (argv.channel && argv.quotes_path) {
        quotes.init('#' + argv.channel, argv.quotes_path);
    }
    new IrcController(quotes, argv);
});
