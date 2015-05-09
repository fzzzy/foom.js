

var gulp = require("gulp"),
  babel = require("gulp-babel"),
  nodemon = require("gulp-nodemon"),
  run = require("gulp-run");

gulp.task("clean", function () {
  run("rm -rf dist").exec();
});

gulp.task("shared", function () {
  return gulp.src(
    ["shared/core.js", "shared/engine.io.js", "shared/es6-module-loader.js"]
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
    "!**/shared/core.js", "!**/shared/engine.io.js",
    "!**/shared/es6-module-loader.js", "!gulpfile.js"])
    .pipe(babel({ stage: 1 }))
    .pipe(gulp.dest("dist"));
});

gulp.task("default", ["transform"], function () {
  nodemon({
    script: "dist/run.js",
    ignore: ["dist", "**/node_modules"],
    ext: "html css png js",
    tasks: ["transform"]
  });
});
