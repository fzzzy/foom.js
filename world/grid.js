
export class Grid {
  constructor(inval) {
    this.array = new ArrayBuffer(2048);
    this.bytes = new Uint8Array(this.array);
    this.things = [];
    if (inval !== undefined) {
      if (inval.grid.length > 2048) {
        throw new Error("Grid too big; should be 2048 bytes long: " + inval.length);
      }
      for (var i = 0, l = inval.grid.length; i < l; i++) {
        this.bytes[i] = inval.grid[i];
      }
      this.things = inval.things;
    }
  }

  get(x, y, z) {
    let index = z * 128 + y * 8 + x / 2,
      byte = this.bytes[Math.floor(index)];
    if (Math.floor(index) === index) {
      return byte & 0b00001111;
    } else {
      return (byte & 0b11110000) >>> 4;
    }
  }

  set(x, y, z, val) {
    let index = z * 128 + y * 8 + x / 2,
      byte = this.bytes[Math.floor(index)];
    if (Math.floor(index) === index) {
      byte = (byte & 0b11110000) | val;
    } else {
      byte = (byte & 0b00001111) | (val << 4);
    }
    this.bytes[Math.floor(index)] = byte;
  }

  add(thing, x, y) {
    for (var i = 0, l = this.things.length; i < l; i++) {
      if (this.things[i].thing === thing) {
        throw new Error("Added thing that is already on the grid: " + thing);
      }
    }
    let zt = 14;
    for (; zt > 0; zt--) {
      if (this.get(x, y, zt) !== 0) {
        break;
      }
    }
    this.things.push({
      thing: thing, x: x, y: y, z: zt + 1,
      heading: ["n"],
      color: Math.floor(Math.random() * 15) + 1,
      inventory: []});
  }

  find(thing) {
    for (var i = 0, l = this.things.length; i < l; i++) {
      if (this.things[i].thing === thing) {
        return [this.things[i].x, this.things[i].y, this.things[i].z, this.things[i].heading];
      }
    }
  }

  remove(thing) {
    for (var i = 0, l = this.things.length; i < l; i++) {
      if (this.things[i].thing === thing) {
        this.things.splice(i, 1);
      }
    }
  }

  move(thing, directions) {
    let t = {},
      original = null;
    for (var i = 0, l = this.things.length; i < l; i++) {
      if (this.things[i].thing === thing) {
        original = this.things[i]
        Object.assign(t, original);
      }
    }
    if (t === null) {
      console.error("thing not found", this.things, thing);
      return;
    }

    t.heading = directions;

    if (directions.indexOf("w") !== -1) {
      t.x -= 1;
    }
    if (directions.indexOf("n") !== -1) {
      t.y -= 1;
    }
    if (directions.indexOf("e") !== -1) {
      t.x += 1;
    }
    if (directions.indexOf("s") !== -1) {
      t.y += 1;
    }

    if (t.x < 0) {
      t.x = 15;
    } else if (t.x > 15) {
      t.x = 0;
    }

    if (t.y < 0) {
      t.y = 15;
    } else if (t.y > 15) {
      t.y = 0;
    }
    if (this.get(t.x, t.y, t.z) !== 0 || this.get(t.x, t.y, t.z - 1) === 0) {
      for (let z = 15; z >= 0; z--) {
        if (this.get(t.x, t.y, z) !== 0) {
          t.z = z + 1;
          break;
        }
      }
    }
    //console.log("moving with z offset", t.z - original.z);
    for (let other of this.things) {
      if (other.x === t.x && other.y === t.y && other.z === t.z) {
        original.heading = t.heading;
        return false;
      }
    }
    if (t.z - original.z > 1) {
      original.heading = t.heading;
      return false;
    } else if ((t.z - original.z) === 1) {
      if (this.get(original.x, original.y, t.z) !== 0) {
        original.heading = t.heading;
        return false;
      }
    }
    Object.assign(original, t);
    return true;
  }

  moveto(thing, loc) {
    let t = null;
    for (var i = 0, l = this.things.length; i < l; i++) {
      if (this.things[i].thing === thing) {
        t = this.things[i];
      }
    }
    if (t === null) {
      console.error("thing not found", this.things, thing);
      return;
    }
    let changed_z = loc[2] - t.z;
    [t.x, t.y, t.z] = loc;
    return changed_z;
  }

  digOrPlace(thing, cb) {
    let t = null;
    for (var i = 0, l = this.things.length; i < l; i++) {
      if (this.things[i].thing === thing) {
        t = this.things[i];
      }
    }
    if (t === null) {
      console.error("thing not found", this.things, thing);
      return;
    }
    let {x, y, z, heading} = t;
    if (heading.indexOf("n") !== -1) {
      y--;
    }
    if (heading.indexOf("e") !== -1) {
      x++;
    }
    if (heading.indexOf("s") !== -1) {
      y++;
    }
    if (heading.indexOf("w") !== -1) {
      x--;
    }
    return cb(x, y, z);
  }

  dig(thing) {
    return this.digOrPlace(thing, (x, y, z) => {
      let oldval = null;
      if ((oldval = this.get(x, y, z)) === 0) {
        if (z > 1) {
          z--;
          if ((oldval = this.get(x, y, z)) === 0) {
            console.log("dig empty space");
            return [-1, -1, -1];
          }
        }
      }
      this.addInventory(thing, oldval);
      this.set(x, y, z, 0);
      return [x, y, z, oldval];
    });
  }

  place(thing, color) {
    return this.digOrPlace(thing, (x, y, z) => {
      let newz = z - 1;
      if (z > 1) {
        console.log("place", x, y, z, z - 1);
        if (this.get(x, y, z - 1) !== 0) {
          newz = z;
          console.log("lower place was occupied");
          if (this.get(x, y, z) !== 0) {
            console.log("place full space");
            return [-1, -1, -1];
          }
        }
      }
      this.removeInventory(thing, color);
      this.set(x, y, newz, color);
      return [x, y, newz, color];
    });
  }

  addInventory(player, item) {
    let t = null;
    for (var i = 0, l = this.things.length; i < l; i++) {
      if (this.things[i].thing === player) {
        t = this.things[i];
      }
    }
    if (t === null) {
      console.error("player not found", this.things, thing);
      return;
    }
    t.inventory.push(item);
  }

  removeInventory(player, item) {
    let t = null;
    for (var i = 0, l = this.things.length; i < l; i++) {
      if (this.things[i].thing === player) {
        t = this.things[i];
      }
    }
    if (t === null) {
      console.error("player not found", this.things, thing);
      return;
    }
    let indexOf = t.inventory.indexOf(item);
    if (indexOf === -1) {
      console.error("item not found", player, this.things, item);
    }
    t.inventory.splice(indexOf, 1);
  }

  asJSON() {
    let array = new Array(2048);
    for (var i = 0; i < 2048; i++) {
      array[i] = this.bytes[i];
    }
    return {grid: array, things: this.things};
  }
}
