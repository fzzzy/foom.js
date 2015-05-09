
var page = require('webpage').create();

page.onConsoleMessage = (...args) => console.log.apply(console, args);

let addr = encodeURIComponent("ws://localhost:8080"),
  tospawn = encodeURIComponent("../agent/agent.js");

page.open(`http://localhost:8080/shared/?addr=${addr}&spawn=${tospawn}&name=agent`, status => {});
