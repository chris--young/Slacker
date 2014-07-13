var bot = require(__dirname + '/../bot.js')

var action = {
  trigger: 'echo',

  description: 'Echo a string to Slack.',

  setup: function() {
    // This method will be run at server start up.
  },

  execute: function(data) {
    return data.text.replace(this.trigger, '')  
  }
}

bot.addAction(action)
