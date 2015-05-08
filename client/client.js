

console.log("Hello from client.js");

window.oncast = function (thing) {
  console.log("hello from client.js oncast", thing);
  if (thing.msg !== undefined) {
    let node = document.createElement("div");
    node.textContent = thing.msg;
    document.body.appendChild(node);
  }
}


query("agent", function (agent) {
  console.log("got agent", agent);
  let a = address(agent.vat, agent.id);
  a({join: window.actor_id, vat: window.vat_id});
  a({msg: "Hello, World", id: window.actor_id, vat: window.vat_id});
});
