var serialport = require("serialport");

var SerialPort = serialport.SerialPort;
var comms = ["/dev/rfcomm0", "/dev/rfcomm1"];

var ports = [];
comms.forEach(function(comm) {
  var serialPort = new SerialPort(comm,
    { baudrate: 9600,
    parser: serialport.parsers.readline("\n") });
  ports.push(serialPort);
});

var openSerial = function(serialPort) {
  var doOpen = function() {
    console.log("open serial...");
    serialPort.open(function (err) {
      if (err) {
        console.log("serial failed...");
        setTimeout(doOpen(), 5000);
      } else {
        console.log('serial open');
        serialPort.on('data', function(data) {
          console.log(data);
        });
        serialPort.on('error', function(data) {
          console.log("lost serial, retry");
          doOpen();
        });
      }
    });
  };
  return doOpen;
};

ports.forEach(function(port) {
  openSerial(port)();
});
