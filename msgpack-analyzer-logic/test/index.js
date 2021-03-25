// @ts-nocheck
const util = require('util');
const Packer = require('../build/packer.js');
const Unpacker = require('../build/unpacker.js');
const Analyzer = require('../build/analyzer.js');

let p = new Packer();

p.pack({ str: 'Hello world from JS', bo: true, num: 123, tst: ['a', [null, 0.123], 87, false] });
p.packString('Hello world from JS');
p.packBool(true);
p.packInt(123);
const bytes = p.takeBytes();

/*/
console.log(bytes);

const hex = Array.from(bytes, function (byte) {
  return ('0' + (byte & 0xff).toString(16)).slice(-2);
}).join(' ');

console.log(hex);
console.log();

let up = new Unpacker(bytes);

let v1 = up.unpack();
console.log(v1);
//*/

/*/
v1 = up.unpack();
console.log(v1);
v1 = up.unpack();
console.log(v1);
v1 = up.unpack();
console.log(v1);
//*/

console.log();

let an = new Analyzer(bytes);

console.log(util.inspect(an.analyze(), true, 10, true));
