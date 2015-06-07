

import { Grid } from "../world/grid";

let joined = [],
  zt = 14,
  grid = new Grid();

for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    let rnd = Math.random();
    zt = 15 - y;

    if (rnd < 0.13) {
      zt--;
    } else if (rnd > 0.87) {
      zt++;
    }

    if (zt > 15) { zt = 15; }
    if (zt <= 1) { zt = 1; }
    for (let z = 0; z < zt; z++) {
      grid.set(x, y, z, z || 1);
    }
  }
}

window.oncast = function (thing) {
  if (thing.join !== undefined) {
    grid.add(thing.join, 3, 3);
    let who = grid.info(thing.join);
    for (let other of joined) {
      other({joined: who, id: thing.join});
    }
    joined.push(thing.join);
    thing.join({welcome: grid.asJSON()});
  } else if (thing.msg !== undefined) {
    for (let a of joined) {
      a(thing);
    }
  } else if (thing.move !== undefined) {
    grid.move(thing.from, thing.move);
    let loc = grid.find(thing.from),
      pressed = thing.move;

    for (let a of joined) {
      a({moved: thing.from, to: loc, heading: thing.move});
    }
  } else if (thing.dig !== undefined) {
    let [x, y, z, oldval] = grid.dig(thing.dig);
    if (x !== -1 && y !== -1 && z !== -1) {
      let digger = thing.dig;
      digger({get: oldval});
      for (let a of joined) {
        a({dig: thing.dig, x: x, y: y, z: z});
      }
    }
  } else if (thing.place !== undefined) {
    let [x, y, z, color] = grid.place(thing.place, thing.block);
    if (x !== -1 && y !== -1 && z !== -1) {
      let placer = thing.place;
      placer({placed: color});
      console.log("place", x, y, z, color);
      for (let a of joined) {
        a({place: thing.place, x: x, y: y, z: z, block: color});
      }
    }
  } else {
    console.warn("unknown agent message", JSON.stringify(thing));
  }
}
