# Youtube Query

`youtube-query` is a library to easily query public information on Youtube, like popular videos, public playlists, etc.

This library tries to greatly simplify the retrieval of public Youtube graph data, so it can be easily used in robots, utilities, webapps, etc.

To install, run:
```
    $ npm install youtube-query
```

To use this library you'll need a Youtube (Data API)[https://developers.google.com/youtube/v3/] key.

#Examples

### Retrieve videos
```javascript
    const Youtube = require('youtube-query')
    const client = new Youtube(youAPISecretKey)

    // get the lastest popular videos
    client.videos.fetch((err, videos) => {
        ...
    })

    // We can also apply filters to retrieved videos.
    // See https://developers.google.com/youtube/v3/docs/videos/list 
    const mxVideos = client.videos.filter({regionCode: 'MX'})
    mxVideos.fetch((err, videos) => {
        console.log(videos)
    })

    // we can also fetch the next page of videos
    mxVideos.next((err, videos) => {
        console.log('Next page fetched', videos)
    })
```

### Searching
```javascript
    const Youtube = require('youtube-query')
    const APIKey = 'secret-key'
    const client = new Youtube(APIKey)

    // Search Youtube
    // (`fetch` and `next` can optionally accepts a page size as first argument)
    client.search('funny videos').fetch(10, (err, videos) => {
        // once resolved, fetch the next 20 funny videos
        videos.next(20, (err, nextVideos) => {
            // ...
        })
    })

    // Only perform a playlist search
    housePlaylists = client.search('house music').filter({type: 'playlist'})
    housePlaylists.fetch((err, playlists) => {
        ...
    })
```

# API
**Youtube** class has the `videos`, `search`, and `playlists` properties. These all properties are inherited from a base *Resource* class which is an extended array.

## *Resource* class
All resources available through **Youtube** class are inherited from this class. So, in all of them the following methods and properties are available:

#### maxResults: integer
The default number of resources to return in a request. Max posible value is 50.

#### filter: fn(object)
Updates the resource list filters. This method does not replaces the current filters with new received one. Instead it extends the currently existing filters.

#### filters: object
Defined filters for the resource.

#### fetch: fn([pageSize: integer, [fn(err, value)]])
Retrieves the first resource page. It optionally accepts as first argument the page size to return. Otherwise it will use `maxResults` property value. The second argument is a callback which will received returned resources.

#### next: fn([pageSize: integer, [fn(err, value)]])
Retrieves subsequent resource pages. Pushing the newly returned resources at the end of the array.

#### getTotalResults: fn()
Returns the total count of resources in the backend for the current resource. This is different to `length` property. `length` represents the count of already fetched resources while `getTotalResults()` represents the total count of resources available for retrieval.
