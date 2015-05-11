
import { Grid } from "../world/grid";
import * as React from "react";

console.log("Hello from client.js");

class Playfield extends React.Component {
  render() {
    let nodes = [];
    for (let i in this.props.chat) {
      let el = this.props.chat[i];
      nodes.push(<div key={ "chat." + i }>Chat: { el }</div>);
    }
    return <div>
      { nodes }
    </div>;
  }
}

let grid = null,
  chat = [];

window.oncast = function (thing) {
  console.log("hello from client.js oncast", thing);
  if (thing.welcome !== undefined) {
    grid = new Grid(thing.welcome);
    console.log("new grid", grid);
    console.log("react", React);
  } else if (thing.msg !== undefined) {
    chat.push(thing.msg);
  } else {
    return;
  }
  React.render(<Playfield chat={ chat } />, document.getElementById("content"));
}

async function main() {
  let agent = await query("agent");
  console.log("got agent", agent);
  let a = address(agent.vat, agent.id);
  a({join: window.actor_id, vat: window.vat_id});
  a({msg: "Hello, World", id: window.actor_id, vat: window.vat_id});
}

main();
