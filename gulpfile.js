

var gulp = require("gulp"),
  babel = require("gulp-babel"),
  nodemon = require("gulp-nodemon"),
  run = require("gulp-run");
  webpack = require('gulp-webpack');

gulp.task("clean", function () {
  run("rm -rf dist").exec();
});

gulp.task("shared", function () {
  return gulp.src(
    ["shared/browser-polyfill.js",
    "shared/engine.io.js",
    "shared/es6-module-loader.js"]
  ).pipe(gulp.dest('dist/shared'));
});

gulp.task("resources", function () {
  return gulp.src(["**/*.html", "**/*.css", "**/*.png",
    "!dist/**/*", "!node_modules/**/*"])
    .pipe(gulp.dest("dist"));
});

gulp.task("transform", ["resources", "shared"], function () {
  return gulp.src(["**/*.js",
    "!dist/**/*", "!node_modules/**/*",
    "!**/shared/browser-polyfill.js", "!**/shared/engine.io.js",
    "!**/shared/es6-module-loader.js", "!gulpfile.js"])
    .pipe(babel({ stage: 1 }))
    .pipe(gulp.dest("dist"));
});

gulp.task("webpack-agent", ["transform"], function () {
  return gulp.src('dist/agent/agent-boot.js')
      .pipe(webpack({
        output: { filename: "agent-boot-bundle.js" }
      })).pipe(gulp.dest('dist/agent'));
});

gulp.task("webpack-client", ["transform"], function () {
  return gulp.src('dist/client/client-boot.js')
      .pipe(webpack({
        output: { filename: "client-boot-bundle.js" }
      })).pipe(gulp.dest('dist/client'));
});

gulp.task("default", ["webpack-agent", "webpack-client"], function () {
  nodemon({
    script: "dist/run.js",
    ignore: ["dist", "**/node_modules"],
    ext: "html css png js",
    tasks: ["webpack-agent", "webpack-client"]
  });
});
