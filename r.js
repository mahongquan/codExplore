var fs=require("fs");
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
var r=fs.readFileSync("run.bat");
console.log(decoder.write(r));
// console.log(decoder.end());
// const { StringDecoder } = require('string_decoder');
// const decoder = new StringDecoder('utf8');

// decoder.write(Buffer.from([0xE2]));
// decoder.write(Buffer.from([0x82]));
// console.log(decoder.end(Buffer.from([0xAC])));