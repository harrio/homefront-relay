var btSerial = require('bluetooth-serial-port');

var scanner = new btSerial.BluetoothSerialPort();
var addrs = ["00:13:12:31:25:81", "00:13:12:31:21:65"];
var ports = [];

var connect = function(addr) {
  var port = new btSerial.BluetoothSerialPort();
  port.findSerialPortChannel(addr, function(channel) {
    console.log("connecting to " + addr + " " + channel);
    port.connect(addr, channel, function() {
      console.log('connected to ' + addr + " " + channel);
      var data = "";

      btSerial.on('data', function(buffer) {
        data += buffer.toString('utf-8');
        var parts = data.split("\n");
        data = parts.pop();
        parts.forEach(function (part, i, array) {
          console.log("data: " + part);
        });
      });
    }, function() {
      console.log('cannot connect');
    });
  });
};

addrs.forEach(function(addr) {
  connect(addr);
});

