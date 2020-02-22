import {requestLikesCount} from './request-likes'

export function handleFirstArticle(articles) {
    articles.forEach(process)
}

export function handleArticleMutations(mutations) {
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
    //likesSection.innerHTML = ""
    //likesSection.appendChild(btn)
}

function findInjectionPlace(article) {
    // img or video
    let div = article.querySelector('.Nm9Fw, .HbPOm._9Ytll')

    if (!div) { // ig hides section, need to re-create 
        div = addLikesSection(article)
    }
    return div
}

function addLikesSection(article) {
    let buttonBar = article.querySelector('.ltpMr.Slqrh')
    let section = document.createElement('section')
    section.className = 'EDfFK ygqzn'

    let div = document.createElement('div')
    div.className = 'Igw0E IwRSH eGOV_ ybXk5 vwCYk'

    let innerDiv = document.createElement('div')
    innerDiv.className = 'Nm9Fw'

    let button = document.createElement('button')
    button.className = 'sqdOP yWX7d _8A5w5'
    button.type = 'button'

    buttonBar.parentNode.insertBefore(section, buttonBar.nextSibling);
    section.appendChild(div)
    div.appendChild(innerDiv)
    innerDiv.appendChild(button)

    return innerDiv
}