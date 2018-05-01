/**
 * Constructor.
 */

function InMemoryCache() {
  this.clients = [{
    clientId: 'thom',
    clientSecret: 'nightworld',
    redirectUris: [''],
    grants: [
      "password",
      "authorization_code",
      "refresh_token"
    ]
  }];
  this.tokens = [];
  this.users = [{
    id: '123',
    username: 'thomseddon',
    password: 'nightworld'
  }];
}

InMemoryCache.prototype.saveAuthorizationCode = function saveAuthorizationCode(code, client, user) {
  return OAuthAuthorizationCode
    .create({
      expires: code.expiresAt,
      client_id: client.id,
      authorization_code: code.authorizationCode,
      user_id: user.id,
      scope: code.scope
    })
    .then(function () {
      code.code = code.authorizationCode
      return code
    }).catch(function (err) {
      console.log("saveAuthorizationCode - Err: ", err)
    });
}

/**
 * Dump the cache.
 */

InMemoryCache.prototype.dump = function () {
  console.log('clients', this.clients);
  console.log('tokens', this.tokens);
  console.log('users', this.users);
};

/*
 * Get access token.
 */

InMemoryCache.prototype.getAccessToken = function (bearerToken) {
  var tokens = this.tokens.filter(function (token) {
    return token.accessToken === bearerToken;
  });

  return tokens.length ? tokens[0] : false;
};

/**
 * Get refresh token.
 */

InMemoryCache.prototype.getRefreshToken = function (bearerToken) {
  var tokens = this.tokens.filter(function (token) {
    return token.refreshToken === bearerToken;
  });

  return tokens.length ? tokens[0] : false;
};

/**
 * Get client.
 */

InMemoryCache.prototype.getClient = function (clientId, clientSecret) {
  var clients = this.clients.filter(function (client) {
    return client.clientId === clientId && client.clientSecret === clientSecret;
  });

  return clients.length ? clients[0] : false;
};

/**
 * Save token.
 */

InMemoryCache.prototype.saveToken = function (token, client, user) {
  var accessToken = {
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    clientId: client.clientId,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    userId: user.id
  }
  this.tokens.push(accessToken);
  return {
    accessToken: accessToken,
    client,
    user
  }
};

/*
 * Get user.
 */

InMemoryCache.prototype.getUser = function (username, password) {
  var users = this.users.filter(function (user) {
    return user.username === username && user.password === password;
  });

  return users.length ? users[0] : false;
};


InMemoryCache.prototype.verifyScope = function (token, scope) {
  return token.scope === scope
}

/**
 * Export constructor.
 */

module.exports = InMemoryCache;