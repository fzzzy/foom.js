
import { Grid } from "../world/grid";

let joined = [],
  i = 0,
  grid = new Grid();

for (var z = 0; z < 16; z++) {
  for (var y = 0; y < 16; y++) {
    for (var x = 0; x < 16; x++) {
      grid.set(x, y, z, i);
      if (++i > 15) { i = 0; }
    }
  }
}

window.oncast = function (thing) {
  console.log("agent.js oncast", JSON.stringify(thing));
  if (thing.join !== undefined) {
    let a = address(thing.vat, thing.join);
    joined.push(a);
    a({welcome: grid.asBase64()});
  } else if (thing.msg !== undefined) {
    for (let a of joined) {
      a(thing);
    }
  }
}
