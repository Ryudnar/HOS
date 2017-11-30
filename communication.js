var localhost = '127.0.0.1';
var PORT = 33333;

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
  var address = server.address();
  console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
  //console.log(remote.address + ':' + remote.port +' - ' + message);
  runParser(message);
  for (index = 0; index <= companion ; index++) {
    runNightmare(index);
  }
});

server.bind(PORT, localhost);

server.send("ping", 12314 , localhost, (result) => {
  if(result != null) {
    server.close();
  }
});

var connList = [];

function runParser(message) {
  var accountObj = JSON.parse(message);
  for (i in accountObj) {
    var remote = accountObj[i].remote;
    if (remote != null) {
      var object = {
          process : accountObj[i].pname,
          ip : remote.addr,
          port : remote.port,
          risk : -1
      };
      connList.push(object);
    }
  }
  
  var obj = {};
  
  for ( var i=0, len=connList.length; i < len; i++ ) {
    obj[connList[i]['ip'] + ":" + connList[i]['port']] = connList[i];
  }
  
  connList = [];
  for ( var key in obj ) {
    if(obj[key].ip != "0.0.0.0" && obj[key].ip != "127.0.0.1") {
      connList.push(obj[key]);
    }
  }
  
  updateJsonStr(update);
}