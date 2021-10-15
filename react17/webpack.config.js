let { merge }  = require('webpack-merge');
let path = require('path');
let baseConfig = require('./build/webpack/webpack.base');
let prodConfig = require('./build/webpack/webpack.prod');
let devConfig = require('./build/webpack/webpack.dev');
let curConfig = {};


function getCurConfig(){
    let argv = process.argv;
    console.log(`-----------------process.env.NODE_ENV=${process.env.NODE_ENV}`);
    if(process.env.NODE_ENV === 'development'){
        curConfig = devConfig;
    }else{
        curConfig = prodConfig;
        baseConfig.output = {
            filename: '[name].js',
            chunkFilename:'[name].chunk.js',
            path: path.resolve(__dirname, 'dist'),
        }
    }
    return curConfig;
};

let curWebpackConfig = merge(baseConfig,getCurConfig());
module.exports = curWebpackConfig;
