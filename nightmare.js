var Nightmare = require('nightmare');
var nightmare = Nightmare({
  electronPath: require('./node_modules/electron'),
  waitTimeout: 60000,
  show: true
})

nightmare
  .goto('http://www.ipvoid.com/ip-blacklist-check/')
  .type('input[name=ip]', '8.8.8.8')
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
      return "safe";
    }
  })
  .end()
  .then(function (result) {
    console.log(result)
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  })
;

var nightmare2 = Nightmare({
  electronPath: require('./node_modules/electron'),
  waitTimeout: 60000,
  show: true
})
nightmare2
  .goto('http://www.ipvoid.com/ip-blacklist-check/')
  .type('input[name=ip]', '121.129.74.234')
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
      return "safe";
    }
  })
  .end()
  .then(function (result) {
    console.log(result)
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  })
;