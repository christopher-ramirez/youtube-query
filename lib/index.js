// 'use strict'

const {createResource} = require('./resource.js');
const {createVideosResource} = require('./videos.js');
const searchQueryRequired = 'You must provide a search query.';

/*
 * Youtube is the main class of the module. It's initialized with
 * application API secret key. This class provides helper methods
 * to query and search videos and playlist. See Resource class for
 * functionality details.
 */
class Youtube {
    constructor(key) {
        this.key = key

        // define the properties accessors for accesing different
        // resources provided by Youtube class.
        Object.defineProperty(this, 'videos', {
            enumerable: true,
            get: () => {
                return createVideosResource(this);
            }
        });

        Object.defineProperty(this, 'search', {
            enumerable: true,
            get: () => {
                // build a resource with a configuration suitable for search
                return (query) => {
                    if (!query) {
                        throw(searchQueryRequired);
                    };

                    let resource = createResource(this);
                    resource.parts = ['snippet'];
                    resource.resource = 'search';
                    resource.filter({q: query});
                    return resource;
                };
            }
        });
    }
}

module.exports = {
    'Youtube': Youtube,
}
