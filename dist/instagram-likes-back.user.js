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
// @grant        none
// @license      MIT
// ==/UserScript==
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/like-cache.js
const cache = {}

const likeCache = {
    push: (item) => {
        item.timestamp = new Date(Date.now())
        cache[item.shortcode] = item
        console.log('pushed', item)
        console.log('count = ', Object.keys(cache).length)
    },
    get: (shortcode) => {
        return cache[shortcode]
    },
    getAll: () => {
        return cache
    }
}
// CONCATENATED MODULE: ./src/api-interceptor.js
function intercept(window, onLoad) {
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
}
// CONCATENATED MODULE: ./src/request-likes.js


const POST_DATA = 'fead941d698dc1160a298ba7bec277ac'

function requestLikesCount(shortcode, noCache) {
    let cached = !noCache && likeCache.get(shortcode)
    if (cached) {
        console.log('found in cache')
        return Promise.resolve(cached.likes)
    }

    console.log('no cache', shortcode)
    return request_likes_postData(shortcode)
            .then(cacheResult)
            .then(d => {
                return d.likes
            })
}

function requestPostInfo(shortcode) {
    let cached = likeCache.get(shortcode)
    if(cached) {
        console.log('from cache')
        return Promise.resolve(cached)
    }

    console.log('no cache', shortcode)
    return request_likes_postData(shortcode)
            .then(cacheResult)
}

function request_likes_postData(shortcode) {
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
// CONCATENATED MODULE: ./src/article-observer.js


function handleFirstArticled(articles) {
    articles.forEach(process)
}

function handleArticleMutations(mutations) {
    //console.log(mutations)
    mutations = Array.from(mutations)

    // like
    let m = mutations.find(m => m.target.className === 'ltpMr Slqrh' && m.addedNodes[0])
    if (m) {
        return setTimeout(() => {
            process(m.target.closest('article'), true) // no cache
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

}

function process(article, noCache = false) {
    let shortCode = getShortCode(article)
    if (!shortCode) return

    requestLikesCount(shortCode, noCache)
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
// CONCATENATED MODULE: ./src/cover.js


function addCover(item) {
    console.log('add cover')
    let a = item.querySelector('a')

    if (a.querySelector('.qn-0x')) return

    let { div, likesSpan, commSpan } = drawCover()
    a.appendChild(div)

    let shortcode = (function getShortCode(link) {
        return link.href.split('/').slice(-2,-1).pop()
    })(a)
    requestPostInfo(shortcode)
    .then(postInfo => {
        likesSpan.textContent = postInfo.likes
        commSpan.textContent = postInfo.comments
    })
}

function showCover(item) {
    item.querySelector('.cover').style.display = 'block'
}

function hideCover(item) {
    item.querySelector('.cover').style.display = 'none'
}

function drawCover() {
    let div = document.createElement('div')
    div.className = 'qn-0x cover'
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'

    let ul = document.createElement('ul')
    ul.className = 'Ln-UN'

    let liLikes = document.createElement('li')
    liLikes.className = '-V_eO'

    let span1 = document.createElement('span')
    liLikes.appendChild(span1)

    let span2 = document.createElement('span')
    span2.className = '_1P1TY coreSpriteHeartSmall'
    liLikes.appendChild(span2)


    let liComm = document.createElement('li')
    liComm.className = '-V_eO'

    let span3 = document.createElement('span')
    liComm.appendChild(span3)
    
    let span4 = document.createElement('span')
    span4.className = '_1P1TY coreSpriteSpeechBubbleSmall'
    liComm.appendChild(span4)

    ul.appendChild(liLikes)
    ul.appendChild(liComm)
    div.appendChild(ul)

    return {
        div,
        likesSpan: span1,
        commSpan: span3,
    }
}
// CONCATENATED MODULE: ./src/grid-observer.js


function handleFirstGrid(grid) {
    grid.forEach(initCover)
}

function handleGridMutations(mutations) {
    //console.log(mutations)
    mutations = Array.from(mutations)
    let gridMutations = mutations.filter(m => m.addedNodes[0] && m.addedNodes[0].className === 'Nnq7C weEfm')
    gridMutations.forEach(m => {
        let grid = Array.from(m.addedNodes[0].querySelectorAll('.v1Nh3.kIKUG._bz0w'))
        grid.forEach(initCover)
    })
}

function initCover(gridItem) {
    gridItem.addEventListener('mouseover', function() {
        let cover = this.querySelector('.cover')
        if (!cover) {
            addCover(this)
        } else {
            showCover(this)
        }
    })

    gridItem.addEventListener('mouseout', function() {
        hideCover(this)
    })
}
// CONCATENATED MODULE: ./src/index.js





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


/***/ })
/******/ ]);