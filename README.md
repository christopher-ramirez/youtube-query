# Youtube Query

`youtube-query` tries to be an utility to easy query public information on Youtube, like popular videos, public playlists, etc.

This library tries to greatly simplify the retrieval of public Youtube graph data, so it can be easily used in robots, utilities, webapps etc.

```javascript
    const Youtube = require('youtube-query')
    const APIKey = 'secret-key'

    const client = new Youtube(APIKey)

    // get the lastest 10 popular Videos on Youtube
    client.videos.fetch(10, (err, videos) => {
        let lastest10Popular = videos
    })

    // get the lastest 10 popular videos in Mexico
    client.video.filter({regionCode: 'MX'}).fetch(10, (err, videos) => { ... })
    // Please see https://developers.google.com/youtube/v3/docs/videos/list#parameters
    // for a complete list and documentation of available parameters

    // search Youtube
    client.search('funny videos').fetch(10, (err, videos) => {
        // once resolved, fetch the next 20 funny videos
        videos.next(20, (err, nextVideos) => {
            // ...
        })
    })
```