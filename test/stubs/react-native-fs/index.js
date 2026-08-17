const fs = require('fs');
const path = require('path');
const DIR = process.env.STUB_FS_DIR;
module.exports = {
  DocumentDirectoryPath: DIR,
  readFile: (p, e) => fs.promises.readFile(p, e || 'utf8'),
  writeFile: (p, c, e) => fs.promises.writeFile(p, c, e || 'utf8'),
  appendFile: (p, c, e) => fs.promises.appendFile(p, c, e || 'utf8'),
};
