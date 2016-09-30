'use strict'

var request = require('request'),
    mod = require('../.'),
    sinon = require('sinon'),
    assert = require('assert')

sinon.stub(request, 'Request', function testReponse(params) {
    params.callback(undefined, {statusCode: 200}, JSON.stringify({
        nextPageToken: 'abcde',
        pageInfo: {totalResults: 0},
        items: [{id: {videoId: '123'}}, 2, 3]
    }))    
})

describe('Youtube class', () => {
    it('Should create a Youtube instance with access to resource props', () => {
        let yt = new mod.Youtube('key');
        assert.equal(yt.key, 'key');
        assert.ok('videos' in yt, 'Youtube clas should offer a "videos" property.');
        assert.equal(yt.videos.key, 'key', 'Resources must inherit key property.');
        assert.ok(Array.isArray(yt.videos), 'Videos property should be an Array.')
        assert.ok('call' in yt.search, 'Search property should be an closure.')
    });
})