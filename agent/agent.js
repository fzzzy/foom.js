

import { Grid } from "../world/grid";

let joined = [],
  i = 15,
  zt = 14,
  grid = new Grid();

for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    zt = i;
    if (zt === 15) { zt = 14; }
    if (zt === 0) { zt = 1; }
    for (let z = 0; z < zt; z++) {
      grid.set(x, y, z, i || 1);
    }
  }
  if (--i < 0) { i = 15; }
}

window.oncast = function (thing) {
  //console.log("agent.js oncast", JSON.stringify(thing));
  if (thing.join !== undefined) {
    console.log("joined", thing.join);
    let a = address(thing.join);
    joined.push(a);
    grid.add(thing.join, 3, 3);
    a({welcome: grid.asJSON()});
  } else if (thing.msg !== undefined) {
    console.log("msg", thing.from, thing.msg);
    for (let a of joined) {
      a(thing);
    }
  } else if (thing.move !== undefined) {
    grid.move(thing.from, thing.move);
    let loc = grid.find(thing.from),
      pressed = thing.move;

    for (let a of joined) {
      a({welcome: grid.asJSON()});
    }
    console.log("loc", pressed, loc);
  }
}
