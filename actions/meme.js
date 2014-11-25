var bot = require(__dirname + '/../bot.js');

var fs = require('fs');

var action = {
  name: 'meme',

  trigger: /^meme [a-zA-Z+]* ".*" ".*"$/,

  description: 'Display a generated meme.',

  memes: [],

  setup: function() {
    fs.readFile(__dirname + '/../action_data/memes.csv', function(error, data) {
      if (error)
        throw error;

      action.memes = data.toString().replace(/ /g, '+').split(',');
    });
  },

  execute: function(data, callback) {
    var memeQuery = data.text.split(' ')[1];
    var caption = data.text.substring(data.text.indexOf('\"') + 1, data.text.length - 1).replace(/\"/g, '').split(' ');

    if (!this.memes.length)
      return callback('memes.csv has not loaded yet, try again.');

    var meme,
        x = -1;
    while (!meme && ++x < this.memes.length - 1)
      if (~this.memes[x].toLowerCase().indexOf(memeQuery.toLowerCase()))
        meme = this.memes[x];

    if (!meme)
      return callback('Meme \"' + memeQuery + '\" not found.');

    callback('http://apimeme.com/meme?meme=' + meme + '&top=' + caption[0] + '&bottom=' + caption[1]);
  }
};

bot.addAction(action);
