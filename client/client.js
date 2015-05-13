
import { Grid } from "../world/grid";
import * as React from "react";

const COLORS = [
  "transparent",
  "rgb(248, 12, 18)",
  "rgb(255, 68, 34)",
  "rgb(255, 102, 68)",
  "rgb(255, 153, 51)",
  "rgb(254, 174, 45)",
  "rgb(204, 187, 51)",
  "rgb(208, 195, 16)",
  "rgb(170, 204, 34)",
  "rgb(105, 208, 37)",
  "rgb(18, 189, 185)",
  "rgb(17, 170, 187)",
  "rgb(68, 68, 221)",
  "rgb(51, 17, 187)",
  "rgb(59, 12, 189)",
  "rgb(68, 34, 153)"
];

const TILE_SIZE = 32,
  OFFSET = Math.floor(TILE_SIZE / 2),
  NUDGE = Math.floor(OFFSET / 4);

class GridComponent extends React.Component {
  render() {
    let things = [];
    if (this.props.things) {
      for (let thing of this.props.things) {
        let z_offset = (15 - thing.z) * OFFSET,
          right = (TILE_SIZE * (15 - thing.x)) + OFFSET - NUDGE,
          top = TILE_SIZE * thing.y - NUDGE + TILE_SIZE;

        things.push(<svg
          key={ `things.${thing.thing}` }
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          style={{
            height: "8px", width: "8px",
            position: "absolute",
            right: right + "px",
            top: top + "px"}}>
          <rect
            width="8"
            height="8"
            fill="black" />
        </svg>);
      }
    }
    let lines = [];
    for (let y = 0; y < 16; y++) {
      let line = [];
      for (let x = 0; x < 16; x++) {
        let value = this.props.grid.get(x, y, this.props.z),
          fill = COLORS[value],
          stroke = "black";

        if (value === 0) {
          fill = `rgba(0,0,0,0)`;
          stroke = "none";
        }

        let left = (16 - x) * OFFSET - OFFSET;
        line.push(
          <svg
            key={ `grid.${x},${y}` }
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            style={{height: "48px", width: "48px", position: "relative", left: left + "px"}}>
            <polyline points="0 0 32 0 48 16 48 48 32 32 48 48 16 48 0 32 0 0"
              stroke={ stroke } strokeWidth="1" fill= { fill } />
            <rect
              width="32"
              height="32"
              stroke={ stroke }
              fill={ fill } />
          </svg>
        );
      }
        lines.push(<div
          key={ `row.${y}` }
          style={{
            height: "32px"}}>
          { line }
        </div>);
    }
    let offset = this.props.z * OFFSET;
    return <div style={{
      overflow: "hidden",
      position: "absolute",
      top: (256 - this.props.z * OFFSET) + "px",
      right: (OFFSET + offset) + "px",
      width: "1000px",
      height: "544px",
      textAlign: "right" }}>
      { lines }
      { things }
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
    let slices = [];
    let things = new Array(16);
    for (let i = 0, l = this.props.grid.things.length; i < l; i++) {
      let t = this.props.grid.things[i];
      if (things[t.z] === undefined) {
        things[t.z] = [];
      }
      things[t.z].push(t);
    }
    for (let i = 0; i < 16; i++) {
      slices.push(<GridComponent key={ "slice." + i } grid={ this.props.grid } z={ i } things={ things[i] }/>);
    }
    return <div>
      { slices }
      { nodes }
    </div>;
  }
}

let grid = null,
  chat = [],
  keys = new Map(),
  keypress = null;

window.oncast = function (thing) {
  if (thing.welcome !== undefined) {
    console.log("grid",
      Object.getOwnPropertyNames(thing.welcome),
      thing.welcome.things);
    grid = new Grid(thing.welcome);
  } else if (thing.msg !== undefined) {
    chat.push(thing.msg);
  } else {
    return;
  }
  React.render(<Playfield chat={ chat } grid={ grid } />, document.getElementById("content"));
}

function findKey(e) {
  if (e.keyCode === 37) {
    return "w";
  } else if (e.keyCode === 38) {
    return "n";
  } else if (e.keyCode === 39) {
    return "e";
  } else if (e.keyCode === 40) {
    return "s";
  }
}

window.onkeydown = function (e) {
  let key = findKey(e);
  if (key && !keys.has(key)) {
    keys.set(key, true);
    keypress();
    e.preventDefault();
    return false;
  }
  return true;
};

window.onkeyup = function (e) {
  let key = findKey(e);
  if (key) {
    keys.delete(key);
    e.preventDefault();
    return false;
  }
  return true;
};

async function main() {
  let agent = await query("agent");
  let a = address(agent.value);
  a({join: window.me});
  a({msg: "Hello, World", from: window.me});
  setTimeout(function () {
    a({msg: "another message", from: window.me});
  }, 1000);
  keypress = function keypress() {
    let [...pressed] = keys.keys();
    if (pressed.length) {
      console.log("pressed", pressed);
      a({move: pressed, from: window.me});
    }
  }
  setInterval(keypress, 500);
}

main();
