
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
        spawn("git", ["pull"], {stdio: ["ignore", process.stdout, process.stderr]});
        response.end("");
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

  let agent = null,
    vats = new Map(),
    named = new Map();

  engine.attach(http).on('connection', function (socket) {
    console.log("onconnection", socket.id);
    let words = [random(), random(), random(), random()];
    socket.send(JSON.stringify({name: words.join(" ")}));

    socket.on('message', function(data) {
      var msg = JSON.parse(data);
      console.log("server onmessage", data);
      if (msg.hello !== undefined) {
        vats.set(msg.vat, socket);
      } else if (msg.register !== undefined) {
        if (named.has(msg.register)) {
          console.error(
            socket.id,
            "tried to register an already registered name:", msg.register);
        } else {
          named.set(msg.register, msg);
          console.log("msg register success", msg.register);
        }
      } else if (msg.query !== undefined) {
        if (named.has(msg.query)) {
          console.log("query for named thing which exists", msg);
          let it = named.get(msg.query);
          socket.send(JSON.stringify({response: "query." + msg.query,
            query_vat: msg.vat_id,
            query_id: msg.actor_id,
            response_vat: it.vat,
            response_id: it.id}));
        } else {
          console.log(
            socket.id, "query for named thing which is not registered:", msg.query)
        }
      } else if (msg.cast !== undefined) {
        console.log("index.js msg.cast !== undefined", msg);
        let socket = vats.get(msg.vat);
        socket.send(JSON.stringify(msg));
      }
    });

    socket.on('close', function () {
      console.log("onclose", socket.id);
    });
  });
}
