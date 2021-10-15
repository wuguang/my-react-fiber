//release 输出不同的目录
const UglifyJsPlugin=require('uglifyjs-webpack-plugin');

module.exports = {
    mode:"production",
    
    optimization: {
        /*
        splitChunks: {
            name: true,
            cacheGroups: {
                commons: {
                    chunks: 'initial',
                    minChunks: 3
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'all',
                    priority: -10,
                    filename:'vendor.[contenthash:8].js'
                }
            }
        },
        */
        minimizer:[
            /*
            new UglifyJsPlugin({
                uglifyOptions: {
                    warnings: false,
                    compress: {
                        drop_debugger: true,
                        drop_console: true,            
                    },
                },
                sourceMap: false,
                parallel: true,
            })
            */
        ],
        runtimeChunk: true
    },
    performance: {
        hints: "warning", // 枚举
        maxAssetSize: 30000000, // 整数类型（以字节为单位）
        maxEntrypointSize: 50000000, // 整数类型（以字节为单位）
        assetFilter: function(assetFilename) {
            return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
        }
    }
};