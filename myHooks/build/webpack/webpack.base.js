let path = require('path');
let sourcePath = path.join(__dirname, '../dist');

// plugins
let HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
    context: sourcePath,
    entry: {
        index: path.resolve(__dirname, `../../src/index.ts`)
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[name].chunk.js'
    },
    target: 'web',
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.less', '.css'],
    },
    module: {
        rules: [
            //.ts, .tsx 后缀文件
            {
                test: /\.tsx?$/,
                use: [{
                        loader: 'babel-loader',
                        options: {
                            plugins: [],
                            presets:["@babel/preset-react","@babel/preset-env"]
                        }
                    },
                    { loader: 'ts-loader' }
                ]
            },
            //.css后缀文件
            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                ]
            },
            {
                test: /\.less$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'less-loader' }
                ]
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            }, {
                test: /\.(a?png|jpe?g|gif|svg)$/,
                use: 'url-loader?limit=10240'
            }, {
                test: /\.(jpe?g|gif|bmp|mp3|mp4|ogg|wav|eot|ttf|woff|woff2)$/,
                use: 'file-loader'
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        //主页面
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, `../../template/index.html`),
            filename: `index.html`,
            inject: 'body',
            hash: true, //为静态资源生成hash值
            minify: {
                removeComments: true, //移除HTML中的注释
                collapseWhitespace: false //删除空白符与换行符
            }
        })
    ]
};