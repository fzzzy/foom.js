
let engine = require('engine.io'),
  ns = require('node-static'),
  files = new ns.Server('.'),
  {spawn} = require('child_process'),
  random = require('random-word');

const DEBUG = true;

exports.serve = (port) => {
  console.log("http server listening on port", port);

  let http = require('http').createServer(function(request, response) {
    request.addListener('end', function() {
      if (DEBUG) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
      }

      console.log(request.method, request.url);
      if (request.url === "/webhook") {
        response.end("");
        spawn("git", ["pull"], {stdio: ["ignore", process.stdout, process.stderr]});
      } else if (request.url === "/") {
        response.writeHead(302, {
          'Location': 'http://localhost:8080/shared/'
        });
        response.end();
      } else {
        files.serve(request, response);
      }
    }).resume();
  }).listen(port);

  let vats = new Map(),
    named = new Map();

  engine.attach(http).on('connection', function (socket) {
    let words = [random(), random(), random(), random()];
    socket.send(JSON.stringify({name: words.join(" ")}));

    socket.on('message', function (data) {
      var msg = JSON.parse(data);
      if (msg.hello !== undefined) {
        vats.set(msg.vat, socket);
      } else if (msg.register !== undefined) {
        if (named.has(msg.register)) {
          console.error(
            msg.from,
            "AlreadyRegisteredError:", msg.register);
          socket.send(JSON.stringify({register: msg.register, error: "AlreadyRegisteredError"}));
        } else {
          console.log("registered", msg.register, msg.from);
          named.set(msg.register, msg.from);
        }
      } else if (msg.query !== undefined) {
        if (named.has(msg.query)) {
          let it = named.get(msg.query),
            resp = {response: "query." + msg.query,
              from: msg.from,
              value: it};
          console.log("server side query response", resp);
          socket.send(JSON.stringify(resp));
        } else {
          console.error(
            msg.from, "NotRegisteredError:", msg.query);
          socket.send(JSON.stringify({query: msg.query, error: "NotRegisteredError"}));
        }
      } else if (msg.cast !== undefined) {
        console.log("vats", data);
        let to = msg.to,
          vat = to.__address.split("/")[0];
        vats.get(vat).send(data);
      }
    });

    socket.on('close', function () {
      console.warn("server/index.js onclose FIXME need to clean out references to this vat");
    });
  });
}
