const WebpackUserscript = require('@0xdv/webpack-userscript')
const TerserPlugin = require('terser-webpack-plugin')
const fs = require('fs')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'instagram-likes-back.user.js'
    },
    mode: 'production',
    plugins: [
        new WebpackUserscript({
            metajs: false,
            rawHeaderString: fs.readFileSync('./src/headers.js', 'utf8')
        })
    ],
    optimization: {
        minimize: false,
        minimizer: [
            new TerserPlugin({
                sourceMap: false,
                terserOptions: {
                    compress: {
                        drop_console: true,
                    }
                }
            })
        ]
    }
}