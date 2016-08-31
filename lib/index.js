'use strict'

var request = require('request'),
    qs = require('querystring'),
    baseUrl = 'https://www.googleapis.com/youtube/v3/'

function Youtube(APIKey) {
    var config = {APIKey: APIKey}
    return {
        videos: new Videos(config)
    }
}

function Videos(props) {
    props = props || new Object()
    var requestsFilters = props['filters'] ? getPropsOf(props['filters']) : {chart: 'mostPopular'},
        requestedParts = props['parts'] ? props['parts'].slice() : ['id', 'snippet'],
        resultsPerPage = props['resultsPerPage'] || 5,
        APIKey = props['APIKey'],
        nextToken, totalResults, $resolved, resource = 'videos';

    var proto = {
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

    return Object.create([], proto)

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
        doRequest.bind(this)(resource, params, cb, err)
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
                    onResolved.bind(this)(body, cb)
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

function Video(props) {
    props = props || new Object()
    var listProps = getPropsOf(props),
        videoProps = getPropsOf(listProps)

    // remove Videos.prototype properties
    Object.getOwnPropertyNames(new Videos()).map((prop) => {
        delete videoProps[prop]
    })

    Object.getOwnPropertyNames(videoProps).map((prop) => {
        this[prop] = videoProps[prop]
    })

    this.relatedTo = function getRelatedVideos() {
        var result = new Videos(listProps).search()

        // clear any previously applied filter
        Object.getOwnPropertyNames(result.filters).map((prop) => {
            delete result.filters[prop]
        })
        return result.filter({relatedToVideoId: this.id, type: 'video'})
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

module.exports['Youtube'] = Youtube
module.exports['Videos'] = Videos
module.exports['Video'] = Video
