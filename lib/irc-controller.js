'use strict';

var irc = require('irc');

class IrcController {
    constructor(config) {
        this.client = new irc.Client(config.server, config.bot_name, config.connect_options);
    }
}

module.exports = IrcController;
