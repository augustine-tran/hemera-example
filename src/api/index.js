const Hapi = require('hapi')
const HemeraZipkin = require('hemera-zipkin')
const Hemera = require('nats-hemera')
const Boom = require('boom')
const zipkinMiddleware = require('zipkin-instrumentation-hapi').hapiMiddleware
const { Tracer, ExplicitContext, BatchRecorder } = require('zipkin')
const { HttpLogger } = require('zipkin-transport-http')

const recorder = new BatchRecorder({
  logger: new HttpLogger({
    endpoint: 'http://' + process.env.ZIPKIN_URL + ':' + process.env.ZIPKIN_PORT + '/api/v1/spans'
  })
})

const ctxImpl = new ExplicitContext()
const tracer = new Tracer({ ctxImpl, recorder})

const nats = require('nats').connect({
  'url': process.env.NATS_URL,
  'user': process.env.NATS_USER,
  'pass': process.env.NATS_PW
})

var restify = require('restify')

var server = restify.createServer()
server.use(restify.queryParser());

server.listen(8789, function () {
  console.log('%s listening at %s', server.name, server.url)
})

const hemera = new Hemera(nats, {
  logLevel: process.env.HEMERA_LOG_LEVEL,
  childLogger: true,
  tag: 'gateway-instance'
})

hemera.use(HemeraZipkin, {
  host: process.env.ZIPKIN_URL,
  port: process.env.ZIPKIN_PORT,
  sampling: 1
})

function respond (req, res, next) {
  console.log('req.params', req.params)
  
  hemera.act({
    topic: 'math',
    cmd: 'add',
    a: req.params.a,
    b: req.params.b,
    refresh: !!req.query.refresh
  },
    (err, result) => {
      if (err) {
        console.error(err)
        return reply(Boom.badRequest(err.message))
      }

      res.send('result: ' + result)
    })
}

hemera.ready(() => {
  server.get('/api/add', respond)
})
