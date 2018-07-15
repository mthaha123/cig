var gulp = require('gulp'),

    del = require('del'),
    watch = require("gulp-watch"),
    browserSync = require('browser-sync').create(),
    client = require("scp2");
// var gutil = require('gulp-util');
// var ftp = require('gulp-ftp');
//jsdoc = require('gulp-jsdoc');
//
var runSequence = require('run-sequence');
var webpack = require('gulp-webpack');
var WebpackDevServer = require("webpack-dev-server");
var RevAll = require('gulp-rev-all');


gulp.task("ngd", function() {
    return gulp.src(['./debug/**/*','!./debug/**/manager.html'])
        .pipe(gulp.dest('/usr/local/var/www/levelquery/'));
});

gulp.task('scp', function() {
    client.scp('debug/', 'root:Ssj890623@139.196.37.109:/root/ftpdir/static/D/', function(err) {
        if (err === undefined) {
            console.log("upload complete");
        } else {
            console.log(JSON.stringify(err));
        }
    });
});

var fileDir = "debug/";
if (process.env.env === 'prod') {
    fileDir = "dist/";
}

gulp.task("copyhtml", function() {
    return gulp.src('./src/**/*.html')
        .pipe(gulp.dest(fileDir));
});

gulp.task("copystatics", function() {
    return gulp.src('./src/statics/**/*.*')
        .pipe(gulp.dest(fileDir + 'statics'));
});

gulp.task('serve', ['webpack'], function() {
    // console.info(browserSync.active);
    // if(browserSync.active){
    //     browserSync.reload();
    // }else{
    //     browserSync.init({
    //         // server: {
    //         //     baseDir: './debug'
    //         // },
    //         port: 8086,
    //         browser: "google chrome",
    //         proxy:'localhost:8085'
    //     });
    // }
    //browserSync.exit();
    browserSync.init({
        // server: {
        //     baseDir: './debug'
        // },
        port: 8086,
        browser: "google chrome",
        proxy: 'localhost:8085',
        // open: 'tunnel',
        // tunnel: true

    });

    /**注意：watch的路径请使用如下  如果使用：./src/... 类似的 会造成新增文件的时候无法触发watch事件 */
    gulp.watch(['src/**/*.html'], ['copyhtml']);
    gulp.watch(['src/js/**/*.js', 'src/js/**/*.vue'], ['webpack']);
    gulp.watch(['src/statics/**/*.*'], ['copystatics']);
    // gulp.watch(['webpack.config.js'], ['default']);

    //browserSync.reload(['./debug/scripts/**/*.js','./debug/**/*.html','./debug/styles/**/*.css']);
    browserSync.watch(['debug/**/*.*']).on("change", browserSync.reload);
    // browserSync.watch(['debug/**/*.*']).on("change", browserSync.reload);
});


gulp.task('webpack', function() {
    return gulp.src('src/js/entries/app.js')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest(process.env.env === 'prod' ? './dist/' : './debug/'));
});

gulp.task("clear:d", function() {
    return del(["./debug"]);
});

gulp.task("clear:o", function() {
    return del(["./dist", "!./dist/*.zip"]);
});

gulp.task("clear:a", ["clear:d", "clear:o"]);


gulp.task("mddist", function() {
    var revAll = new RevAll({
        dontRenameFile: [/images\/.+$/g, /statics\/.+$/g, '.html', /scripts\/[1-9]{1}\..+$/g],
        dontUpdateReference: [/statics\/.+$/g, /images\/.+$/g],
    });

    return gulp.src('dist/**')
        .pipe(revAll.revision())
        .pipe(gulp.dest('dist'));
});


gulp.task("build", function() {
    runSequence(
        ['clear:o'], ['copystatics', "copyhtml"], ['webpack'], ['mddist']
    );
})

gulp.task("default", function() {
    runSequence(
        ['clear:a'], ['webpack'], ['serve'], ['copystatics', "copyhtml"]
    );
});
