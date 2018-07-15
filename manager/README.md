# h5vuetpl

基于vuex + vue-router + vue.js 的项目模板

进入项目根目录之后执行

    npm install
    npm run dev  #启动开发调试
    npm run build #发布打包

启动开发调试之后会在根目录下生成debug文件夹，为调试版本代码的根目录，如果需要反向代理调试可nginx指向该文件夹路径


为了代码优雅使用了es6的语法，因此引入了babel依赖库，默认代码gzip后增加到100K左右，如果需要精简请使用es5语法，同时找到webpack.config.js中注释掉如下配置：

     babel: {
        presets: ['es2015', 'stage-0'],
        plugins: ['transform-runtime']
     },# manager
