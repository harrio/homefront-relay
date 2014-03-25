var serialport = require("serialport");

var SerialPort = serialport.SerialPort;
var comms = ["/dev/rfcomm0", "/dev/rfcomm1"];

var ports = [];
comms.forEach(function(comm) {
  var serialPort = new SerialPort(comm,
    { baudrate: 9600,
    parser: serialport.parsers.readline("\n") });
  ports.push({ port: serialPort, lastSeen: new Date().getTime() });
});

var openSerial = function(serialPort) {
  var doOpen = function() {
    console.log("open serial " + serialPort.port.path);
    serialPort.port.open(function (err) {
      if (err) {
        console.log("serial failed...");
        setTimeout(doOpen, 5000);
      } else {
        console.log('serial open ' + serialPort.port.path);
        serialPort.port.on('data', function(data) {
          console.log(serialPort.port.path + " " + data);
        });
        serialPort.port.on('error', function(data) {
          console.log("lost serial, retry");
          doOpen();
        });
      }
    });
  };
  return doOpen;
};

var closePort = function(serialPort) {
  serialPort.port.close(function(err) {
    console.log("Close " + serialPort.port.path + " = " + err);
  });
};

var closeSerial = function() {
  ports.forEach(function(serialPort) {
    closePort(serialPort);
  });
};

var checkSerial = function() {
  console.log("Healthcheck");
  var now = new Date().getTime();
  ports.forEach(function(serialPort) {
    if (now - serialPort.lastSeen > 10000) {
      console.log("Retry " + serialPort.port.path);
      closePort(serialPort);
      openSerial(serialPort)();
    }
  });
};

console.log("Start healthcheck");
setInterval(checkSerial, 5000);

console.log("Open ports");
ports.forEach(function(port) {
  openSerial(port)();
});

process.on('exit', function() {
  console.log("Shutting down...");
  closeSerial();
});

process.on('SIGINT', function() {
  console.log("Shutting down...");
  closeSerial();
  process.exit();
});