// const request = require('request')
// const module = require('../.')
// const assert = require('assert')


// describe('Youtube class', () => {
//     it('Should create a Youtube instance with access to resource props', () => {
//         let yt = new module.Youtube('key');
//         assert.equal(yt.key, 'key');
//         assert.ok('videos' in yt, 'Youtube clas should offer a "videos" property.');
//         assert.equal(yt.videos.key, 'key', 'Resources must inherit key property.');
//         assert.ok(Array.isArray(yt.videos), 'Videos property should be an Array.')
//         assert.ok('call' in yt.search, 'Search property should be an closure.')
//     });
// })