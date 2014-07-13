var bot = require(__dirname + '/../bot.js')

var action = {
  trigger: 'list',

  description: 'List all availble Slacker actions.',

  execute: function(data) {
    var output = '*Available Actions*\n'
    for (var x = 0; x < bot.actions.length; x++)
      output += '`' + bot.actions[x].trigger + '` ' + bot.actions[x].description + '\n'
    return output
  }
}

bot.addAction(action)
