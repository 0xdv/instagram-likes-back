import {addCover, showCover, hideCover} from './cover'

export function handleFirstGrid(grid) {
    grid.forEach(initCover)
}

export function handleGridMutations(mutations) {
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