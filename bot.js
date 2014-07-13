var https = require('https')
var fs = require('fs')

var config = require(__dirname + '/config.json')

var log = require(__dirname + '/library/log.js')
var parse = require(__dirname + '/library/parse.js')

var actions = []

exports.setup = function(callback) {
  fs.readdir(__dirname + '/bot_actions', function(error, files) {
    if (error)
      return callback(error)
  
    for (var x = 0; x < files.length; x++) {
      require(__dirname + '/bot_actions/' + files[x])
      actions[actions.length - 1].setup()
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
  for (var x = 0; x < actions.length; x++)
    if (~requestText.indexOf(actions[x].trigger)) {
      setTimeout(function() {
        if (!responseText) {
          log.error('bot action timed out', actions[x].trigger, request.id)
          response.statusCode = 500
          response.end()
        }
      }, config.timeout)

      responseText = actions[x].execute(outgoingData)
      log.info('bot responding with action', actions[x].trigger, request.id)
    }
  if (!responseText) {
    log.error('no bot action found', requestText, request.id)
    responseText = 'no action found "' + requestText + '"'
  }

  response.statusCode = 200
  response.end(JSON.stringify({text: responseText}))
  log.info('bot successfully responded', {}, request.id)
}

exports.addAction = function(action) {
  if (!action.trigger || !action.execute) {
    log.error('invalid bot action', action)
    return
  }

  var collision
  for (var x = 0; x < actions.length; x++)
    if (actions[x].trigger === action.trigger)
      collision = true
  if (collision) {
    log.error('bot action trigger collision', action.trigger)
    return
  }

  actions.push(action)
}
