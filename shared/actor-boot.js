(function () {
  let callbacks = new Map();

  window.onmessage = (function () {
    return function (m) {
      console.log("actor-boot.js got message", JSON.stringify(m.data));
      if (m.data.spawn !== undefined) {
        console.log("m.data.spawwn", m.data.id, m.data.vat);
        window.actor_id = m.data.id;
        window.vat_id = m.data.vat;
        let node = document.createElement("script");
        node.src = m.data.spawn;
        document.body.appendChild(node);
      } else if (m.data.response !== undefined) {
        let cb = callbacks.get(m.data.response);
        callbacks.delete(m.data.response);
        cb({id: m.data.response_id, vat: m.data.response_vat});
      } else {
        if (window.oncast !== undefined) {
          window.oncast(m.data);
        }
      }
    }
  }());

  window.query = function query(name, cb) {
    callbacks.set("query." + name, cb);
    let msg = {query: name, actor_id: actor_id, vat_id: vat_id};
    window.parent.postMessage(
      msg,
      location.origin);
  }

  window.address = function address(vat, id) {
    console.log("addr", vat, id);
    return function cast(msg) {
      console.log("cast", vat, id, msg);
      window.parent.postMessage({vat: vat, id: id, cast: msg}, location.origin);
    }
  }

  console.log("hello from actor-boot.js");
}());
