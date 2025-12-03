// Polyfills for Node.js test environment
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder ??= TextEncoder;
global.TextDecoder ??= TextDecoder;
