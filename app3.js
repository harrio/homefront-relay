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

      port.port.write(new Buffer('1', 'utf-8'), function(err, bytesWritten) {
        if (err) console.log(err);
      });

      port.port.on('data', function(buffer) {
        data += buffer.toString('utf-8');
        var parts = data.split("\n");
        data = parts.pop();
        parts.forEach(function(part, i, array) {
          console.log("data: " + part);
          closePort(port.port);
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
  console.log("Fetch data");
  var now = new Date().getTime();
  ports.forEach(function(port) {
    console.log("Query " + port.addr);
    connectPort(port);
  });
};

console.log("Start schedule");
setInterval(checkPorts, 30000);

process.on('SIGINT', function() {
  console.log("Shutting down...");
  ports.forEach(function(port) {
    closePort(port.port);
  });
  process.exit();
});

