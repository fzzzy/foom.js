
let engine = require('engine.io'),
  ns = require('node-static'),
  files = new ns.Server('.'),
  {spawn} = require('child_process'),
  random = require('random-word');

exports.serve = (port) => {
  console.log("http server listening on port", port);

  let http = require('http').createServer(function(request, response) {
    request.addListener('end', function() {
      console.log(request.method, request.url);
      if (request.url === "/webhook") {
        response.end("");
        spawn("git", ["pull"], {stdio: ["ignore", process.stdout, process.stderr]});
      } else if (request.url === "/") {
        response.writeHead(302, {
          'Location': 'http://localhost:8080/client/'
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
            msg.vat, msg.id,
            "AlreadyRegisteredError:", msg.register);
          socket.send(JSON.stringify({register: msg.register, error: "AlreadyRegisteredError"}));
        } else {
          named.set(msg.register, msg);
        }
      } else if (msg.query !== undefined) {
        if (named.has(msg.query)) {
          let it = named.get(msg.query);
          socket.send(JSON.stringify({response: "query." + msg.query,
            query_vat: msg.vat_id,
            query_id: msg.actor_id,
            response_vat: it.vat,
            response_id: it.id}));
        } else {
          console.error(
            msg.vat, msg.id, "NotRegisteredError:", msg.query)
          socket.send(JSON.stringify({query: msg.query, error: "NotRegisteredError"}));
        }
      } else if (msg.cast !== undefined) {
        vats.get(msg.vat).send(data);
      }
    });

    socket.on('close', function () {
      console.log("server/index.js onclose FIXME need to clean out references to this vat");
    });
  });
}
