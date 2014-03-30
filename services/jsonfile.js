var fs = require('fs');
var q = require('q');

var spaces = 2;

var readFileQ = q.nfbind(fs.readFile);

var parse = function(data) {
  return JSON.parse(data);
};

exports.readFile = function(file) {
  return readFileQ(file).then(parse);
};

var writeFileQ = q.nfbind(fs.writeFile);

var stringify = function(obj) {
  return JSON.stringify(obj, null, spaces);
};

exports.writeFile =  function(file, obj) {
  return writeFileQ(file, stringify(obj));
};

exports.readFileSync = function(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

