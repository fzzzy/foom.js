
var page = require('webpage').create();

page.onConsoleMessage = (...args) => console.log.apply(console, args);

page.open("index.html", status => {});
