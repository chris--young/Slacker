var bot = require(__dirname + '/../bot.js');

var id = require('../library/id.js');

var action = {
  name: 'talky',

  description: 'Create a talky room for video conferencing and video chatting.',

  helpText: '' +
  'Create a talky room for video conferencing and video chatting.\n\n' +

    '`/slacker talky [room_name]`\n\n' +

    'If the optional `room_name` is inlcuded, then it will be used in the form of `http://talky.io/room_name`. If not a random one will be chosen.'
  ,

  execute: function(data, callback) {
    var match = data.text.match(this.trigger);
    var room = (match && match[1]) ? encodeURI(data.text.replace(this.trigger, '$2')) : id();
    var payload = {
      username: 'Talky',
      icon_emoji: ':app-talky:',
      text: 'Join the conference: <http://talky.io/' + room + '>.'
    };

    // TODO: Once bot supports formatted responses, replace the following with `callback(payload);`
    callback(payload.text);
  }
};

bot.addAction(action);
