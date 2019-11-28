import {likeCache} from './like-cache'

const POST_DATA = 'fead941d698dc1160a298ba7bec277ac'

export function requestLikesCount(shortcode, noCache) {
    let cached = !noCache && likeCache.get(shortcode)
    if (cached) {
        console.log('found in cache')
        return Promise.resolve(cached.likes)
    }

    console.log('no cache', shortcode)
    return postData(shortcode)
            .then(cacheResult)
            .then(d => {
                return d.likes
            })
}

export function requestPostInfo(shortcode) {
    let cached = likeCache.get(shortcode)
    if(cached) {
        console.log('from cache')
        return Promise.resolve(cached)
    }

    console.log('no cache', shortcode)
    return postData(shortcode)
            .then(cacheResult)
}

function postData(shortcode) {
    const url = '/graphql/query/'

    let params = {
        'query_hash': POST_DATA,
        'variables': JSON.stringify({
            "shortcode": shortcode,
            "child_comment_count": 0,
            "fetch_comment_count": 0,
            "parent_comment_count": 0,
            "has_threaded_comments": true
        })
    }

    var query = Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&')
    
    return fetch(`${url}?${query}`).then(r => r.json())
}

function cacheResult(res) {
    let postData = res.data.shortcode_media
    let data = {
        shortcode: postData.shortcode,
        likes: postData.edge_media_preview_like.count,
        comments: postData.edge_media_to_parent_comment.count,
    }
    likeCache.push(data)
    return data
}