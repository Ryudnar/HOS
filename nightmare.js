//var ipList = ['8.8.8.8', '121.129.74.234'];
var companion = 5;

function runNightmare(i) {
  if(i >= ipList.length) return;
  var Nightmare = require('nightmare');
  var nightmare = Nightmare({
    electronPath: require('./node_modules/electron'),
    waitTimeout: 60000,
    show: false
  })
  
  nightmare
    .goto('http://www.ipvoid.com/ip-blacklist-check/')
    .type('input[name=ip]', ipList[i])
    .click('button[type=submit]')
    .wait('a[title="Close"]')
    .click('a[title="Close"]')
    .wait('h3#ip-address-information')
    .evaluate(function () {
      var selection = document.querySelector('.label-danger');
      if(selection) {
        var str = selection.innerHTML;
        str = str.substring(12, str.length);
        str = str.split('/');
        return parseInt(str[0]);
      }
      else {
        return 0;
      }
    })
    .end()
    .then(function (result) {
      var attr = [];
      attr.push(result);
      attr.push(ipList[i]);
      console.log(attr);
      runNightmare(i+companion);
    })
    .catch(function (error) {
      console.error('Search failed:', error);
      runNightmare(i+companion);
    }
  );
}

for (index = 0; index <= companion ; index++) {
  runNightmare(index);
}