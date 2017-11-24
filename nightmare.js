var companion = 5;

function runNightmare(i) {
  if(i >= connList.length) return;
  var Nightmare = require('nightmare');
  var nightmare = Nightmare({
    electronPath: require('./node_modules/electron'),
    waitTimeout: 60000,
    show: true
  })
  
  nightmare
    .goto('http://www.ipvoid.com/ip-blacklist-check/')
    .type('input[name=ip]', connList[i].ip)
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
      connList[i].risk = result;
      console.log(connList[i]);
      runNightmare(i+companion);
    })
    .catch(function (error) {
      console.error('Search failed:', error);
      runNightmare(i+companion);
    }
  );
}