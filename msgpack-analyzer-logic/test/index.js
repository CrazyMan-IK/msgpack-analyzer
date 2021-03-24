const Packer = require('../build/packer.js');
const Unpacker = require('../build/unpacker.js');

let p = new Packer();

p.pack({ str: 'Hello world from JS', bo: true, num: 123 });
//p.packString('Hello world from JS');
//p.packBool(true);
//p.packInt(123);
const bytes = p.takeBytes();

console.log(bytes);

const hex = Array.from(bytes, function (byte) {
  return ('0' + (byte & 0xff).toString(16)).slice(-2);
}).join('');

console.log(hex);

let up = new Unpacker(bytes);

let v1 = up.unpack();
console.log(v1);

/*
let v1 = up.unpack();
let v2 = up.unpack();
let v3 = up.unpack();
console.log(v1);
console.log(v2);
console.log(v3);
*/
