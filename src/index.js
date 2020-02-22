import {likeCache} from './like-cache'
import {intercept} from './api-interceptor'
import {handleFirstArticle, handleArticleMutations} from './article-observer';
import {handleFirstGrid, handleGridMutations} from './grid-observer';

(function(window) {
    'use strict'

    const GRID_POST_DATA = 'e769aa130647d2354c40ea6a439bfc08'
    const PROFILE_DATA = 'c9100bf9110dd6361671f113dd02e7d6'
    const FEED_DATA = 'be74df6f00b60e676929508979bee98c'

    window.likeCache = likeCache

    // intercept api calls to retreive likes data from responses
    // it should reduce extra requests (ig have pretty strict rate limits)
    intercept(window, (res) => {
        let m = res._url.match(/query_hash=(.*)&/)
        if(!m) return

        let queryHash = m[1]
        // if(queryHash === GRID_POST_DATA) {
        //     let gridData = JSON.parse(res.responseText)
        //     let posts = gridData.data.user.edge_owner_to_timeline_media.edges
        //     //console.log(posts)
        //     posts.forEach(p => {
        //         likeCache.push({
        //             shortcode: p.node.shortcode,
        //             likes: p.node.edge_media_preview_like.count,
        //             comments: p.node.edge_media_to_comment.count,
        //         })
        //     })
        // } else if (queryHash === FEED_DATA) {
        //     let feedData = JSON.parse(res.responseText)
        //     let posts = feedData.data.user.edge_web_feed_timeline.edges
        //     posts.forEach(p => {
        //         likeCache.push({
        //             shortcode: p.node.shortcode,
        //             likes: p.node.edge_media_preview_like.count,
        //             comments: p.node.edge_media_preview_comment.count,
        //         })
        //     })
        // } else 
        if (queryHash === PROFILE_DATA) {
            let grid = Array.from(document.querySelectorAll('.v1Nh3.kIKUG._bz0w'))
            handleFirstGrid(grid)
        }
    })

    setTimeout(() => {
        let firstArticles = document.querySelectorAll('article')
        //console.log(firstArticles)
        handleFirstArticle(firstArticles)

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
