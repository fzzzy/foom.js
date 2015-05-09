
(function () {
  let callbacks = new Map();

  window.onmessage = function (m) {
      if (m.data.spawn !== undefined) {
        window.actor_id = m.data.id;
        window.vat_id = m.data.vat;
        let node = document.createElement("script");
        node.src = m.data.spawn;
        document.body.appendChild(node);
      } else if (m.data.response !== undefined) {
        let cb = callbacks.get(m.data.response);
        callbacks.delete(m.data.response);
        let response = {
          id:m.data.response_id,
          vat: m.data.response_vat
        };
        if (m.data.error !== undefined) {
          response.error = m.data.error;
          cb.reject(response);
        } else {
          cb.resolve(response);
        }
      } else {
        if (window.oncast !== undefined) {
          window.oncast(m.data);
        }
      }
    }

  window.query = function query(name) {
    let p = new Promise(function (resolve, reject) {
      callbacks.set("query." + name, {resolve: resolve, reject: reject});
    });
    let msg = {query: name, actor_id: actor_id, vat_id: vat_id};
    window.parent.postMessage(
      msg,
      location.origin);
    return p;
  }

  window.address = function address(vat, id) {
    return function cast(msg) {
      window.parent.postMessage({vat: vat, id: id, cast: msg}, location.origin);
    }
  }
}());
