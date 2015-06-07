
(function () {
  let callbacks = new Map();

  function address(to) {
    if (typeof to !== "string") {
      throw new Error("Argument to address must be string, not", typeof to, JSON.stringify(to));
    }
    function cast(msg) {
      console.log("cast()", to, JSON.stringify(msg));
      for (let key in msg) {
        if (msg[key].__address !== undefined) {
          msg[key] = {__address: msg[key].__address};
        }
      }
      let m = {to: {__address: to}, cast: msg};
      console.log("postMessage", JSON.stringify(m));
      window.parent.postMessage(m, location.origin);
    }
    cast.__address = to;
    return cast;
  }

  window.onmessage = function (m) {
    if (m.data.spawn !== undefined) {
      if (window.address !== undefined) {
        console.error("spawn called twice:", m.data);
        return;
      }
      window.address = {__address: m.data.id};
      let node = document.createElement("script");
      node.src = m.data.spawn;
      document.body.appendChild(node);
    } else if (m.data.response !== undefined) {
      let cb = callbacks.get(m.data.response);
      callbacks.delete(m.data.response);
      if (m.data.error !== undefined) {
        cb.reject(m.data);
      } else {
        let addr = address(m.data.value.__address);
        console.log("resolve", m.data);
        cb.resolve(addr);
      }
    } else {
      if (window.oncast !== undefined) {
        for (let key in m.data) {
          if (m.data[key].__address !== undefined) {
            m.data[key] = address(m.data[key].__address);
          }
        }
        console.log("actor boot window.oncast", JSON.stringify(m.data));
        window.oncast(m.data);
      }
    }
  }

  window.query = function query(name) {
    let p = new Promise(function (resolve, reject) {
      callbacks.set("query." + name, {resolve: resolve, reject: reject});
    });
    let msg = {query: name, from: {__address: window.address.__address}};
    console.log("postMessage", msg);
    window.parent.postMessage(
      msg,
      location.origin);
    return p;
  }
}());
