var bot   = require(__dirname + '/../bot.js');
var slack = require(__dirname + '/../library/slack.js');

var action = {
  name: 'tell',

  description: 'Have Slacker message another user.',

  execute: function(data, callback) {
    var recipient = data.command.arguments[0];
    var message   = data.command.arguments[1];

    bot.sendMessage(message, recipient, function (error, response){
        callback(error, (error) ? 'Error sending "' + meessage +'" to ' + recipient + '.' : 'Message sent to ' + recipient);
    });
  }
};

bot.addAction(action);
