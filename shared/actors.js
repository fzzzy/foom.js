
function uuid4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = Math.random()*16|0,
        v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}

class Actor {
  constructor(vat, filename) {
    this.id = uuid4();
    this.vat = vat;
    this.filename = filename;
    this.messageQueue = [];
    this.frame = document.createElement("iframe");
    this.frame.src = "../shared/actor.html";
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

class Vat {
  constructor(remote_addr, greet) {
    let vat_id = uuid4();
    this.id = vat_id;
    this.actors = new Map();

    let socket = new eio.Socket(remote_addr);
    socket.on('open', () => {
      console.log("websocket connected to", remote_addr);
      socket.send(
        JSON.stringify(
          {hello: greet,
          vat: vat_id}));

      socket.on('message', (msg) => {
        console.log("actors.js onmessage", msg);
        msg = JSON.parse(msg);
        if (msg.cast !== undefined) {
          console.log("cast", msg.vat, msg.id, msg.cast);
          let act = this.actors.get(msg.id);
          console.log("actors.js onmessage cast got act", act, msg.id);
          act.cast(msg.cast);
        } else if (msg.response !== undefined) {
          console.log("stuff", msg.response_vat, this.id, msg.response_id);
          if (msg.query_vat === this.id) {
            let act = this.actors.get(msg.query_id);
            console.log("got act", act);
            act.cast(msg);
          }
        } else {
          if (window.oncast !== undefined) {
            window.oncast(msg);
          }
        }
      });

      socket.on("close", function (msg) {
        console.log("close", msg);
      });
    });

    window.onmessage = (m) => {
      console.log("actors.js window.onmessage", JSON.stringify(m.data));
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
