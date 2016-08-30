var requests = require('request'),
    qs = require('querystring'),
    baseUrl = 'https://www.googleapis.com/youtube/v3/'

function Youtube(APIKey) {
    var config = {APIKey: APIKey}
    return {
        videos: new Videos(config)
    }
}

function Videos(linkedList) {
    linkedList = linkedList || new Object()
    var requestsFilters = linkedList['filters'] || {chart: 'mostPopular'},
        requestedParts = linkedList['parts'] || ['id', 'snippet'],
        resultsPerPage = linkedList['resultsPerPage'] || 5,
        APIKey = linkedList['APIKey'],
        nextToken, totalResults, $resolved;

    var videosList = [], proto = {
        getById: {value: getById},
        fetch: {value: fetch},
        filters: {value: requestsFilters},
        filter: {value: filter},
        parts: {value: requestedParts},
        totalResults: {value: totalResults},
        resultsPerPage: {value: resultsPerPage},
        next: {value: nextChunk()},
        $resolved: {get: getResolved}
    }

    return Object.create(videosList, proto)

    // implementation
    function getById(videoId) {
        return this.push(Math.PI)
    }

    function getResolved() {
        return $resolved || false
    }

    function fetch(arg1, arg2, arg3) {
        var max, cb, err
        $resolved = false;
        switch (arguments.length) {
            case 1:
                typeof(arguments[0])=='number' ? max=arg1 : cb = arg1;
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
        doRequest.bind(this)('videos', params, cb, err)
    }

    function filter(filters) {
        var newList = new Videos(this)
        for (var attr in filters) {
            if (filters.hasOwnProperty(attr)) newList.filters[attr] = filters[attr]
        }
        return newList
    }

    function nextChunk(cb) {

    }

    function doRequest(resource, params, cb, err) {
        var url = [baseUrl, resource, '?', qs.stringify(params)].join('')
        cb = cb || function() {}
        err = err || function() {}
        requests(url, function(error, response, body) {
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
        }.bind(this))
    }

    function onResolved(body, cb) {
        nextToken = body.nextPageToken
        totalResults = body.pageInfo.totalResults
        body.items.forEach(function(item) {
            this.push(item)
        }.bind(this))
        cb(this)
    }
}

function getPropsOf() {
    var result = {}
    for (inx in arguments) {
        if (arguments.hasOwnProperty(inx)) {
            var source = arguments[inx]
            for (var attr in source) {
                if (source.hasOwnProperty(attr)) result[attr] = source[attr]
            }
        }
    }
    return result;
}

module.exports['Youtube'] = Youtube
module.exports['Videos'] = Videos
