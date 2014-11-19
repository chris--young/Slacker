/**
 * worker.js
 *
 * @description: worker process
 * @author: Chris Young <cyoung@mobiquityinc.com>
 */

var cluster = require('cluster'),
    http = require('http'),
    domain = require('domain'),
    url = require('url');

var config = require(__dirname + '/config.json'),
    router = require(__dirname + '/router.js'),
    bot = require(__dirname + '/bot.js');

var id = require(__dirname + '/library/id.js'),
    log = require(__dirname + '/library/log.js'),
    parse = require(__dirname + '/library/parse.js');

module.exports = function worker() {
  bot.setup(function setup(error) {
    if (error) {
      log.error('bot setup failed', error);
      process.exit(-1);
    }

    var server = http.createServer(function server(request, response) {
      var serverDomain = domain.create();

      serverDomain.add(request);
      serverDomain.add(response);

      serverDomain.on('error', function domainError(error) {
        log.error('uncaught exception', error, response.id);

        try {
          var kill = setTimeout(function timeout() {
            process.exit(1);
          }, 30000);
          kill.unref();
          server.close();
          cluster.worker.disconnect();

          response.statusCode = 500;
          response.end();
        } catch (exception) {
          log.error('failed to respond after uncaught exception', exception, response.id);
        }
      });

      serverDomain.run(function run() {
        request.id = id();
        request.body = '';

        request.on('error', function runError(error) {
          log.error('request error', error, request.id);

          response.statusCode = 500;
          response.end();
        });

        request.on('data', function runData(data) {
          request.body += data;
        });

        request.on('end', function runEnd() {
          request.url = url.parse(request.url);
          request.url.parameters = request.url.query ? parse.httpParameters(request.url.query) : [];
          log.info('request', {
            method: request.method,
            pathname: request.url.pathname,
            parameters: request.url.parameters,
            ip: request.connection.remoteAddress
          }, request.id);

          log.info('headers', request.headers, request.id);

          var key = request.url.parameters.key;
          if (key) {
            if (~config.keys.indexOf(key)) {
              if (request.body) {
                try {
                  request.body = parse.httpParameters(request.body);
                  log.info('body', request.body, request.id);
                } catch (exception) {
                  log.error('failed to parse request body', exception, request.id);
                  response.statusCode = 415;
                  response.end();
                  return;
                }
              }
              request.data = {};

              if (request.body.token) {
                if ((request.body.trigger_word && request.body.token === config.token.webhook ) ||
                    (request.body.command && request.body.token === config.token.api))
                  router(request, response);
                else {
                  log.error('invalid token', request.body.token, request.id);
                  response.statusCode = 403;
                  response.end();
                }
              } else {
                log.error('missing token', {}, request.id);
                response.statusCode = 403;
                response.end();
              }
            } else {
              log.error('invalid key', key, request.id);
              response.statusCode = 401;
              response.end();
            }
          } else {
            log.error('missing key', {}, request.id);
            response.statusCode = 401;
            response.end();
          }
        });
      });
    });
    
    server.listen(config.port, function listen() {
      log.info('listening on port ' + config.port);
    });
  });
};
