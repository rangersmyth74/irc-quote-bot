#!/usr/bin/env node
'use strict';

const argv = require('yargs')
    .usage('Usage: irc-quote-bot -c <config_path>')
    .command('init <channel> <quotes_path>', 'Initialize with quotes from a channel')
    .config('config')
    .default('config', 'config.json')
    .alias('c', 'config')
    .count('verbose')
    .alias('v', 'verbose')
    .version(() => require('../package.json').version)
    .help('h')
    .alias('h', 'help')
    .argv;

require('../lib/logger.js').init(argv.verbose);
const config = require('../lib/config.js').init(argv);
const QuoteStore = require('../lib/quote-store.js');
const IrcController = require('../lib/irc-controller.js');

var quotes = new QuoteStore(() => {
    if (argv.channel && argv.quotes_path) {
        quotes.init('#' + argv.channel, argv.quotes_path);
        quotes.close(() => process.exit());
    } else {
        new IrcController(quotes, config, () => process.exit());
    }
});
