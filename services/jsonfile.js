var fs = require('fs');

var spaces = 2;

var parse = function(data) {
  return JSON.parse(data);
};

var stringify = function(obj) {
  return JSON.stringify(obj, null, spaces);
};

exports.readFileSync = function(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

