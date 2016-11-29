const { Resource, createResource } = require('./resource.js');
const { mustHaveValidId } = require('./resource.js');
const parentProperty = Symbol('parent');

function createVideosResource(parent) {
    let videos = createResource(parent);
    videos.resource = 'videos';
    videos.elementFactory = videoFactory;
    videos.filter({chart: 'mostPopular'})
    
    return videos;
}

function videoFactory(element) {
    return new Video(element, this)
}

/*
 * The Video class represents a Youtube video. It doesn't offer much functionally
 * but a helper function to retrieve related videos. You should not directly
 * create instances of Video. They are generally created when fetching videos
 * through videos resources list.
 */
class Video {
    constructor(data, parent) {
        Object.assign(this, data)
        this[parentProperty] = parent;
    }

    getRelatedVideos(max, cb, err) {
        if (!this.id) {
            throw(mustHaveValidId);
        };

        return createVideosResource(this[parentProperty]).filter({
            relatedToVideoId: this.id.videoId, type: 'video'
        })
    }
}

module.exports = {
    'createVideosResource': createVideosResource,
    'Video': Video
}
