var btSerial = require('bluetooth-serial-port'),
  jf = require('./services/jsonfile');

var addrs = ["00:13:12:31:25:81", "00:13:12:31:21:65"];
var curr = 0;
var port;

var config = jf.readFileSync("config.json");

var postData = function(data) {
  var options = {
    host: config.host,
    port: config.port,
    path: '/saveData',
    method: 'POST'
  };

  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write(data);
  req.end();

};

var connectPort = function(addr) {
  port = new btSerial.BluetoothSerialPort();
  port.findSerialPortChannel(addr, function(channel) {
    console.log("connecting to " + addr + " " + channel);
    port.connect(addr, channel, function() {
      console.log('success ' + addr + " " + channel);
      var data = "";

      port.write(new Buffer('1', 'utf-8'), function(err, bytesWritten) {
        if (err) console.log(err);
      });

      port.on('data', function(buffer) {
        data += buffer.toString('utf-8');
        var parts = data.split("\n");
        data = parts.pop();
        parts.forEach(function(part, i, array) {
          console.log("data: " + part);
          closePort();
          postData(part);
        });
      });
    }, function() {
      console.log("cannot connect " + addr);
    });
  });
};

var closePort = function() {
  if (port.isOpen()) {
    console.log("Close port");
    port.close();
  }
};

var checkPort = function() {
  console.log("Fetch data");
  if (curr > 1) {
    curr = 0;
  }
  var addr = addrs[curr];
  console.log("Query " + addr);
  connectPort(addr);
  curr++;
};

console.log("Start schedule");
setInterval(checkPort, 30000);

process.on('SIGINT', function() {
  console.log("Shutting down...");
  closePort();
  process.exit();
});

