const NetInfo = { fetch: async () => ({ isConnected: global.__ONLINE !== false }) };
module.exports = NetInfo;
module.exports.default = NetInfo;
