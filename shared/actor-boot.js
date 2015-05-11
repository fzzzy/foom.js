
(function () {
  let callbacks = new Map();

  window.onmessage = function (m) {
      if (m.data.spawn !== undefined) {
        window.me = m.data.id;
        let node = document.createElement("script");
        node.src = m.data.spawn;
        document.body.appendChild(node);
      } else if (m.data.response !== undefined) {
        let cb = callbacks.get(m.data.response);
        callbacks.delete(m.data.response);
        if (m.data.error !== undefined) {
          cb.reject(m.data);
        } else {
          cb.resolve(m.data);
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
    let msg = {query: name, from: window.me};
    window.parent.postMessage(
      msg,
      location.origin);
    return p;
  }

  window.address = function address(to) {
    return function cast(msg) {
      window.parent.postMessage({to: to, cast: msg}, location.origin);
    }
  }
}());
