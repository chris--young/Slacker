var bot = require(__dirname + '/../bot.js')

var action = {
  trigger: 'tell',

  description: 'Have Slacker message another user.',

  error: function() {
    return '*Invalid Usage of* `tell`\n*Usage*: tell user message'
  },

  execute: function(data) {
    var components = data.text.split(' ')
    if (data.text.substring(0, 4) !== 'tell' || components.length < 3)
      return this.error()

    var commandLength = components[1].length + 5
    return '<@' + components[1] + '> ' + data.text.substring(commandLength, data.text.length)
  }
}

bot.addAction(action)
