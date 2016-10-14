let request = require('request'),
    qs = require('querystring');

const baseUrl = 'https://www.googleapis.com/youtube/v3/';
const cantCallNext = 'Can\'t call next() if no records where previously fetched.';

// Resource implements the basic functionallity required
// to retrieve Youtube resources, live fetching and handling
// results state
const Resource = {
    'maxResults': 5,
    'resource': undefined,
    'filter': filter,
    'fetch': fetch,
    'next': nextChunk,
    'sendRequest': sendRequest,
    'onResolveRequest': onResolveRequest,
    'settingsToRequestParams': settingsToRequestParams,
    'getTotalResults': getTotalResults,

    // elementFactory should be overriden by inherited resources.
    // This function is used as a factory to generate proper
    // elements for the current resource, e.g. Videos elements for
    // a `Videos' resource list.
    'elementFactory': (e) => {return e}
};

/*
 * createResource returns an Array which implements methods for fetching
 * Youtube resources limited by predefined properties.
 *
 * Normally you would not directly call createResource, instead you should use
 * the specialized factories suitable for each Youtube resource. e.g.:
 * createVideosResource, createPlaylistResource, etc.
 */
function createResource(parent) {
    let props = {};
    Object.assign(props, Resource);
    props.key = parent.key;
    props.parent = parent;
    props.filters = {};
    props.parts = ['id', 'snippet'];

    let resource = [];
    Object.assign(resource, props)
    return resource;
};

function filter(filters) {
    // updates resource filters property
    Object.assign(this.filters, filters);
    return this;
};

function fetch(arg1, arg2, arg3) {
    // fetch resources
    let max, cb, err;
    this.$resolved = false;
    switch (arguments.length) {
        case 1:
            typeof arguments[0] == 'number' ? max=isValidPageSize(arg1) && arg1 : cb = arg1;
            break;
        case 2:
            if (typeof arguments[0]!='number') {
                cb=arg1; err=arg2
                break;
            }
            // else (if first arg is number, let fallback to default)
        default:
            max=arg1; cb=arg2; err=arg3;
            break;
    }
    max = max || this.maxResults;
    var params = this.settingsToRequestParams();
    params = Object.assign(params, {maxResults: max});
    let url = [baseUrl, this.resource, '?', qs.stringify(params)].join('');
    this.sendRequest(url, cb, err);

    return this;
};

function nextChunk(max, cb, err) {
    // fetch the next part of current resource list.
    if (!this._nextPageToken) {
        throw(cantCallNext);
    };

    return this.filter({'pageToken': this._nextPageToken})
               .fetch(max, cb, err)
               .filter({'pageToken': undefined})
};

function sendRequest(url, cb=Function.prototype, err=Function.prototype) {
    request(url, (error, response, body) => {
        this.$resolved = true;
        if (error) {
            if (err) return err(error);
            return cb(err)
        }

        body = JSON.parse(body);
        if (response.statusCode != 200) {
            err(body.error);
        }
        else {
            this.onResolveRequest(body, cb);
        };
    });
};

function onResolveRequest(body, cb) {
    this._nextPageToken = body.nextPageToken;
    this._totalResults = body.pageInfo.totalResults;
    body.items.forEach((item) => {
        this.push(this.elementFactory(item));
    });

    cb(null, this);
};

function settingsToRequestParams() {
    // This function creates a single object having all resource configuration
    // merged and optionally adapted so `querystring' can convert them into a
    // string of url request params. This function is part of the resource
    // object because specialized factories may desire to override this
    // implemetation.
    return  Object.assign({}, this.filters, {part: this.parts.join(',')},
                          {key: this.key});
};

function getTotalResults() {
    return this._totalResults || -1;
};

function isValidPageSize(value) {
    if (value < 1 || value > 50) {
        throw "maxResults should be between 1 and 50."
    };

    return true;
};


module.exports = {
    'Resource': Resource,
    'createResource': createResource,
    'isValidPageSize': isValidPageSize
};
