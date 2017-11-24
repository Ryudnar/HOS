var ips = ['8.8.8.8', '121.129.74.234'];

for (i in ipList) {
    
  var Nightmare = require('nightmare');
  var nightmare = Nightmare({
    electronPath: require('./node_modules/electron'),
    waitTimeout: 60000,
    show: false
  })
  
  nightmare
    .goto('http://www.ipvoid.com/ip-blacklist-check/')
    .type('input[name=ip]', ips[i])
    .click('button[type=submit]')
    .wait('a[title="Close"]')
    .click('a[title="Close"]')
    .wait('h3#ip-address-information')
    .evaluate(function () {
      var selection = document.querySelector('.label-danger');
      if(selection) {
        return selection.innerHTML;
      }
      else {
        return "safe: ".concat(ips[i]);
      }
    })
    .end()
    .then(function (result) {
      console.log(result.concat(": ").concat(ips[i]))
    })
    .catch(function (error) {
      console.error('Search failed:', error);
    })
  ;
}