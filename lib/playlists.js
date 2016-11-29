const { Resource, createResource } = require('./resource.js');
const { mustHaveValidId } = require('./resource.js');
const parentProperty = Symbol('parent');

// Implementation of Videos resource
function createPlaylistsResource(parent) {
    const playlists = createResource(parent);
    playlists.resource = 'playlists';
    playlists.elementFactory = playlistFactory;
    return playlists
}

function playlistFactory(element) {
    return new Playlist(element, this);
};

class Playlist {
    constructor(data, parent) {
        Object.assign(this, data);
        this[parentProperty] = parent;
    }

    items(max, cb, err) {
        // build and return a playlistItems resource to retrieve elements
        // listed in this playlist.
        if (!this.id) {
            throw (mustHaveValidId)
        }

        return createPlaylistItemsResource(this[parentProperty]).filter({
            playlistId: this.id
        })
    }
}

// Implementation of playlistItems resource
function createPlaylistItemsResource(parent) {
    const items = createResource(parent);
    items.resource = 'playlistItems';
    return items
}

module.exports = {
    'createPlaylistsResource': createPlaylistsResource,
    'createPlaylistItemsResource': createPlaylistItemsResource,
    'Playlist': Playlist
}