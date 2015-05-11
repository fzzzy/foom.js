
import { Grid } from "../world/grid";
import * as React from "react";

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
  if (thing.welcome !== undefined) {
    grid = new Grid(thing.welcome);
  } else if (thing.msg !== undefined) {
    chat.push(thing.msg);
  } else {
    return;
  }
  React.render(<Playfield chat={ chat } />, document.getElementById("content"));
}

async function main() {
  let agent = await query("agent");
  let a = address(agent.value);
  a({join: window.me});
  a({msg: "Hello, World", from: window.me});
}

main();
