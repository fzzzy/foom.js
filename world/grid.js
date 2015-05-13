
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
        console.log("found the highest point", zt);
        break;
      }
    }
    this.things.push({thing: thing, x: x, y: y, z: zt + 1});
  }

  find(thing) {
    for (var i = 0, l = this.things.length; i < l; i++) {
      if (this.things[i].thing === thing) {
        return [this.things[i].x, this.things[i].y, this.things[i].z];
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
    for (let z = 15; z > 0; z--) {
      if (this.get(t.x, t.y, z) !== 0) {
        t.z = z + 1;
        break;
      }
    }
  }

  asJSON() {
    let array = new Array(2048);
    for (var i = 0; i < 2048; i++) {
      array[i] = this.bytes[i];
    }
    return {grid: array, things: this.things};
  }
}
