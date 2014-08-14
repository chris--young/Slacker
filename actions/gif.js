var bot = require(__dirname + '/../bot.js')
var _ = require("lodash")

var https = require('https')

var action = {
  name: 'gif',

  trigger: /^gif ".*"$/,

  description: 'Display a random GIF from Giphy.',

  apiKey: 'dc6zaTOxFJmzC',

  execute: function(data, callback) {
    tag = data.command.arguments.join(' ').trim()
    tag = tag === 'random' ? '' : tag
    this.requestTag(tag, callback)
  },

  requestTag: function (tag, callback) {
    var self = this
    var options = {
      hostname: 'api.giphy.com',
      port: 443,
      path: '/v1/gifs/random?api_key=' + self.apiKey + (tag ? '&tag=' + encodeURIComponent(tag) : ''),
      method: 'GET'
    }

    var request = https.request(options, function(response) {
      var responseText = ''
      response.on('data', function(data) {
        responseText += data.toString()
      })
      response.on('end', function() {
        var output = JSON.parse(responseText).data;

        if (_.isArray(output)) {
          self.requestTag("sad", function (url) {
            callback("No image found for that search :(\n" + url)
          })
        }
        else {
          try {
            callback(output.image_url)
          } catch (exception) {
            throw exception
          }
        }
      })
    })
    request.end()

    request.on('error', function(error) {
      throw error
    })
  }
}

bot.addAction(action)
