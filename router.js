var log = require(__dirname + '/library/log.js')

var bot = require(__dirname + '/bot.js')

function route(request, response) {
  console.log(request.method + ' ' + JSON.stringify(request.body, null, '  '));
  if (request.method === 'POST')
    bot.processRequest(request, response)
  else {
    response.statusCode = 405
    response.end();

    log.error('invalid method', {
      method: request.method,
      pathname: request.url.pathname
    }, request.id)
  }
}

module.exports = function(request, response) {
  switch (request.url.pathname) {
    case '/':
      route(request, response)
      break

    default:
      response.statusCode = 404
      response.end()

      log.error('resource not found', request.url.pathname, request.id)
  }
}
