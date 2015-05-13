
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

let grid = null,
  chat = [],
  keys = new Map(),
  keypress = null,
  gridInitialized = false,
  keyInterval = null,
  ignoreKeys = false;

function calculateThingTopRight(thing) {
  let z_offset = (15 - thing.z) * OFFSET,
    right = (TILE_SIZE * (15 - thing.x)) + OFFSET - NUDGE,
    top = TILE_SIZE * thing.y - NUDGE + TILE_SIZE;
    return [top, right];
}

function calculatePointsFromHeading(head) {
  let points = null;
  if (head.indexOf("n") !== -1 && head.indexOf("w") !== -1) {
    points = "2,2 8,4 4,8 2,2";
  } else if (head.indexOf("n") !== -1 && head.indexOf("e") !== -1) {
      points = "6,2 4,8 0,4 6,2";
  } else if (head.indexOf("s") !== -1 && head.indexOf("e") !== -1) {
      points = "6,6 0,4 4,0 6,6";
  } else if (head.indexOf("s") !== -1 && head.indexOf("w") !== -1) {
      points = "2,6 4,0 8,4 2,6";
  } else if (head.indexOf("w") !== -1) {
      points = "1,4 8,0 8,8 0,4";
  } else if (head.indexOf("n") !== -1) {
    points = "4,0 8,8 0,8 4,0";
  } else if (head.indexOf("e") !== -1) {
    points = "8,4 0,8 0,0 8,4";
  } else if (head.indexOf("s") !== -1) {
    points = "4,8 0,0 8,0 4,8";
  }
  return points;
}

class GridComponent extends React.Component {
  render() {
    let things = [];
    if (this.props.things) {
      for (let thing of this.props.things) {
        let [top, right] = calculateThingTopRight(thing);

        things.push(<svg
          key={ `things.${thing.thing}` }
          id={ `thing.${thing.thing}` }
          className="thing"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          style={{
            height: "8px", width: "8px",
            position: "absolute",
            transition: "top 0.25s, right 0.25s",
            right: right + "px",
            top: top + "px"}}>
          <polygon points={ calculatePointsFromHeading(thing.heading) }
            stroke="white"
            fill={ COLORS[Math.floor(Math.random() * 15) + 1] } />
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
            id={ `tile.${x},${y},${this.props.z}`}
            key={ `grid.${x},${y},${this.props.z}` }
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
    return <div
      id={ `slice.${this.props.z}` }
      style={{
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
    return <div id="chat">
      { slices }
      { nodes }
    </div>;
  }
}

window.oncast = function (thing) {
  if (thing.welcome !== undefined) {
    console.log("grid",
      Object.getOwnPropertyNames(thing.welcome),
      thing.welcome.things);
    grid = new Grid(thing.welcome);
  } else if (thing.msg !== undefined) {
    chat.push(thing.msg);
    let parent = document.getElementById("chat"),
      node = document.createElement("div");
    node.textContent = `Chat: ${thing.msg}`;
    parent.appendChild(node);
    return;
  } else if (thing.moved !== undefined) {
    let [x, y, z] = thing.to,
      node = document.getElementById(`thing.${thing.moved}`),
      [top, right] = calculateThingTopRight({x: x, y: y, z: z}),
      level_shift = grid.moveto(thing.moved, thing.to);

    node.firstChild.setAttribute(
      "points", calculatePointsFromHeading(thing.heading));

    function transitionListener(cb) {
      function listener() {
        if (cb !== undefined) {
          cb();
        }
        node.removeEventListener('transitionend', listener, false);
        ignoreKeys = false;
      }
      node.addEventListener('transitionend', listener, false);
      ignoreKeys = true;
    }

    if (level_shift < 0) {
      transitionListener(function () {
        let slice = document.getElementById(`slice.${z}`);
        node.parentNode.removeChild(node);
        slice.insertBefore(node, slice.firstChild);
      });

    } else if (level_shift > 0) {
      let slice = document.getElementById(`slice.${z}`);
      node.parentNode.removeChild(node);
      slice.insertBefore(node, slice.firstChild);
      transitionListener();
    } else {
      if (parseInt(node.style.top) !== top || parseInt(node.style.right) !== right){
        transitionListener();
      }
    }


    setTimeout(function() {
      node.style.top = `${top}px`;
      node.style.right = `${right}px`;
    }, 1);

    return;
  } else if (thing.dig !== undefined) {
    let tile = document.getElementById(`tile.${thing.x},${thing.y},${thing.z}`);
    for (let i = 0; i < tile.childNodes.length; i++) {
      tile.childNodes[i].style.fill = "transparent";
      tile.childNodes[i].style.stroke = "transparent";
    }
    console.log("dig", thing);
    return;
  } else if (thing.get !== undefined) {
    let el = document.createElement("div");
    el.textContent = thing.get + " get!";
    document.body.appendChild(el);
    let player = grid.addInventory(window.me, thing.get);
    return;
  } else {
    console.log("client got message", thing);
  }
  if (grid !== null) {
    React.render(<Playfield chat={ chat } grid={ grid } />, document.getElementById("content"));
  }
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
  } else if (e.keyCode === 32) {
    return "dig";
  }
}

window.addEventListener("keydown", function (e) {
  let key = findKey(e);
  if (!ignoreKeys && key && !keys.has(key)) {
    keys.set(key, true);
    if (keyInterval === null) {
      keypress();
      keyInterval = setInterval(keypress, 500);
    }
    e.preventDefault();
    return false;
  }
  if (key) {
    e.preventDefault();
    return false;
  }
  return true;
});

window.addEventListener("keyup", function (e) {
  let key = findKey(e);
  if (key) {
    keys.delete(key);
    let [...ks] = keys.keys();
    if (ks.length === 0) {
      clearInterval(keyInterval);
      keyInterval = null;
    }
    e.preventDefault();
    return false;
  }
  return true;
});

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
      let digIndex = pressed.indexOf("dig");
      if (digIndex !== -1) {
        pressed.splice(digIndex, 1);
        a({dig: window.me});
      }
      if (pressed.length) {
        //console.log("pressed", pressed);
        a({move: pressed, from: window.me});
      }
    }
  }
}

main();
