'use strict'

var path = require('path');
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var vue = require("vue-loader");

var isProduction = function() {
    return process.env.env === 'prod';
};

//webpack插件
var plugins = [
    //提公用js到common.js文件中
    new webpack.optimize.CommonsChunkPlugin('scripts/common.js'),
    //将样式统一发布到style.css中
    new ExtractTextPlugin("styles/style.css", {
        allChunks: true,
        disable: false
    }),
    // 使用 ProvidePlugin 加载使用率高的依赖库

    //vue默认是开发模式，这里配置生产模式
    new webpack.DefinePlugin({
      'process.env': {
        //NODE_ENV: '"production"'
        NODE_ENV: '"development"'
      }
    })
];
var entry = ['./src/js/entries/app'];
var devoutput = {
    path: __dirname + "/debug/",
    filename: 'scripts/build.js',
    chunkFilename: "scripts/[id].build.js"
};

var prodoutput = {
    path: __dirname + "/dist/",
    filename: 'scripts/build.js',
    chunkFilename: "scripts/[id].build_[chunkhash].js"
};

if (isProduction()) {
    plugins.push(new webpack.optimize.UglifyJsPlugin());
}
//编译输出路径
module.exports = {
    debug: true,
    entry: entry,
    output: isProduction() ? prodoutput : devoutput,
    module: {
        loaders: [{
            test: /\.vue$/,
            loader: 'vue',
        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract(
                "style-loader", 'css-loader?sourceMap!sass-loader!cssnext-loader')
        }, {
            test: /\.css$/,
            // loader: ExtractTextPlugin.extract(
            //     // "style-loader", "css-loader?sourceMap!cssnext-loader&name=styles/[name]_" + (isProduction() ? "[hash]" : "") + ".[ext]")
            //     "style-loader", "css-loader")
            loader: 'style-loader!css-loader'
        }, {
            test: /\.js$/,
            exclude: /node_modules|vue\/dist|vue-hot-reload-api|vue-loader/,
            loader: 'babel'
        }, {
            test: /\.(jpg|png|gif|jpeg)$/,
            loader: "url-loader?limit=10000&name=images/[hash].[ext]"
        }
        // , {
        //     test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        //     loader: "url-loader?limit=10000"
        // }, {
        //     test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        //     loader: "file-loader"
        // }
        ,{
            test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
            loader: 'file-loader'
        }
        , {
            test: /\.json$/,
            loader: 'json'
        }, {
            test: /\.(html|tpl)$/,
            loader: 'html-loader'
        }]
    },
    vue: {
        css: ExtractTextPlugin.extract("css"),
        sass: ExtractTextPlugin.extract("css!sass-loader")
    },
    babel: {
        presets: ['es2015', 'stage-0'],
        plugins: ['transform-runtime']
    },
    resolve: {
        // require时省略的扩展名，如：require('module') 不需要module.js
        extension: ['', '.js'],
        //别名
        alias: {
            // filter: path.join(__dirname, 'src/filters')
        }
    },
    plugins: plugins,
    devtool: '#source-map'
};