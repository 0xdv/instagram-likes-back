// ==UserScript==
// @name         Instagram Likes Back
// @namespace    instagram-likes-back
// @version      0.0.3
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

    let articleObserver = new MutationObserver(function(mutations) {
        //console.log(mutations)
        let mutation = Array.prototype.filter.call(mutations, m => m.target.className === 'PdwC2 _6oveC Z_y-9')[0]

        if (!mutation) {
            let t = Array.prototype.filter.call(mutations, m => m.target.nodeName === 'BODY')
                .filter(m => m.addedNodes[0] && m.addedNodes[0].className === '_2dDPU vCf6V')
            mutation = t[0] || null
        }

        if (!mutation) return
        let article = selectArticle(mutation)
        if (article) {
            process(article)
        }
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
        // let [[article]] = articleMutations
        //     .filter(m => m.addedNodes[0] && m.addedNodes[0].nodeName === 'ARTICLE')
        //     .map(m => m.addedNodes)
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
                "child_comment_count": 3,
                "fetch_comment_count": 40,
                "parent_comment_count": 24,
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
        btn.textContent = `${Number(likes).toLocaleString()} likes`
        likesSection.innerHTML = ""
        likesSection.appendChild(btn)
    }

    function findInjectionPlace(article) {
        // img or video
        return article.querySelector('.Nm9Fw, .HbPOm._9Ytll')
    }

})()
