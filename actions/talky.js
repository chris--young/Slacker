var bot = require(__dirname + '/../bot.js');

var id = require('../library/id.js');

var action = {
  name: 'talky',

  trigger: /^talky\s*(['"]?)(.*?)(\1)$/,

  description: 'Create a talky room for video conferencing and video chatting.',

  execute: function(data, callback) {
    var match = data.text.match(this.trigger);
    var room = (match && match[1]) ? encodeURI(data.text.replace(this.trigger, '$2')) : id();
    var payload = {
      username: 'Talky',
      icon_emoji: ':app-talky:',
      text: 'Join the conference: <http://talky.io/' + room + '>.'
    };

    callback(payload.text);
  }
};

bot.addAction(action);
