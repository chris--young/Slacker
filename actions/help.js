var bot = require(__dirname + '/../bot.js')

var fs = require('fs')
var _ = require('lodash');

var action = {
  name: 'help',

  description: 'Display information on how to user Slacker.',

  helpText: 'help.md has not loaded yet, try again.',

  setup: function() {
    fs.readFile(__dirname + '/../action_data/help.md', function(error, data) {
      if (error) {
        throw error;
      }

      action.helpText = data.toString();
    })
  },

  execute: function(data, callback) {
    var args, action, helpText, helpTitle;

    args = data.command.arguments;
    helpText = '';
    helpTitle = '';

    if (args.length === 0) {

      helpTitle = this.name;
      helpText = this.helpText;
    } else if (args.length >= 1) {
      action = _.find(bot.actions, {name: data.command.arguments[0]});
      helpTitle = args[0];

      if (!action) {
        console.log('No action.');
        helpText = 'Command, `' + args[0] + '`, not found. Did you mistype it?';
      } else if (!action.helpText && !action.description) {
        helpText = 'No help information found.';
      } else if (!action.helpText && action.description) {
        helpText = action.description;
      } else if (typeof action.helpText === 'string') {
        helpText = action.helpText;
      } else if (typeof action.helpText === 'function') {
        helpText = action.helpText();
      }
    }

    callback('*' + helpTitle.toUpperCase() + '*\n' + '> ' + helpText.replace(/\n/g, '\n> '));

  }
}

bot.addAction(action);
