const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();

const Hemera = require('nats-hemera')

const nats = require('nats').connect({
  'url': process.env.NATS_URL,
  'user': process.env.NATS_USER,
  'pass': process.env.NATS_PW
})

const hemera = new Hemera(nats, {
  logLevel: process.env.HEMERA_LOG_LEVEL,
  childLogger: true
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/api/add', (req, res) => {
  hemera.act({
    topic: 'math',
    cmd: 'add',
    a: req.query.a,
    b: req.query.b,
    refresh: !!req.query.refresh
  }, (err, result) => {
    if (err) {
      console.error(err)
      return reply(Boom.badRequest(err.message))
    }

    res.send('result: ' + result)
  })
})

app.listen(process.env.API_SERVICE_PORT, () => {
  console.log(`Example app listening on port ${process.env.API_SERVICE_PORT}!`);
});
