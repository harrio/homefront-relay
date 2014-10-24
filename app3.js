var btSerial = require('bluetooth-serial-port'),
  jf = require('./services/jsonfile'),
  request = require('request');

var addrs = ["00:13:12:31:25:81", "00:13:12:31:21:65", "00:13:12:31:23:96"];
var curr = 0;
var port;

var config = jf.readFileSync("config.json");

var postData = function(data, addr) {
  
  var dataObj =  { mac: addr, data: JSON.parse(data) };
 
  var options = {
    url: config.host + ":" + config.port + "/saveData",
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    json: dataObj
  };

  function callback(error, res, body) {
    if (!error && res.statusCode == 201) {
        console.log("Upload successful");
    }
    else {
        console.log('Error occurred: '+ error);
    }
  }
  
  request(options, callback);

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
          closePort();
          postData(part, addr);
        });
      });
    }, function() {
      console.log("cannot connect " + addr);
      closePort();
    });
  }, 
    function() {
      console.log("nothing found");
      closePort();
    }
  );
};

var closePort = function() {
  if (port && port.isOpen()) {
    console.log("Close port");
    port.close();
  }
};

var checkPort = function() {
  console.log("Fetch data");
  if (curr > 2) {
    curr = 0;
  }
  var addr = addrs[curr];
  console.log("Query " + addr);
  connectPort(addr);
  curr++;
};

console.log("Start schedule");
setInterval(checkPort, 60000);

process.on('SIGINT', function() {
  console.log("Shutting down...");
  closePort();
  process.exit();
});

