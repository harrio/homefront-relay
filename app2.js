var btSerial = require('bluetooth-serial-port');

var scanner = new btSerial.BluetoothSerialPort();
var addrs = ["00:13:12:31:25:81", "00:13:12:31:21:65"];
var ports = [];

addrs.forEach(function(addr) {
  var port = new btSerial.BluetoothSerialPort();
  ports.push({ addr: addr, port: port, lastSeen: new Date().getTime() });
});

//scanner.on('found', function(address, name) {
//  console.log("Found device: " + address + " " + name);
//});

var connectPort = function(port) {
  port.port.findSerialPortChannel(port.addr, function(channel) {
    console.log("connecting to " + port.addr + " " + channel);
    port.port.connect(port.addr, channel, function() {
      console.log('success ' + port.addr + " " + channel);
      var data = "";

      port.port.on('data', function(buffer) {
        data += buffer.toString('utf-8');
        var parts = data.split("\n");
        data = parts.pop();
        parts.forEach(function (part, i, array) {
          console.log("data: " + part);
        });
        port.lastSeen = new Date().getTime();
      });
    }, function() {
      console.log("cannot connect " + port.addr);
    });
  });
};

var closePort = function(port) {
  if (port.isOpen()) {
    port.close();
  }
};

var checkPorts = function() {
  console.log("Healthcheck");
  var now = new Date().getTime();
  ports.forEach(function(port) {
    if (now - port.lastSeen > 20000) {
      console.log("Retry " + port.addr);
      closePort(port.port);
      connectPort(port);
    }
  });
};

ports.forEach(function(port) {
  connectPort(port);
});

console.log("Start healthcheck");
setInterval(checkPorts, 60000);

process.on('SIGINT', function() {
  console.log("Shutting down...");
  ports.forEach(function(port) {
    closePort(port.port);
  });
  process.exit();
});

