var btSerial = require('bluetooth-serial-port');

var addrs = ["00:13:12:31:25:81", "00:13:12:31:21:65"];
var curr = 0;
var port = new btSerial.BluetoothSerialPort();

var connectPort = function(addr) {
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
        });
      });
    }, function() {
      console.log("cannot connect " + addr);
    });
  });
};

var closePort = function() {
  if (port.isOpen()) {
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
};

console.log("Start schedule");
setInterval(checkPort, 30000);

process.on('SIGINT', function() {
  console.log("Shutting down...");
  closePort();
  process.exit();
});

