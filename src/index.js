import {likeCache} from './like-cache'
import {intercept} from './api-interceptor'
import {handleFirstArticled, handleArticleMutations} from './article-observer';
import {handleFirstGrid, handleGridMutations} from './grid-observer';

(function(window) {
    'use strict'

    const GRID_POST_DATA = '2c5d4d8b70cad329c4a6ebe3abb6eedd'

    window.likeCache = likeCache

    // intercept api calls to retreive likes data from responses
    // it should reduce extra requests (ig have pretty strict rate limits)
    intercept(window, (res) => {
        let m = res._url.match(/query_hash=(.*)&/)
        if(!m) return

        let queryHash = m[1]
        if(queryHash !== GRID_POST_DATA) return

        let gridData = JSON.parse(res.responseText)
        let posts = gridData.data.user.edge_owner_to_timeline_media.edges
        //console.log(posts)
        posts.forEach(p => {
            likeCache.push({
                shortcode: p.node.shortcode,
                likes: p.node.edge_media_preview_like.count,
                comments: p.node.edge_media_to_comment.count,
            })
        })
    })

    setTimeout(() => {
        let firstArticles = document.querySelectorAll('article')
        //console.log(firstArticles)
        handleFirstArticled(firstArticles)

        let grid = Array.from(document.querySelectorAll('.v1Nh3.kIKUG._bz0w'))
        handleFirstGrid(grid)
    }, 500)

    let articleObserver = new MutationObserver(handleArticleMutations)
    .observe(document.body, {
        subtree: true,
        childList: true,
    })

    let gridObserver = new MutationObserver(handleGridMutations)
    .observe(document.body, {
        subtree: true,
        childList: true,
    })

})(window)
