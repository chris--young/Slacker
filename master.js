var cluster = require('cluster')
var os = require('os')

var config = require(__dirname + '/config.json')
var worker = require(__dirname + '/worker.js')

var log = require(__dirname + '/library/log.js')

if (cluster.isMaster) {
  log.info('application started')
  console.log('application started on port:', config.port)

  var cores = os.cpus().length
  for (var x = 0; x < cores; x++)
    cluster.fork()

  cluster.on('exit', function(worker, code, signal) {
    log.error('worker' + worker.process.pid + ' exited', code || signal )
    if (code !== -1)
      cluster.fork()
  });

  cluster.on('online', function(worker) {
    log.info('worker' + worker.process.pid + ' came online')
  })
}
else {
  worker()
}