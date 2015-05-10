
import { Grid } from "../world/grid";

console.log("Hello from client.js");

let grid = null;

window.oncast = function (thing) {
  console.log("hello from client.js oncast", thing);
  if (thing.welcome !== undefined) {
    grid = new Grid(thing.welcome);
    console.log("new grid", grid);
  } else if (thing.msg !== undefined) {
    let node = document.createElement("div");
    node.textContent = thing.msg;
    document.body.appendChild(node);
  }
}

async function main() {
  let agent = await query("agent");
  console.log("got agent", agent);
  let a = address(agent.vat, agent.id);
  a({join: window.actor_id, vat: window.vat_id});
  a({msg: "Hello, World", id: window.actor_id, vat: window.vat_id});
}

main();
