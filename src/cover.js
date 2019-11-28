import {requestPostInfo} from './request-likes'

export function addCover(item) {
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

export function showCover(item) {
    item.querySelector('.cover').style.display = 'block'
}

export function hideCover(item) {
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