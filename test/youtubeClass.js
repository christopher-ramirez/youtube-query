const Youtube = require('../.').Youtube
const expect = require('chai').expect

describe('Youtube class', () => {
    let instance = new Youtube('key');

    it('should keep the key', () => {
        expect(instance.key).to.equal('key')
    })

    describe('videos property', () => {
        const videos = instance.videos

        it('should be an array', () => {
            expect(Array.isArray(videos)).to.be.ok
        })

        it('should have be a Resource instance', () => {
            expect('filter' in videos).to.be.ok
            expect('next' in videos).to.be.ok
        })

        it('should have a resource property iqual to "videos"', () => {
            expect(videos.resource).to.equal('videos')
        })
    })

    describe('search property', () => {
        const search = instance.search('aq')

        it('should be a closure', () => {
            expect('call' in instance.search).to.be.ok
        })

        it('should build a resource when called', () => {
            expect('filter' in search).to.be.ok
            expect('next' in search).to.be.ok
        })
        
        it('should perform a search on Youtube', () => {
            expect('q' in search.filters).to.be.ok
            expect(search.resource).to.equal('search')
        })
    })
})