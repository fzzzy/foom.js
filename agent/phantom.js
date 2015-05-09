
var page = require('webpage').create();

page.onConsoleMessage = (...args) => {
  for (var i = 0; i < args.length; i++) {
    if (typeof args[i] === "object") {
      args[i] = JSON.stringify(args[i]);
    }
  }
  console.log.apply(console, args);
};

let addr = encodeURIComponent("ws://localhost:8080"),
  tospawn = encodeURIComponent("../agent/agent.js");

page.open(`http://localhost:8080/shared/?addr=${addr}&spawn=${tospawn}&name=agent`, status => {
  console.log("phantom.js opened page with status", status);
});
