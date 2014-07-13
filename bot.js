var https = require('https')
var fs = require('fs')

var config = require(__dirname + '/config.json')

var log = require(__dirname + '/library/log.js')
var parse = require(__dirname + '/library/parse.js')

exports.actions = []

exports.setup = function(callback) {
  fs.readdir(__dirname + '/actions', function(error, files) {
    if (error)
      return callback(error)
  
    for (var x = 0; x < files.length; x++) {
      require(__dirname + '/actions/' + files[x])
      var setup = exports.actions[exports.actions.length - 1].setup
      if (setup)
        setup()
    }

    log.info('bot setup complete')
    callback()
  })
}

exports.processRequest = function(request, response) {
  var requestText = parse.slackText(request.body.text.substring(request.body.trigger_word.length + 1, request.body.text.length))
  log.info('bot processing request', request.body, request.id)

  var outgoingData = {
    team_id: request.body.team_id,
    team_domain: request.body.team_domain,
    channel_id: request.body.channel_id,
    channel_name: request.body.channel_name,
    timestamp: request.body.timestamp,
    user_id: request.body.user_id,
    user_name: request.body.user_name,
    text: requestText
  }

  var responseText
  for (var x = 0; x < exports.actions.length; x++)
    if (~requestText.indexOf(exports.actions[x].trigger)) {
      setTimeout(function() {
        if (!responseText) {
          log.error('bot action timed out', exports.actions[x].trigger, request.id)
          response.statusCode = 500
          response.end()
        }
      }, config.timeout)

      responseText = exports.actions[x].execute(outgoingData)

      switch (responseText) {
        case exports.actions[x].usage:
          responseText = '*Invalid usage of* `' + exports.actions[x].trigger + '`\n*Usage:* ' + responseText
          log.error('bot responding with invalid usage', exports.actions[x].trigger, request.id)
          break;

        default:
          responseText.replace('&', '&amp;')
          responseText.replace('<', '&lt;')
          responseText.replace('>', '&gt;')
          log.info('bot responding with action', exports.actions[x].trigger, request.id)
      }
    }
  if (!responseText) {
    log.error('no bot action found', requestText, request.id)
    responseText = 'No action found, try `help`.'
  }

  response.statusCode = 200
  response.end(JSON.stringify({text: responseText}))
  log.info('bot successfully responded', {}, request.id)
}

exports.addAction = function(action) {
  if (!action.trigger || !action.description || !action.execute) {
    log.error('invalid bot action', action)
    return
  }

  var collision
  for (var x = 0; x < exports.actions.length; x++)
    if (exports.actions[x].trigger === action.trigger)
      collision = true
  if (collision) {
    log.error('bot action trigger collision', action.trigger)
    return
  }

  exports.actions.push(action)
}
