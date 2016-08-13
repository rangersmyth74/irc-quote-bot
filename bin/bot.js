#!/usr/bin/env node
'use strict';

var argv = require('yargs')
    .usage('Usage: quote-bot -c <path to config>')
    .config('config')
    .default('config', 'config.json')
    .alias('c', 'config')
    .version(() => require('../package.json').version)
    .help('h')
    .alias('h', 'help')
    .argv

var IrcController = require('../lib/irc-controller.js');

var controller = new IrcController(argv);
