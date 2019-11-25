export function intercept(window, onLoad) {
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