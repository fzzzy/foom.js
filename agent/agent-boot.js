
console.log("hello from agent.js");

let addr = 'ws://localhost:8080',
  vat = new Vat(addr, "agent"),
  agent = vat.spawn("../agent/agent.js", "agent");
