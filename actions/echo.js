var bot = require(__dirname + '/../bot.js');

var action = {
  name: 'echo',

  trigger: /^echo \".*\"$/,

  description: 'Echo a string to Slack.',

  setup: function() {
    // This method will be run at server start up.
  },

  execute: function(data, callback) {
  	callback(data.text);
  }
};

bot.addAction(action);
