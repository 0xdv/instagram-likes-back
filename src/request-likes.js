export function requrestLikesCount(shortcode) {
    return postData(shortcode)
            .then(resp => {
                return resp.data.shortcode_media.edge_media_preview_like.count
            })
}

const POST_DATA = 'fead941d698dc1160a298ba7bec277ac'

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