var bot = require(__dirname + '/../bot.js')

var slack = require(__dirname + '/../library/slack.js')

var action = {
  name: 'tell',

  trigger: /^tell [a-z_]* ".*"$/,

  description: 'Have Slacker message another user.',

  execute: function(data, callback) {
    var components = data.text.split(' ')
    var commandLength = components[1].length + 5
    var who = components[1].replace('<', '').replace('@', '').replace('>', '')
    var message = data.text.substring(commandLength + 2, data.text.length - 1)

    callback(slack.refer(who) + message)
  }
}

bot.addAction(action)
