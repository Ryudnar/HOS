var companion = 5;
var groups = {'process':'main', 'children' : []};
localStorage.setItem('graph', JSON.stringify(groups));

function runNightmare(i) {
  if(i >= connList.length) return;
  var Nightmare = require('nightmare');
  var nightmare = Nightmare({
    electronPath: require('./node_modules/electron'),
    waitTimeout: 60000,
    show: false
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

      groups = {'process':'main', 'children' : []};
      connList.forEach(function(item){
          var list = groups['children'];
          var found = false;
          for(obj in list) {
            if(list[obj].process === item.process) {
              found = true;
              break;
            }
          }
          if(found){
              if(item.risk != -1) {
                  for(obj in list) {
                      if(list[obj].process === item.process) {
                          groups['children'][obj]['children'].push(item);
                      }
                  }
              }
          } else{
              if(item.risk != -1) {
                  var temp = {};
                  temp['process'] = item.process;
                  temp['children'] = [];
                  groups['children'].push(temp);
                  for(obj in list) {
                      if(list[obj].process === item.process) {
                          groups['children'][obj]['children'].push(item);
                      }
                  }
              }
          }

          localStorage.setItem('graph', JSON.stringify(groups));
      });

      runNightmare(i+companion);
    })
    .catch(function (error) {
      console.error('Search failed:', error);
      runNightmare(i+companion);
    }
  );
}