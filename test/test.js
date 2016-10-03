'use strict'

var request = require('request'),
    { Youtube } = require('../.'),
    { Resource } = require('../lib/resource.js'),
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
    let youtube = new Youtube('key');
    it('Should create a Youtube instance with access to resource props', () => {
        assert.equal(youtube.key, 'key');
        assert.ok('videos' in youtube, '"Youtube" class should offer a "videos" property.');
    });

    it('Youtube.video property be a factory', () => {
        assert.notEqual(youtube.videos, youtube.videos, 'Subsecuent read of `videos` should return a new instance')
    })

    describe('Youtube.videos property', () => {
        let videos = youtube.videos;

        it('Must inherit "key" property.', ()=> {
            assert.equal(videos.key, 'key');
        })

        it('Must be an array', () => {
            assert.ok(Array.isArray(videos), '"videos" property should be an Array.')
        })

        it("Should have all Resource properties", () => {
            Object.getOwnPropertyNames(Resource).forEach((prop) => {
                assert.ok(prop in videos, `"${prop}" not in videos.`)
            })
        })
    })

    describe('Youtube.search property', () => {
        let search = youtube.search;

        it("Should be a closure", () => {
            assert.ok('call' in search, '"search" property should be a closure.')
        })

        it('Should throw when called without a query value', () => {
            assert.throws(() => { search() },
                          /provide a search query/, 'We were expecting an error here.')
        })

        it('Should NOT throw when called with a query value', () => {
            assert.doesNotThrow(() => { search('query') },
                                Error, 'We were NOT expecting an error here.')
        })
    })
})
