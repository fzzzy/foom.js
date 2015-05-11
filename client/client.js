
import { Grid } from "../world/grid";
import * as React from "react";

class GridComponent extends React.Component {
  render() {
    let lines = [];
    for (let y = 0; y < 16; y++) {
      let line = [];
      for (let x = 0; x < 16; x++) {
        let value = this.props.grid.get(x, y, 0);
        line.push(
          <svg
            key={ `grid.${x},${y}` }
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            style={{height: "32px", width: "32px"}}>
            <rect
              width="32"
              height="32"
              fill={ `rgb(0, ${ Math.floor(value / 16 * 255) }, 0)` } />
          </svg>
        );
      }
      lines.push(<div key={ `row.${y}` } style={{ height: "32px" }}>{ line }</div>);
    }
    return <div style={{ position: "absolute", top: "0px", right: "0px" }}>
      { lines }
    </div>
  }
}

class Playfield extends React.Component {
  render() {
    let nodes = [];
    for (let i in this.props.chat) {
      let el = this.props.chat[i];
      nodes.push(<div key={ "chat." + i }>Chat: { el }</div>);
    }
    return <div>
      <GridComponent grid={ this.props.grid } />
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
  React.render(<Playfield chat={ chat } grid={ grid } />, document.getElementById("content"));
}

async function main() {
  let agent = await query("agent");
  let a = address(agent.value);
  a({join: window.me});
  a({msg: "Hello, World", from: window.me});
  setTimeout(function () {
    a({msg: "another message", from: window.me});
  }, 1000);
}

main();
