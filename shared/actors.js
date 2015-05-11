
function uuid4() {
  let str = '';
  for (var i = 0; i < 15; i++) {
   str += String.fromCharCode(Math.random() * 16 | 0);
  }
  return btoa(str);
}

class Actor {
  constructor(vat, filename) {
    this.id = uuid4();
    this.vat = vat;
    this.filename = filename;
    this.messageQueue = [];
    this.frame = document.createElement("iframe");
    this.frame.src = "../shared/actor.html";
    this.frame.height = "100%";
    this.frame.width = "100%";
    document.body.appendChild(this.frame);
    this.frame.contentWindow.onload = () => {
      let spawn_msg = {spawn: filename,
        id: this.id,
        vat: this.vat.id};
      this.frame.contentWindow.postMessage(spawn_msg, location.origin);
      for (let m of this.messageQueue) {
        this.frame.contentWindow.postMessage(m, location.origin);
      }
      this.messageQueue = null;
    }
  }

  cast(msg) {
    if (this.messageQueue !== null) {
      this.messageQueue.push(msg);
    } else {
      this.frame.contentWindow.postMessage(msg, location.origin);
    }
  }
}

export class Vat {
  constructor(remote_addr, greet) {
    let vat_id = uuid4();
    this.id = vat_id;
    this.actors = new Map();

    let socket = new eio.Socket(remote_addr);
    socket.on('open', () => {
      socket.send(
        JSON.stringify(
          {hello: greet,
          vat: vat_id}));

      socket.on('message', (msg) => {
        msg = JSON.parse(msg);
        if (msg.cast !== undefined) {
          let act = this.actors.get(msg.id);
          act.cast(msg.cast);
        } else if (msg.response !== undefined) {
          if (msg.query_vat === this.id) {
            let act = this.actors.get(msg.query_id);
            act.cast(msg);
          }
        } else {
          if (window.oncast !== undefined) {
            window.oncast(msg);
          }
        }
      });

      socket.on("close", function (msg) {
        console.log("The socket was closed.");
      });
    });

    window.onmessage = (m) => {
      if (m.data.query !== undefined) {
        socket.send(JSON.stringify(m.data));
      } else if (m.data.cast !== undefined) {
        socket.send(JSON.stringify(m.data));
      }
    }

    this.socket = socket;
  }

  spawn(filename, actor_name) {
    let actor = new Actor(this, filename);
    this.actors.set(actor.id, actor);
    console.log("spawned", actor.id, filename, actor_name);
    if (actor_name) {
      console.log("register", actor_name, this.id, actor.id);
      this.socket.send(JSON.stringify({
        register: actor_name,
        vat: this.id,
        id: actor.id}));
    }
    return actor;
  }
}
