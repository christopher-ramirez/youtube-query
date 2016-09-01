'use strict'

var request = require('request'),
    testedMod = require('../.'),
    sinon = require('sinon'),
    assert = require('assert')

sinon.stub(request, 'Request', function testReponse(params) {
    params.callback(undefined, {statusCode: 200}, JSON.stringify({
        nextPageToken: 'abcde',
        pageInfo: {totalResults: 0},
        items: [{id: {videoId: '123'}}, 2, 3]
    }))
})

describe('Videos class', () => {
    it('Should create an empty array with default props', () => {
        var videos = new testedMod.Videos()
        assert.equal(videos.length, 0)
        assert.equal(videos.parts.join(','), 'id,snippet')
        assert.ok('chart' in videos.filters, '"chart" should be a default filters')
    })

    it('Should fetch videos with optional page lengh', () => {
        var videos = new testedMod.Videos()
        var result = videos.fetch(10)
        assert.ok(request.Request.calledOnce, 'fetch should have call Youtube HTTP API.')
        assert.ok(request.Request.calledWithMatch(
            sinon.match.has('uri', sinon.match('maxResults=10'))),
            'Wasn\'t called with spected "length" value.')
    })

    it('Should pass filter and parts settings', () => {
        var videos = new testedMod.Videos()
        assert.ok(request.Request.calledWithMatch(
            sinon.match.has('uri', sinon.match('chart=mostPopular'))),
            'Wasn\'t called with spected "chart" value.')
        assert.ok(request.Request.calledWithMatch(
            sinon.match.has('uri', sinon.match('part=' + videos.parts.join('%2C')))),
            'Wasn\'t called with spected "parts" property value.')
    })

    it('Should keep linked filters', () => {
        var videos = testedMod.Videos(),
            videos2 = videos.filter({bar: 'foo'})
        videos2.fetch()
        assert.ok(request.Request.calledWithMatch(
            sinon.match.has('uri', sinon.match('bar=foo'))),
            'Wasn\'t called with spected "bar" value.')
    })

    it('Should fetch next 10 results', () => {
        var videos = new testedMod.Videos()
        videos.fetch()
        videos.next(10)
        assert.ok(request.Request.calledWithMatch(
            sinon.match.has('uri', sinon.match(/pageToken=abcde/))),
            'Wasn\'t called with spected "pageToken" required for next() to work.')
        assert.ok(request.Request.calledWithMatch(
            sinon.match.has('uri', sinon.match('maxResults=10'))),
            'Wasn\'t called with spected "length" value.')
    })

    describe('Search functionality', () => {
        it('Should send query', () => {
            var videos = new testedMod.Videos(),
                s = videos.search('workout')
            s.fetch()
            assert.ok(request.Request.calledWithMatch(
                sinon.match.has('uri', sinon.match('q=workout'))),
                'Wasn\'t called with spected "query" value.')
        })
    })

})

describe('Video class', () => {
    it('Should retrieve related videos', () => {
        testedMod.Videos().fetch(videos => {
            var video = videos[0]
            video.relatedVideos().fetch()
            assert.ok(request.Request.calledWithMatch(
                sinon.match.has('uri', sinon.match('relatedToVideoId=123'))),
                'Wasn\'t called with spected "relatedToVideoId" param.')
        })
    })
})