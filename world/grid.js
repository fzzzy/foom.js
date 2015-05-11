
export class Grid {
  constructor(inval) {
    this.array = new ArrayBuffer(2048);
    this.bytes = new Uint8Array(this.array);
    if (inval !== undefined) {
      if (inval.length > 2048) {
        throw new Error("Grid too big; should be 2048 bytes long: " + inval.length);
      }
      for (var i = 0; i < inval.length; i++) {
        this.bytes[i] = inval[i];
      }
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

  asJSON() {
    let array = new Array(2048);
    for (var i = 0; i < 2048; i++) {
      array[i] = this.bytes[i];
    }
    return array;
  }
}
