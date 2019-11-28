const cache = {}

export const likeCache = {
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