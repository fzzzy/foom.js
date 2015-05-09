
import { Vat } from "../shared/actors";

console.log("hello from client-boot.js");

let addr = 'ws' + window.location.origin.slice(4),
  vat = new Vat(addr, "client");

console.log("addr", addr);

let act = vat.spawn("../client/client.js");
let act2 = vat.spawn("../client/client.js");

act.cast("hello", "world");
