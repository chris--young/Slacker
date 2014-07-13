var bot = require(__dirname + '/../bot.js')

var action = {
  trigger: 'tell',

  description: 'Have Slacker message another user.',

  usage: 'tell user message',

  execute: function(data, callback) {
    var components = data.text.split(' ')
    if (data.text.substring(0, 4) !== 'tell' || components.length < 3)
      callback(this.usage)

    var commandLength = components[1].length + 5
    callback('<@' + components[1] + '> ' + data.text.substring(commandLength, data.text.length))
  }
}

bot.addAction(action)
