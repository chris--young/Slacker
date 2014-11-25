var bot = require(__dirname + '/../bot.js');

var action = {
  name: 'list',

  trigger: /^list$/,

  description: 'List all availble actions.',

  execute: function(data, callback) {
    var output = '*Available Actions*\n\n';
    for (var x = 0; x < bot.actions.length; x++)
      output += '`' + bot.actions[x].name + '` ' + bot.actions[x].description + '\n';

    callback(output);
  }
};

bot.addAction(action);
