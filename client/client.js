
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

let agent = null,
  grid = null,
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
            fill={ COLORS[thing.color] } />
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
        right: offset + "px",
        width: "1000px",
        height: "528px",
        textAlign: "right" }}>
      { lines }
      { things }
    </div>
  }
}

class Playfield extends React.Component {
  submitChat(e) {
    e.preventDefault();
    let chat = document.getElementById("cmdline"),
      inpt = chat.value;

    chat.value = "";
    agent({msg: inpt, from: window.me});
  }

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
      <div id="chat" style={{
        fontFamily: "Gill Sans Light, sans-serif",
        fontSize: "12pt",
        color: "black",
        textShadow: "-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white",
        paddingTop: "32px",
        paddingBottom: "2em",
        position: "relative"}}><span></span></div>
      <form  style={{
        boxSizing: "border-box",
        border: "1px solid #ababab",
        backgroundColor: "white",
        padding: "0.25em",
        position: "fixed",
        bottom: "0.25em",
        left: "0.25em",
        width: "30em"
        }} onSubmit={ this.submitChat.bind(this) }>
        <input
          id="cmdline"
          type="text"
          style={{ width: "85%" }} />
        <button style={{ marginLeft: "0.75em", width: "11%" }}>chat</button>
      </form>
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
    parent.insertBefore(node, parent.firstChild);
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
    let tile = document.getElementById(`tile.${thing.x},${thing.y},${thing.z}`),
      fill = tile.firstChild.getAttribute("fill");

    for (let i = 0; i < tile.childNodes.length; i++) {
      tile.childNodes[i].style.fill = "transparent";
      tile.childNodes[i].style.stroke = "transparent";
    }
    let el = document.createElement("div");
    el.style.display = "inline-block";
    el.style.backgroundColor = fill;
    el.style.height = "32px";
    el.style.width = "32px";
    document.getElementById("inventory").appendChild(el);
    console.log("dig", thing, fill);
    return;
  } else if (thing.place !== undefined) {
    let tile = document.getElementById(`tile.${thing.x},${thing.y},${thing.z}`),
      color = COLORS[thing.block];

    for (let i = 0; i < tile.childNodes.length; i++) {
      tile.childNodes[i].style.fill = color;
      tile.childNodes[i].style.stroke = "black";
    }
    console.log("place", thing, color);
    return;
  } else if (thing.placed !== undefined) {
    let inv = document.getElementById("inventory"),
      color = inv.firstChild.style.backgroundColor;

    inv.removeChild(inv.firstChild);
  } else if (thing.get !== undefined) {
    let el = document.createElement("div");
    el.textContent = thing.get + " get!";
    document.getElementById("chat").appendChild(el);
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
  } else if (e.keyCode === 13) {
    return "place";
  } else {
    console.log("unknown key", e.keyCode);
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
  let agent_addr = await query("agent");
  agent = address(agent_addr.value);
  agent({join: window.me});
  agent({msg: "Hello, World", from: window.me});
  setTimeout(function () {
    for (let i = 0; i < 6; i++) {
      agent({msg: "another message " + i, from: window.me});
    }
  }, 1000);
  keypress = function keypress() {
    let [...pressed] = keys.keys();
    if (pressed.length) {
      let digIndex = pressed.indexOf("dig");
      if (digIndex !== -1) {
        pressed.splice(digIndex, 1);
        agent({dig: window.me});
      }
      let placeIndex = pressed.indexOf("place");
      if (placeIndex !== -1) {
        pressed.splice(placeIndex, 1);
        let inv = document.getElementById("inventory"),
          color = inv.firstChild.style.backgroundColor;
        for (let i = 0, l = COLORS.length; i < l; i++) {
          if (COLORS[i] === color) {
            agent({place: window.me, block: i});
            break;
          }
        }
      }
      if (pressed.length) {
        //console.log("pressed", pressed);
        agent({move: pressed, from: window.me});
      }
    }
  }
}

main();

window.addEventListener("load", function (e) {
  document.body.focus();
}, true);
