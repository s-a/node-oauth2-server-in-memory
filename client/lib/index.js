'use strict';

const express = require('express');
const simpleOauthModule = require('simple-oauth2');

const app = express();
const oauth2 = simpleOauthModule.create({
  client: {
    id: 'thom',
    secret: 'nightworld',
  },
  auth: {
    tokenHost: 'http://localhost:3000',
    tokenPath: '/oauth/access_token',
    authorizePath: '/oauth/authorize',
  },
});

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:3001/callback',
  scope: 'notifications',
  state: '3(#0/!~',
});

// Initial page redirecting to Github
app.get('/auth', (req, res) => {
  console.log(authorizationUri);
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const options = {
    code,
  };

  try {
    const result = await oauth2.authorizationCode.getToken(options);

    console.log('The resulting token: ', result);

    const token = oauth2.accessToken.create(result);

    return res.status(200).json(token)
  } catch (error) {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed');
  }
});

app.get('/success', (req, res) => {
  res.send('');
});

app.get('/', (req, res) => {
  res.send('Hello<br><a href="/auth">Log in with Github</a>');
});

app.listen(3001, () => {
  console.log('Express server started on port 3001');
});


// Credits to [@lazybean](https://github.com/lazybean)