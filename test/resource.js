const request = require('request')
const createResource = require('../lib/resource').createResource
const simple = require('simple-mock')
const expect = require('chai').expect

describe('Resource', () => {
    const resource = createResource({key: 'abc'})
    
    it('should be an array', () => {
        expect(Array.isArray(resource)).to.be.ok
    })

    it('should inherit parent key', () => {
        expect(resource.key).to.equal('abc')
    })

    it('should start with empty filters', () => {
        expect(resource.filters).to.deep.equal({})
    })

    it('initially getTotalResults() should return -1', () => {
        expect(resource.getTotalResults()).to.equal(-1)
    })

    it('filter() should update filters property', () => {
        resource.filter({a: 'a'})
        expect(resource.filters).to.deep.equal({a: 'a'})
    })

    it('filter() should expand filters property', () => {
        resource.filter({b: 'b'})
        expect(resource.filters).to.deep.equal({a: 'a', b: 'b'})
    })

    describe('Internal interaction with Youtube API', () => {
        const sendReqMock = simple.mock(resource, 'sendRequest')
        
        describe('fetch() polymorphisms', () => {
            /* fetch() is a polymorphism function.
             * when its first parameter is a number, it is taken as `maxResults'
             * for the request to Youtube. In this case, the second argument will
             * be a success callback.
             * 
             * If the first parameter is a function, then we treat it as a success
             * callback, the second argument (if any) if an rejection handler.
             */ 
            it('should handle numbers as first parameter', () => {
                resource.fetch(44)
                expect(sendReqMock.lastCall.arg).to.contain('&maxResults=44')
            })

            it('should handle number as first and success callback as second', () => {
                const success = () => {}
                resource.fetch(10, success)
                expect(sendReqMock.lastCall.args[1]).to.equal(success)
            })

            it('params for success and rejection callbacks', () => {
                const success = () => {}
                const reject = () => {}
                resource.fetch(success, reject)
                expect(sendReqMock.lastCall.args[1]).to.equal(success)
                expect(sendReqMock.lastCall.args[2]).to.equal(reject)                
            })
        })

        it('should pass auth key', () => {
            resource.fetch()
            expect(sendReqMock.lastCall.arg).to.contain('key=abc')
        })

        it('should handle filters as request params', () => {
            resource.filters = {}
            resource.filter({prop1: 'value1', prop2: 'value2'})
            resource.fetch()
            Object.getOwnPropertyNames(resource.filters).forEach(prop => {
                expect(sendReqMock.lastCall.arg)
                    .to.contain(`${prop}=${resource.filters[prop]}`)
            })
        })

        it('should handle parts setting', () => {
            resource.fetch()
            expect(sendReqMock.lastCall.arg)
                .to.contain(`&part=${resource.parts.join('%2C')}`)
        })

        describe('next()', () => {
            it('expect next() to pass nextPageToken', () => {
                const mockedBody = {
                    nextPageToken: 'abc',
                    pageInfo: {},
                    items: []
                }

                resource.onResolveRequest(mockedBody, Function.prototype)
                resource.next()
                expect(sendReqMock.lastCall.arg).to.contain('pageToken=abc')
            })
        })
    })
})