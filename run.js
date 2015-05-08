
process.chdir("dist");

let {spawn} = require("child_process"),
  server = require("./server");

spawn(
  "bash",
  ["-c", "cd agent && phantomjs phantom.js"],
  {stdio: ["ignore", process.stdout, process.stderr]});

server.serve(8080);
