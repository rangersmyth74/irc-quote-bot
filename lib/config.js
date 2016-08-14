'use strict';

const _ = require('lodash');

var DEFAULTS = {
    bot_name: 'QuoteBot',
    floodProtection: true,
    aliases: {
        quote: '!quote',
        lastquote: '!lastquote',
        add_quote: '+quote',
        del_quote: '-quote'
    },
    quote_limit: 5
};

function init(config) {
    return _.assign(DEFAULTS, config);
}

module.exports.init = init;
