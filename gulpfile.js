

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

gulp.task("webpack-index", ["transform"], function () {
  return gulp.src('dist/shared/index-boot.js')
      .pipe(webpack({
        output: { filename: "index-boot-bundle.js" }
      })).pipe(gulp.dest('dist/shared'));
});

gulp.task("webpack-actor", ["transform"], function () {
  return gulp.src('dist/shared/actor-boot.js')
      .pipe(webpack({
        output: { filename: "actor-boot-bundle.js" }
      })).pipe(gulp.dest('dist/shared'));
});

gulp.task("webpack-agent", ["transform"], function () {
  return gulp.src('dist/agent/agent.js')
      .pipe(webpack({
        output: { filename: "agent-bundle.js" }
      })).pipe(gulp.dest('dist/agent'));
});

gulp.task("webpack-client", ["transform"], function () {
  return gulp.src('dist/client/client.js')
      .pipe(webpack({
        output: { filename: "client-bundle.js" }
      })).pipe(gulp.dest('dist/client'));
});

var root_deps = ["webpack-index", "webpack-actor", "webpack-agent", "webpack-client"];

gulp.task("default", root_deps, function () {
  nodemon({
    script: "dist/run.js",
    ignore: ["dist", "**/node_modules"],
    ext: "html css png js",
    tasks: root_deps
  });
});
