'use strict';

const winston = require('winston');
const _ = require('lodash');

const levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

function init(level) {
    if (_.inRange(level, 6)) {
        winston.level = levels[level];
    }
}

module.exports.init = init;