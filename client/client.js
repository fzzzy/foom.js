
import { Grid } from "../world/grid";
import * as React from "react";

function rgb(r, g, b) {
  return new THREE.MeshBasicMaterial(
    {color: (r << 16) + (g << 8) + b});
}

const COLORS = [
  new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
  rgb(248, 12, 18),
  rgb(255, 68, 34),
  rgb(255, 102, 68),
  rgb(255, 153, 51),
  rgb(254, 174, 45),
  rgb(204, 187, 51),
  rgb(208, 195, 16),
  rgb(170, 204, 34),
  rgb(105, 208, 37),
  rgb(18, 189, 185),
  rgb(17, 170, 187),
  rgb(68, 68, 221),
  rgb(51, 17, 187),
  rgb(59, 12, 189),
  rgb(68, 34, 153),
];

console.log("COLORS", COLORS);

let agent = null,
  grid = null,
  chat = [],
  keys = new Map(),
  keypress = null,
  gridInitialized = false,
  keyInterval = null,
  ignoreKeys = false,
  render = null;

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

let cubes = new Map(),
  outlines = new Map(),
  tetras = new Map();

let scene = new THREE.Scene();

window.oncast = function (thing) {
  if (thing.welcome !== undefined) {
    grid = new Grid(thing.welcome);

    var camera = new THREE.OrthographicCamera(-14, 13, 13, -14, 1, 1000);

    let player = null;

    var color = -1;
//    var camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
    for (let z = 0; z < 16; z++) {
      color += 1048576;
      //console.log("color", color.toString(16));
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
//          var geometry = new THREE.TetrahedronGeometry(1);
          var geometry = new THREE.BoxGeometry(0.98, 0.98, 0.98);

          let voxel = grid.get(x, y, z);
          var material = COLORS[voxel];
          var cube = new THREE.Mesh( geometry, material );
          cube.position.x = x;
          cube.position.y = z;
          cube.position.z = y;
          scene.add( cube );
          cubes.set(`${x},${y},${z}`, cube);
          var egh = new THREE.EdgesHelper( cube, 0x000000 );
          egh.material.linewidth = 2;
          outlines.set(`${x},${y},${z}`, egh);
          if (voxel !== 0) {
            scene.add( egh );
          }
        }
      }
    }

    for (var thing of grid.things) {
      var geometry = new THREE.TetrahedronGeometry(0.25);
      var material = COLORS[thing.color];
      var tetra = new THREE.Mesh(geometry, material);
      tetra.position.x = thing.x;
      tetra.position.y = thing.z - 0.125;
      tetra.position.z = thing.y;
      tetras.set(thing.thing, tetra);
      if (player === null) {
        player = tetra;
      }
      scene.add(tetra);
      var egh = new THREE.EdgesHelper( tetra, 0x000000 );
      egh.material.linewidth = 2;
      scene.add( egh );
    }

    camera.position.set( -15, 30, 30);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = - Math.PI / 4;
    camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) );

    var renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize( 1024, 1024 );
    renderer.setClearColor( 0x000000, 0 );
    document.body.insertBefore(renderer.domElement, document.body.firstChild);

    render = function () {
    	//requestAnimationFrame( render );
    	renderer.render( scene, camera );
      //player.rotation.x += 0.1;
    }
  } else if (thing.msg !== undefined) {
    chat.push(thing.msg);
    let parent = document.getElementById("chat"),
      node = document.createElement("div");
    node.textContent = `Chat: ${thing.msg}`;
    parent.insertBefore(node, parent.firstChild);
  } else if (thing.moved !== undefined) {
    let [x, y, z] = thing.to,
      level_shift = grid.moveto(thing.moved, thing.to);
    let it = tetras.get(thing.moved.__address);
    it.position.x = x;
    it.position.y = z - 0.125;
    it.position.z = y;
  } else if (thing.dig !== undefined) {
    grid.set(thing.x, thing.y, thing.z, 0);
    let tag = `${thing.x},${thing.y},${thing.z}`;
    let cube = cubes.get(tag);
    cube.material = COLORS[0];
    let edge = outlines.get(tag);
    scene.remove(edge);
  } else if (thing.place !== undefined) {
    grid.set(thing.x, thing.y, thing.z, thing.block);
    let tag = `${thing.x},${thing.y},${thing.z}`;
    let cube = cubes.get(tag);
    cube.material = COLORS[thing.block];
    let edge = outlines.get(tag);
    scene.add(edge);
  } else if (thing.placed !== undefined) {
    //grid.set(thing.x, thing.y, thing.z, thing.block);
  } else if (thing.get !== undefined) {
    let el = document.createElement("div");
    el.textContent = thing.get + " get!";
    document.getElementById("chat").appendChild(el);
    let pl = grid.addInventory(window.address, thing.get);
    let node = document.createElement("span");
    node.textContent = thing.get;
    let inv = document.getElementById("inventory");
    inv.insertBefore(node, inv.firstChild);
  } else {
    console.warn("client got unknown message", thing);
    return;
  }
  if (render !== null) {
    render();
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
  } else if (e.keyCode === 191) {
    return "rotate";
  } else {
    console.warn("unknown key", e.keyCode);
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
  agent({join: window.address});
  agent({msg: "Hello, World", from: window.address});
  setTimeout(function () {
    for (let i = 0; i < 6; i++) {
      agent({msg: "another message " + i, from: window.address});
    }
  }, 1000);
  keypress = function keypress() {
    let [...pressed] = keys.keys();
    if (pressed.length) {
      let digIndex = pressed.indexOf("dig");
      if (digIndex !== -1) {
        pressed.splice(digIndex, 1);
        agent({dig: window.address});
      }
      let placeIndex = pressed.indexOf("place");
      if (placeIndex !== -1) {
        pressed.splice(placeIndex, 1);
        let inv = document.getElementById("inventory");
        if (inv.firstChild) {
          agent({place: window.address, block: parseInt(inv.firstChild.textContent)});
          inv.removeChild(inv.firstChild);
        }
      }
      let rotateIndex = pressed.indexOf("rotate");
      if (rotateIndex !== -1) {
        pressed.splice(rotateIndex, 1);
        let inv = document.getElementById("inventory");
        if (inv.firstChild) {
          //console.log("rotating");
          let node = inv.firstChild;
          inv.removeChild(inv.firstChild);
          inv.appendChild(node);
        }
      }
      if (pressed.length) {
        //console.log("pressed", pressed);
        agent({move: pressed, from: window.address});
      }
    }
  }
}

main();

window.addEventListener("load", function (e) {
  document.body.focus();
}, true);
