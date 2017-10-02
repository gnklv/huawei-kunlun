'use strict';
const _ = require('lodash');
const path = require('path');
const gulp = require('gulp');
const del = require('del');
const gutil = require('gulp-util');
const less = require('gulp-less');
const gls = require('gulp-live-server');
const nunjucksRender = require('gulp-nunjucks-render');
const prettify = require('gulp-html-prettify');
const replace = require('gulp-replace');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');
const sourcemaps = require('gulp-sourcemaps');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const LessPluginCleanCSS = require('less-plugin-clean-css');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const notify = require("gulp-notify");
const babel = require('gulp-babel');
const exec = require('child_process').exec;
const gap = require('gulp-append-prepend');
const config = require('./config.json');
const runSequence = require('run-sequence');



gulp.task('less:dev', () => {
  var autoprefix = new LessPluginAutoPrefix({
    browsers: ["last 2 versions"]
  });

  return gulp.src('public/less/*.less')
    //.pipe(sourcemaps.init())
    .pipe(gap.prependText(`@storage: "../storage/";`))
    .pipe(less({
      plugins: [autoprefix]
    })
      .on('error', notify.onError({
        message: "Error: <%= error.message %>",
        title: "Less Compile Error"
      }))
    )

    //.pipe(sourcemaps.write('.', {includeContent: false, mapSources: 'public/less/**'}))
    .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('less:prod', () => {
  let cleancss = new LessPluginCleanCSS({
      advanced: true
    });

  let autoprefix = new LessPluginAutoPrefix({
      browsers: ["last 10 versions", "IE 8", "IE 9", "IE 10", "IE 11"]
    });

  return gulp.src('public/less/*.less')
    .pipe(gap.prependText(`@storage: "${config.storage}";`))
    .pipe(less({
      plugins: [autoprefix, cleancss]
    })
      .on('error', notify.onError({
        message: "Error: <%= error.message %>",
        title: "Less Compile Error"
      }))
    )
    .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('js', () => {
  return gulp.src('public/javascripts/sources/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    })
      .on('error', notify.onError({
        message: "Error: <%= error.message %>",
        title: "JS Compile Error"
      }))
    )
    .pipe(uglify())
    .pipe(sourcemaps.write('../javascripts/'))
    .pipe(gulp.dest('public/javascripts/'));
});

gulp.task('compress', () => {
  return gulp.src(['public/javascripts/dist/*.js', 'public/javascripts/app.js'])
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('public/javascripts/'));
});

gulp.task('sprites', () => {

  let spriteData = gulp.src('public/__icons/*.png').pipe(spritesmith({
    imgName: 'iconset.png',
    cssName: 'c-icon.less',
    padding: 10,
    cssTemplate: 'icons.hbs'
  }));

  let imgStream = spriteData.img
    .pipe(gulp.dest('public/images/'));
  let cssStream = spriteData.css
    .pipe(gulp.dest('public/less/components/'));

  return merge(imgStream, cssStream);
});

gulp.task('default', () => {
  let server = gls.new(['bin/www']);
  server.start();

  gulp.watch([
    'views/blocks/*.html', 
    'views/*.html', 
    'datasource/*.json', 
    'app.js', 
    'config.json', 
    'gulpfile.js', 
    'routes/**/*.js'
    ], file => {
      gutil.log(`File ${path.basename(file.path)} was ${file.type} => livereload`);
      server.start.bind(server)();
      server.notify.apply(server, [file]);
  });

  gulp.watch(['public/stylesheets/*.css', 'public/javascripts/*.js'], file => {
      gutil.log(`File ${path.basename(file.path)} was ${file.type} => livereload`);
      server.notify.apply(server, [file]);
  });

  gulp.watch(['public/javascripts/sources/*.js'], ['js']);
  gulp.watch(['public/less/*.less', 'public/less/**/*.less'], ['less:dev']);
  gulp.watch(['public/__icons/*.png'], ['sprites']);
  
});

gulp.task('clean', () => {
  return del.sync([`${config.buildDir}/*`, `!${config.buildDir}/.git`, `!${config.buildDir}/.git/**`])
})

gulp.task('compileHtml', cb => {
  exec('node __export.js', (err, stdout, stderr) => {
    cb(err);
  });
});

gulp.task('exportHTML', () => {
  
  gulp.src(['html/*.html'])
    .pipe(prettify({
      indent_char: ' ',
      indent_size: 2
    }))
    .pipe(gulp.dest(`${config.buildDir}`));
});


gulp.task('copyStatic', () => {
  let arr = ['public/**'];
  
  if (config.buildIgnore.length > 0 ) {
    _.each(config.buildIgnore, el => {
      if (el.split('.').length === 1 ) {
        arr.push(`!public/${el}`, `!public/${el}/**`)
      } else {
        arr.push(`!public/${el}`);
      }
    })
  }
  
  gulp.src(arr).pipe(gulp.dest(`${config.buildDir}`))

});

gulp.task('publish', ['compileHtml'], (cb) => {
  runSequence('clean',
              'exportHTML',
              ['less:prod', 'js'],
              'copyStatic',
              cb)
});
//gulp.task('publish', ['exportHTML', 'copyStatic']);