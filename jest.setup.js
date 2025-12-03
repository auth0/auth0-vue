// TextEncoder / TextDecoder polyfill
const { TextEncoder, TextDecoder } = require('util');

if (global.TextEncoder === undefined) {
  global.TextEncoder = TextEncoder;
}

if (global.TextDecoder === undefined) {
  global.TextDecoder = TextDecoder;
}
