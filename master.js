/**
 * master.js
 * @description: main server process
 * @author: Chris Young <young.c.5690@gmail.com>
 */

var cluster = require('cluster'),
    os = require('os');

var config = require(__dirname+'/config.json'),
    worker = require(__dirname+'/worker.js');

var log = require(__dirname+'/library/log.js');

if (!cluster.isMaster)
  return worker();

log.setup(function setup(exception) {
  if (exception) {
    console.log('failed to create logging directory');
    process.exit(1);
  }

  log.info('application started');
  console.log('application started on port:', config.port);

  var cores = os.cpus().length;
  for (var x = 0; x < cores; x++)
    cluster.fork();

  cluster.on('exit', function exit(worker, code, signal) {
    log.error('worker'+worker.process.pid+' exited', code || signal );
    if (code != -1)
      cluster.fork();
  });

  cluster.on('online', function online(worker) {
    log.info('worker'+worker.process.pid+' came online');
  });
});
