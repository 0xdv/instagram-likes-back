// ==UserScript==
// @name         Instagram Likes Back
// @namespace    instagram-likes-back
// @version      0.0.5
// @description  See likes in Instagram again
// @homepageURL  https://github.com/0xC0FFEEC0DE/instagram-likes-back
// @supportURL   https://github.com/0xC0FFEEC0DE/instagram-likes-back/issues
// @downloadURL  https://raw.githubusercontent.com/0xC0FFEEC0DE/instagram-likes-back/master/instagram-likes-back.user.js
// @updateURL    https://raw.githubusercontent.com/0xC0FFEEC0DE/instagram-likes-back/master/instagram-likes-back.user.js
// @author       0xC0FFEEC0DE
// @include      https://*.instagram.com/*
// @license      MIT
// ==/UserScript==

(function() {
    'use strict'

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

        requrestLikesCount(shortCode)
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

    function requrestLikesCount(shortcode) {
        return postData(shortcode)
        .then(resp => {
            return resp.data.shortcode_media.edge_media_preview_like.count
        })
    }

    function postData(shortcode) {
        const url = '/graphql/query/'

        let params = {
            'query_hash': 'fead941d698dc1160a298ba7bec277ac',
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

})()
