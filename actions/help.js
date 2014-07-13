var bot = require(__dirname + '/../bot.js')

var fs = require('fs')

var action = {
  trigger: 'help',

  description: 'Display information on how to user Slacker.',

  helpText: 'help.md has not loaded yet, try again.',

  setup: function() {
    fs.readFile(__dirname + '/../action_data/help.md', function(error, data) {
      if (error)
        throw error

      action.helpText = data.toString()
    })
  },

  execute: function(data) {
    return this.helpText
  }
}

bot.addAction(action)
