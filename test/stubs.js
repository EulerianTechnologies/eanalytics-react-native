// Redirects the React Native native modules to the stubs in ./stubs, so the SDK
// can be exercised on plain Node. Loaded by scenarios.js before anything else.
const Module = require('module');
const path = require('path');

const STUBBED = [
  'react-native',
  'react-native-fs',
  'react-native-logs',
  'react-native-device-info',
  'react-native-play-install-referrer',
  '@react-native-community/netinfo',
  '@react-native-async-storage/async-storage',
  '@sparkfabrik/react-native-idfa-aaid',
];

const STUBS_DIR = path.join(__dirname, 'stubs');
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, ...rest) {
  const stubbed = STUBBED.some((name) => request === name || request.startsWith(name + '/'));
  if (stubbed) {
    return originalResolve.call(this, path.join(STUBS_DIR, request), ...rest);
  }
  return originalResolve.call(this, request, ...rest);
};
