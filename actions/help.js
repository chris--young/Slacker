var bot = require(__dirname + '/../bot.js');

var fs = require('fs');

var action = {
  name: 'help',

  trigger: /^help.*/,

  description: 'Display information on how to user Slacker.',

  helpText: 'help.md has not loaded yet, try again.',

  setup: function() {
    fs.readFile(__dirname + '/../action_data/help.md', function(error, data) {
      if (error)
        throw error;

      action.helpText = data.toString();
    });
  },

  execute: function(data, callback) {
    var components = data.text.split(' ');

    if (components.length === 1)
      callback(this.helpText);

    for (var x = 0; x < bot.actions.length; x++)
      if (bot.actions[x].name === components[1])
        callback(bot.actions[x].trigger);

    callback('Action "' + components[1] + '" not found.');
  }
};

bot.addAction(action);
