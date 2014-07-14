var bot = require(__dirname + '/../bot.js')

var action = {
  name: 'tell',

  trigger: /^tell [a-z_]* ".*"$/,

  description: 'Have Slacker message another user.',

  execute: function(data, callback) {
    var components = data.text.split(' ')
    var commandLength = components[1].length + 5
    components[1] = components[1].replace('<', '').replace('@', '').replace('>', '')
    callback('<@' + components[1] + '> ' + data.text.substring(commandLength, data.text.length))
  }
}

bot.addAction(action)
