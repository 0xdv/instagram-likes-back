// ==UserScript==
// @name         Instagram Likes Back
// @namespace    instagram-likes-back
// @version      0.1.0
// @description  See likes in Instagram again
// @homepageURL  https://github.com/0xdv/instagram-likes-back
// @supportURL   https://github.com/0xdv/instagram-likes-back/issues
// @downloadURL  https://raw.githubusercontent.com/0xdv/instagram-likes-back/master/instagram-likes-back.user.js
// @updateURL    https://raw.githubusercontent.com/0xdv/instagram-likes-back/master/instagram-likes-back.user.js
// @author       0xC0FFEEC0DE
// @include      https://*.instagram.com/*
// @license      MIT
// ==/UserScript==

(function(window) {
    'use strict'

    const GRID_POST_DATA = '2c5d4d8b70cad329c4a6ebe3abb6eedd'
    const POST_DATA = 'fead941d698dc1160a298ba7bec277ac'

    let likeCache = {}

    // intercept api calls to retreive likes data from responses
    // it should reduce extra requests (ig have pretty strict rate limits)
    ;(function ApiInterceptor(window, onLoad) {
        const realFetch = window.fetch
        const realXHRsend = XMLHttpRequest.prototype.send
        const realXHRopen = XMLHttpRequest.prototype.open

        // intercept fetch
        // window.fetch = function() {
        //     let promise = realFetch.apply(this, arguments)
        //     promise.then(onLoad)
        //     return promise
        // }

        // intercept XHR
        XMLHttpRequest.prototype.open = function(method, url) {
            this._method = method
            this._url = url
            realXHRopen.apply(this, arguments)
        }
        XMLHttpRequest.prototype.send = function() {
            this.addEventListener('load', function() {
                //console.log('inter')
                //console.log(this.responseText)
                onLoad(this)
            })
            
            realXHRsend.apply(this, arguments)
        }
    })(window, (res) => {
        let m = res._url.match(/query_hash=(.*)&/)
        if(!m) return

        let queryHash = m[1]
        if(queryHash !== GRID_POST_DATA) return

        console.log('intersepted')
        //console.log(res.responseText)
        let gridData = JSON.parse(res.responseText)
        let posts = gridData.data.user.edge_owner_to_timeline_media.edges
        console.log(posts)
        posts.forEach(p => {
            let countInfo = {
                shortcode: p.node.shortcode,
                likes: p.node.edge_media_preview_like.count,
                comments: p.node.edge_media_to_comment.count,
                timestamp: Date.now(),
            }

            likeCache[countInfo.shortcode] = countInfo
        })
        console.log(likeCache)
    })


    setTimeout(() => {
        let firstArticles = document.querySelectorAll('article')
        //console.log(firstArticles)
        firstArticles.forEach(process)
    }, 1000)

    let articleObserver = new MutationObserver(function(mutations) {
        //console.log(mutations)
        mutations = Array.from(mutations)

        // like
        let m = mutations.find(m => m.target.className === 'ltpMr Slqrh' && m.addedNodes[0])
        if (m) {
            return setTimeout(() => {
                process(m.target.closest('article'))
            }, 1000) // need some delay to update data on server
        }

        let article = (() => {
            // on post open
            let mutation = mutations.filter(m => m.target.className === 'PdwC2 _6oveC Z_y-9')[0]
            return mutation && selectArticle(mutation)
        })()

        article = article || (() => {
            // on feed scroll
            let t = mutations.filter(m => m.target.nodeName === 'DIV')
                .filter(m => m.addedNodes[0] && m.addedNodes[0].nodeName === 'ARTICLE')
            return t[0] && t[0].addedNodes[0]
        })()

        article = article || (() => {
            // post re-open
            let t = mutations.filter(m => m.target.nodeName === 'BODY')
                .filter(m => m.addedNodes[0] && m.addedNodes[0].className === '_2dDPU vCf6V')
            return t[0] && selectArticle(t[0])
        })()

        if (!article) return
        process(article)

    }).observe(document.body, {
        subtree: true,
        childList: true,
    })

    function process(article) {
        let shortCode = getShortCode(article)
        if (!shortCode) return

        getLikesCount(shortCode)
        .then(likes => {
            injectLikesValue(article, likes)
        })
        .catch(err => {
            console.error(err)
        })
    }

    function selectArticle(articleMutations) {
        return articleMutations.target.querySelector('article.M9sTE')
    }

    function getShortCode(article) {
        //console.log(article)
        let link = article.querySelector('.c-Yi7')
        return link && link.href.split('/').slice(-2,-1).pop()
    }

    function getLikesCount(shortcode) {
        return likeCache[shortcode] ? Promise.resolve(likeCache[shortcode].likes) : requrestLikesCount(shortcode)
    }

    function requrestLikesCount(shortcode) {
        return postData(shortcode)
        .then(resp => {
            return resp.data.shortcode_media.edge_media_preview_like.count
        })
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

    function injectLikesValue(article, likes) {
        let likesSection = findInjectionPlace(article)
        
        let btn = likesSection.querySelector('button')
        if (!btn) return // no likes

        btn.textContent = `${Number(likes).toLocaleString()} likes`
        likesSection.innerHTML = ""
        likesSection.appendChild(btn)
    }

    function findInjectionPlace(article) {
        // img or video
        return article.querySelector('.Nm9Fw, .HbPOm._9Ytll')
    }

})(window)
