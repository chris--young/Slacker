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
  var actionFound
  var x = -1
  while (!actionFound && x++ < exports.actions.length - 1)
    if (exports.actions[x].trigger.test(requestText)) {
      actionFound = true
      setTimeout(function() {
        if (!responseText) {
          log.error('bot action timed out', exports.actions[x].trigger, request.id)
          response.statusCode = 500
          response.end()
        }
      }, config.timeout)

      exports.actions[x].execute(outgoingData, function(responseText) {
        if (!responseText) {
          response.statusCode = 500
          response.end()
          log.error('action did not return a response', exports.actions[x].trigger, request.id)
          return
        }

        log.info('bot responding with action', exports.actions[x].trigger, request.id)
        if (typeof responseText === 'string') {
          responseText.replace('&', '&amp;')
          responseText.replace('<', '&lt;')
          responseText.replace('>', '&gt;')
        } else
          responseText = responseText.toString()

        response.statusCode = 200
        response.end(JSON.stringify({text: responseText}))
        log.info('bot successfully responded', {}, request.id)
      })
    }

  if (!actionFound) {
    log.error('no bot action found', requestText, request.id)
    responseText = 'Invalid action, try `help`.'
    response.statusCode = 200
    response.end(JSON.stringify({text: responseText}))
  }
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
