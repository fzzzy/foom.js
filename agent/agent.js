

let joined = [];

window.oncast = function (thing) {
  console.log("agent.js oncast", JSON.stringify(thing));
  if (thing.join !== undefined) {
    joined.push(address(thing.vat, thing.join));
  } else if (thing.msg !== undefined) {
    for (let a of joined) {
      a(thing);
    }
  }
  console.log("joined", JSON.stringify(joined));
}
