
/* https://gist.github.com/jonleighton/958841 */

// Converts an ArrayBuffer directly to base64, without any intermediate 'convert to string then
// use window.btoa' step. According to my tests, this appears to be a faster approach:
// http://jsperf.com/encoding-xhr-image-data/5

function base64ArrayBuffer(arrayBuffer) {
  var base64    = ''
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  var bytes         = new Uint8Array(arrayBuffer)
  var byteLength    = bytes.byteLength
  var byteRemainder = byteLength % 3
  var mainLength    = byteLength - byteRemainder

  var a, b, c, d
  var chunk

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3)   << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }

  return base64
}

export class Grid {
  constructor(str) {
    this.array = new ArrayBuffer(2048);
    this.bytes = new Uint8Array(this.array);
    if (str !== undefined) {
      let b = atob(str);
      if (b.length > 2048) {
        throw new Error("Grid too big; should be 2048 bytes long");
      }
      for (var i = 0; i < str.length; i++) {
        this.bytes[i] = str.charCodeAt(i);
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

  asBase64() {
    return base64ArrayBuffer(this.array);
  }
}
