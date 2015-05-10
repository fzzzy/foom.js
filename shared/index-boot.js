
import { Vat } from "../shared/actors";
import { parse } from "query-string";

let args = parse(location.search);

console.log("query:", JSON.stringify(args));

if (args.addr === undefined) {
  args.addr = 'ws' + window.location.origin.slice(4);
}

if (args.spawn === undefined) {
  args.spawn = "../client/client-bundle.js";
}

let vat = new Vat(args.addr, "world");

vat.spawn(args.spawn, args.name);
