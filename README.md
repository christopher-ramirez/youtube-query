# Youtube Query
Node Package useful for quering Youtube data using the Youtube Data API v3.

Useful for querying and searching videos.

### Installation (STILL NOT PUBLISHED IN NPM)
    $  npm install ????


### Base functionality

```javascript
    Youtube = require('youtube-query').Youtube
    
    var myAPIKey = '---secret-api-key-----',
        youtubeClient = new Youtube(myAPIKey)
        
    // Get lastest 10 popular videos
    var lastestVideos = youtubeClient.videos.fetch(10)
    console.log(lastestVideos)
    
    // fetch next 10 popular videos
    lastestVideos.next(10)
    
    // get popular videos in mx
    var mxLastestVideos = lastestVideos.filter({regionCode: 'MX'})
    mxLastestVideos.fetch()
    
    // search over Mexico popular videos
    var mxVideosSearch = mxLastestVideos.search('azteca')
    mxVideosSearch.fetch(10)
    
    // search science channels
    var channels = youtubeClient.videos.search('science').filter({type: 'channel'})
```

### API Documentation
#### Youtube class
Base class which provides access to videos. Requires an API Key to be initializated.

#### Properties
Property | Definition | Description
--- | --- | ---
**videos** | [Videos](#videos-class) | A list of most recent popular videos |

#### Videos class
A class inherited from Array. Implements a list of videos.

##### Properties
Property | Definition | Description
--- | --- | ---
**fetch** | `function(max, callback, errorCallback)` | Fetchs part/page of the list of videos. Call `next()` to fetch the next part. |
**next** | `function(max, callback, errorCallback)` | Fetch next page of results. |
**search** | `function(queryString)` | Returns an Instance of `Videos` for retrieving search results for `queryString`. |
**filters** | `Object` | An object of filters and params to be used for the query. |
**filter** | `function(filterObject)` | Returns an instance of `Videos` with its property `filters` extended with values in `filterObject` |
**parts** | Array | A list of one or more **video** resource properties that the API response will include. |
**totalResults** | Integer | Total videos which cumplies with applied query filters. |
**resultsPerPage** | Integer | Default page size used in `fetch()` and `next()` |
**$resolved** | Bool | `true` when a API request is resolved. `false` otherwise. |

### TODO:
* Retrieve handling of Playlists
* Implement Video class (`video.releatedVideos`)
  
