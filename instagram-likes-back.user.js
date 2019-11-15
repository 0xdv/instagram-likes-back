// ==UserScript==
// @name         instagram-likes-back
// @namespace    instagram-likes-back
// @version      0.0.1
// @description  See likes in Instagram again
// @author       0xC0FFEEC0DE
// @include      https://*.instagram.com/*
// @license      MIT
// ==/UserScript==

(function() {
    'use strict'

    let articleObserver = new MutationObserver(function(mutations) {
        let articleMutations = Array.prototype.filter.call(mutations, m => m.target.className === 'PdwC2 _6oveC Z_y-9')
        if (articleMutations.length === 0) return

        let article = selectArticle(articleMutations)
        if (!article) return

        let shortCode = getShortCode(article)

        requrestLikesCount(shortCode)
        .then(likes => {
            injectLikesValue(article, likes)
        })
        .catch(err => {
            console.error(err)
        })
    }).observe(document.body, {
        subtree: true,
        childList: true,
    })

    function selectArticle(articleMutations) {
        let [[article]] = articleMutations
            .filter(m => m.addedNodes[0] && m.addedNodes[0].nodeName === 'ARTICLE')
            .map(m => m.addedNodes)
        return article
    }

    function getShortCode(article) {
        //console.log(article)
        return article.querySelector('.c-Yi7').href.split('/').slice(-2,-1).pop()
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