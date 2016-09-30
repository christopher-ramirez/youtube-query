'use strict'

var lib = require('./lib'),
    { Video } = require('./lib/videos.js'),
    Youtube = lib.Youtube;

module.exports = {
    'Youtube': Youtube,
    'Video': Video,
}