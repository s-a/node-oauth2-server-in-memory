var express = require('express');
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;
var bodyParser = require('body-parser')
var app = express();

// curl -X POST -d "client_id=thom&client_secret=nightworld&grant_type=password&username=thomseddon&password=nightworld" http://localhost:3000/oauth/token

var authenticate = function (options) {
  var options = options || {};
  return function (req, res, next) {
    var request = new Request({
      headers: {
        authorization: req.headers.authorization
      },
      method: req.method,
      query: req.query,
      body: req.body
    });
    var response = new Response(res);

    oauth.authenticate(request, response, options)
      .then(function (token) {
        // Request is authorized.
        req.user = token
        next()
      })
      .catch(function (err) {
        // Request is not authorized.
        res.status(err.code || 500).json(err)
      });
  }
}
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
var Model = require('./model.js')
var model = new Model()
var oauth = new oauthServer({
  model: model
});

app.all('/oauth/token', function (req, res, next) {
  var request = new Request(req);
  var response = new Response(res);

  oauth
    .token(request, response)
    .then(function (token) {
      // Todo: remove unnecessary values in response
      return res.json(token)
    }).catch(function (err) {
      return res.status(500).json(err)
    })
});


// restrict this to POST in production
app.all('/oauth/authorize', function (req, res) {
  var request = new Request(req);
  var response = new Response(res);
  req.body = req.query // restrict this to POST in production

  return oauth.authorize(request, response).then(function (success) {
    res.json(success)
  }).catch(function (err) {
    res.status(err.code || 500).json(err)
  })
});

app.get('/secure', authenticate(), function (req, res) {
  res.json({
    message: 'Secure data'
  })
});

app.get('/me', authenticate(), function (req, res) {
  res.json({
    me: req.user,
    messsage: 'Authorization success, Without Scopes, Try accessing /profile with `profile` scope',
    description: 'Try postman https://www.getpostman.com/collections/37afd82600127fbeef28',
    more: 'pass `profile` scope while Authorize'
  })
});

app.get('/profile', authenticate({
  scope: 'profile'
}), function (req, res) {
  res.json({
    profile: req.user
  })
});

app.listen(3000);