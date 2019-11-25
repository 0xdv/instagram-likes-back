const WebpackUserscript = require('0xdv/webpack-userscript')
const fs = require('fs')

module.exports = {
    entry: './src/instagram-likes-back.user.js',
    output: {
        filename: 'instagram-likes-back.user.js'
    },
    mode: 'production',
    plugins: [
        new WebpackUserscript({
            metajs: false,
            rawHeaderString: fs.readFileSync('./src/headers.js', 'utf8')
        })
    ]
}