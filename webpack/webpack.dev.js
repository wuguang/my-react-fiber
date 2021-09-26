let path = require('path');
let projectName = 'myReactFiber';
let outPathDev = path.join(__dirname, `../dist`);
module.exports = {
    //context: sourcePath,
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    output: {
        filename: '[name].[hash:8].js',
        chunkFilename: '[name].[hash:8].js',
        path: outPathDev
    },
    devServer: {
        port: 8282,
        hot: true,
        inline: true,
        historyApiFallback: {
            disableDotRule: true
        },
        stats: 'minimal',
        clientLogLevel: 'warning',
        'open':true
        /*
        proxy: {
            '/': {
                changeOrigin: true,
                pathRewrite: { '^': '' },
            }
        }
        */
    }
};

