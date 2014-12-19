var cluster = require('cluster')
var http = require('http')
var domain = require('domain')
var url = require('url')

var config = require(__dirname + '/library/config')
var router = require(__dirname + '/router.js')
var bot = require(__dirname + '/bot.js')

var id = require(__dirname + '/library/id.js')
var log = require(__dirname + '/library/log.js')
var parse = require(__dirname + '/library/parse.js')

module.exports = function() {
  bot.setup(function(error) {
    if (error) {
      log.error('bot setup failed', error)
      process.exit(-1)
    }

    var server = http.createServer(function(request, response) {
      var serverDomain = domain.create()

      serverDomain.add(request)
      serverDomain.add(response)

      serverDomain.on('error', function(error) {
        log.error('uncaught exception', error, response.id)

        try {
          var kill = setTimeout(function() {
            process.exit(1)
          }, 30000)
          kill.unref()
          server.close()
          cluster.worker.disconnect()

          response.statusCode = 500
          response.end()
        } catch (exception) {
          log.error('failed to respond after uncaught exception', exception, response.id)
        }
      })

      serverDomain.run(function() {
        request.id = id()
        request.body = ''

        request.on('error', function(error) {
          log.error('request error', error, request.id)

          response.statusCode = 500
          response.end()
        });

        request.on('data', function(data) {
          request.body += data
        });

        request.on('end', function() {
          request.url = url.parse(request.url)
          request.url.parameters = request.url.query ? parse.httpParameters(request.url.query) : []
          log.info('request', {
            method: request.method,
            pathname: request.url.pathname,
            parameters: request.url.parameters,
            ip: request.connection.remoteAddress
          }, request.id)

          log.info('headers', request.headers, request.id)

          if (request.body) {
            try {
              request.body = parse.httpParameters(request.body)
              log.info('body', request.body, request.id)
            } catch (exception) {
              log.error('failed to parse request body', exception, request.id)
              response.statusCode = 415
              response.end()
              return
            }
          } else if(request.method.toLowerCase() === 'get') {
            response.end('Slacker is running.');
          }
          request.data = {}

          if (request.body.token) {
            if (request.body.command      && request.body.token === config.token.slashCommand) {
              router(request, response);
            } else {
              log.error('invalid token', request.body.token, request.id)
              response.statusCode = 403
              response.end()
            }
          } else {
            log.error('missing token', {}, request.id)
            response.statusCode = 403
            response.end()
          }
        })
      })
    })

    server.listen(process.env.PORT || config.port, function() {
      log.info('listening on port ' + process.env.PORT || config.port)
    })
  })
}
