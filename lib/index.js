'use strict'

var request = require('request'),
    qs = require('querystring'),
    baseUrl = 'https://www.googleapis.com/youtube/v3/'

/*
 * Youtube is the main class of the module. It's initialized with
 * application API secret key. This class provides helper methods
 * to query and search videos and playlist. See Videos class for
 * functionality details.
 */
function Youtube(APIKey) {
    var config = {APIKey: APIKey}
    return {
        APIKey: APIKey,
        videos: new Videos(config)
    }
}

/*
 * Videos class returns an object inherited from Array which implements
 * helpers methods to search and query Youtube for videos, and with the
 * appropiate configuration it can also search channels and playlists.
 * 
 * Normally you would not directly create an instance of Videos, instead
 * you should retrieve a global instance through Youtube class. e.g.:
 * 
 * >    var app = new Youtube(APIKey)
 * >    var lastesVideos = app.videos.fetch()
 * 
 * The API of videos supports a fluent style, like jquery or medium/dynamite,
 * thus allowing to write expression like:
 * >    var v = videos.filter({regionCode: 'US'}).search('programming').fetch()
 * 
 * Videos.filter and Videos.search both return a new instance of Videos, 
 * they don't modify and preserving the `this` instance configuration. 
 */
function Videos(props) {
    props = props || new Object()
    var requestsFilters = props['filters'] ? getPropsOf(props['filters']) : {chart: 'mostPopular'},
        requestedParts = props['parts'] ? props['parts'].slice() : ['id', 'snippet'],
        resultsPerPage = props['resultsPerPage'] || 5,
        APIKey = props['APIKey'],
        nextToken, totalResults, $resolved, resource = 'videos';

    
    // Define Videos array extended prototype. We use property accessors
    // to provide the functionality of the Videos class over the base Array.
    var prototype = {
        APIKey: {value: APIKey},
        fetch: {value: fetch},
        search: {value: search},
        filters: {value: requestsFilters},
        filter: {value: filter},
        parts: {value: requestedParts},
        totalResults: {value: () => {return totalResults}},
        resultsPerPage: {get: () => {return resultsPerPage}, set: setResultsPerPage},
        next: {value: nextChunk},
        $resolved: {get: () => {return $resolved || false}},
        _resource: {set: (r) => { resource = r }},
    }


    var instance = Object.create([], prototype)
    doRequest = doRequest.bind(instance)
    onResolved = onResolved.bind(instance)
    return instance

    // implementation
    function fetch(arg1, arg2, arg3) {
        var max, cb, err
        $resolved = false;
        switch (arguments.length) {
            case 1:
                typeof(arguments[0])=='number' ? max=isValidPageSize(arg1) && arg1 : cb = arg1;
                break;
            case 2:
                if (arguments[0]!='number') {
                    cb=arg1; err=arg2
                }
                break;
            default:
                max=arg1; cb=arg2; err=arg3;
                break;
        }
        max = max || this.resultsPerPage
        var params = getPropsOf(this.filters, {part: this.parts.join(',')},
            {maxResults: max}, {key: APIKey})
        doRequest(resource, params, cb, err)
        return this
    }

    function search(q) {
        var newList = new Videos(this)
        newList.filters['q'] = q
        newList._resource = 'search'
        newList.parts.length = 0
        newList.parts.push('snippet')
        delete newList.filters['pageToken']
        return newList
    }

    function filter(filters) {
        var newList = new Videos(this)
        for (var attr in filters) {
            if (filters.hasOwnProperty(attr)) newList.filters[attr] = filters[attr]
        }
        delete newList.filters['pageToken']
        newList._resource = resource
        return newList
    }

    function nextChunk(max, cb, err) {
        if (!nextToken) {
            throw "Must call fetch() before requesting next chunk of data."
        }
        this.filters['pageToken'] = nextToken
        return this.fetch(max, cb, err)
    }

    function doRequest(resource, params, cb, err) {
        var url = [baseUrl, resource, '?', qs.stringify(params)].join('')
        cb = cb || function(b) {}
        err = err || function(e) {}
        request(url, (error, response, body) => {
            $resolved = true
            if (error) {
                err(error)
            }
            else {
                body = JSON.parse(body)
                if (response.statusCode!=200) {
                    err(body.error)
                    console.error(body.error)
                }
                else {
                    onResolved(body, cb)
                }
            }
        })
    }

    function onResolved(body, cb) {
        nextToken = body.nextPageToken
        totalResults = body.pageInfo.totalResults
        body.items.forEach((item) => {
            this.push(new Video(getPropsOf(item, this)))
        })
        cb(this)
    }

    function setResultsPerPage(value) {
        isValidPageSize(value)
        resultsPerPage = value
    }
}


/*
 * The Video class represents a Youtube video. It doesn't offer much functionally
 * but a helper function to retrieve related videos. You should not directly
 * create instances of Video. They are generally created when fetching videos
 * in Videos class instances.
 */
function Video(props) {
    props = props || new Object()
    var listProps = getPropsOf(props),
        videoProps = getPropsOf(listProps)

    // When initialized from Videos, Video may receive properties from
    // the Videos.prototype, which are not part of a Youtube video, so
    // we should remove these properties before bootstraping the instance.
    Object.getOwnPropertyNames(new Videos()).map((prop) => {
        delete videoProps[prop]
    })

    Object.getOwnPropertyNames(videoProps).map((prop) => {
        this[prop] = videoProps[prop]
    })

    this.relatedVideos = getRelatedVideos.bind(this)
    
    function getRelatedVideos() {
        if (!this.id) {
            throw "This video doesn't have id"
        }

        var result = new Videos(listProps).search()

        // clear any previously applied filter
        Object.getOwnPropertyNames(result.filters).map((prop) => {
            delete result.filters[prop]
        })
        return result.filter({relatedToVideoId: this.id.videoId, type: 'video'})
    }
}

function isValidPageSize(value) {
    if (value < 1 || value > 50) {
        throw "resultsPerPage should be between 1 and 50."
    }
    return true
}

function getPropsOf() {
    var result = {}
    for (let inx in arguments) {
        if (arguments.hasOwnProperty(inx)) {
            let source = arguments[inx]
            for (let attr in source) {
                if (source.hasOwnProperty(attr)) result[attr] = source[attr]
            }
        }
    }
    return result;
}

module.exports = {
    'Youtube': Youtube,
    'Videos': Videos
}
