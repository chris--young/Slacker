// Loads all of the bot functionality.
var bot = require(__dirname + '/../bot.js');

var action = {
  // This is the string that will
  name: 'echo',

  // Used for the `list` action.
  description: 'Echo a string to Slack.',

  // Used for the `help` action.
  helpText: 'Echo a string to Slack.',

  setup: function() {
    // This method will be run at server start up.
  },

  execute: function(data, callback) {
    // If piped data is provided, send that, otherwise send any text passed in.
    callback( data.pipedResponse || data.command.arguments.join(' ') );
  }
};

// Adds this action to the action list.
bot.addAction(action);
