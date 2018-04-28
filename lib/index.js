'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenApiService = exports.TOKEN_STORAGE_KEY = exports.CALL_TOKEN_API = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createAsyncAction = createAsyncAction;
exports.storeToken = storeToken;
exports.retrieveToken = retrieveToken;
exports.removeToken = removeToken;
exports.checkTokenFreshness = checkTokenFreshness;
exports.shouldRequestNewToken = shouldRequestNewToken;
exports.createApiAction = createApiAction;
exports.actionAsPromise = actionAsPromise;
exports.createTokenApiMiddleware = createTokenApiMiddleware;

var _lodash = require('lodash.startswith');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.map');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.isundefined');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.isfunction');

var _lodash8 = _interopRequireDefault(_lodash7);

var _lodash9 = require('lodash.isarraylikeobject');

var _lodash10 = _interopRequireDefault(_lodash9);

var _lodash11 = require('lodash.omitby');

var _lodash12 = _interopRequireDefault(_lodash11);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CALL_TOKEN_API = exports.CALL_TOKEN_API = Symbol('Call API');
var TOKEN_STORAGE_KEY = exports.TOKEN_STORAGE_KEY = 'reduxMiddlewareAuthToken';

var MIN_TOKEN_LIFESPAN = 300;

var NotImplemented = function NotImplemented(message) {
  this.name = 'NotImplemented';
  this.message = message || 'Method not implemented';
  this.stack = new Error().stack;
};
NotImplemented.prototype = Object.create(Error.prototype);
NotImplemented.prototype.constructor = NotImplemented;

function checkResponseIsOk(response) {
  return response.ok ? response : response.text().then(function (text) {
    return Promise.reject(text);
  });
}

function responseToCompletion(response) {
  var contentType = response.headers.get('Content-Type');
  if (contentType && (0, _lodash2.default)(contentType, 'application/json')) {
    return response.json();
  } else if (response.redirected) {
    return { redirected: true, url: response.url };
  } else return response.text();
}

function createAsyncAction(type, step, payload) {
  var action = {
    type: type + '_' + step,
    payload: payload,
    meta: {
      asyncStep: step
    }
  };
  if (payload && payload instanceof Error) {
    Object.assign(action.meta, {
      error: true
    });
  }
  return action;
}

function createStartAction(type, payload) {
  return createAsyncAction(type, 'START', payload);
}

function createCompletionAction(type, payload) {
  return createAsyncAction(type, 'COMPLETED', payload);
}

function createFailureAction(type, error) {
  return createAsyncAction(type, 'UNCOMPLETED', new TypeError(error));
}

function storeToken(key, response) {
  var token = response.token;
  localStorage.setItem(key, JSON.stringify(token));
  return token;
}

function retrieveToken(key) {
  var storedValue = localStorage.getItem(key);
  if (!storedValue) {
    return null;
  }
  try {
    return JSON.parse(storedValue);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return null;
    }
    throw e;
  }
}

function removeToken(key) {
  localStorage.removeItem(key);
}

function checkTokenFreshness(token, minTokenLifespan) {
  var tokenPayload = _jsonwebtoken2.default.decode(token);
  var expiry = _moment2.default.unix(tokenPayload.exp);
  return expiry.diff((0, _moment2.default)(), 'seconds') < minTokenLifespan;
}

function shouldRequestNewToken() {
  if (!this.refreshToken) {
    return false;
  }
  var token = this.retrieveToken();
  return token ? checkTokenFreshness(token, this.minTokenLifespan) : false;
}

var TokenApiService = exports.TokenApiService = function () {
  function TokenApiService(apiAction, dispatch) {
    var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, TokenApiService);

    this.apiAction = apiAction;
    this.meta = this.apiAction.meta || {};
    this.dispatch = dispatch;
    this.config = config;
    // config or default values
    this.checkTokenFreshness = this.configOrDefault('checkTokenFreshness');
    this.retrieveToken = this.configOrDefault('retrieveToken');
    this.shouldRequestNewToken = this.configOrDefault('shouldRequestNewToken');
    this.storeToken = this.configOrDefault('storeToken');
    this.addTokenToRequest = this.configOrDefault('addTokenToRequest');
    this.refreshAction = this.configOrDefault('refreshAction');
    this.checkResponseIsOk = this.configOrDefault('checkResponseIsOk');
    this.tokenStorageKey = this.config.tokenStorageKey || TOKEN_STORAGE_KEY;
    this.minTokenLifespan = this.config.minTokenLifespan || MIN_TOKEN_LIFESPAN;
    this.actionKey = this.config.actionKey || CALL_TOKEN_API;
    this.preProcessRequest = this.config.preProcessRequest;
    this.refreshToken = this.config.refreshToken || false;
    this.shouldRequestNewToken = this.configOrDefault('shouldRequestNewToken');
    // bind where needed
    this.storeToken = this.storeToken.bind(this, this.tokenStorageKey);
    this.retrieveToken = this.retrieveToken.bind(this, this.tokenStorageKey);
    // this.failureAction = this.configOrNotImplemented('failureAction');
  }

  _createClass(TokenApiService, [{
    key: 'configOrDefault',
    value: function configOrDefault(key) {
      return this.config[key] || this.defaultMethods[key];
    }
  }, {
    key: 'configOrNotImplemented',
    value: function configOrNotImplemented(key) {
      var method = this.config[key];
      if (!method) {
        throw new NotImplemented('Please provide ' + key + ' in config');
      }
      return method;
    }
  }, {
    key: 'completeApiRequest',
    value: function completeApiRequest(type, finalResponse) {
      this.dispatch(createCompletionAction(type, finalResponse));
      return finalResponse;
    }
  }, {
    key: 'defaultCatchApiRequestError',
    value: function defaultCatchApiRequestError(type, error) {
      return error;
    }
  }, {
    key: 'catchApiRequestError',
    value: function catchApiRequestError(type, error) {
      var fn = this.configOrDefault('catchApiRequestError');
      this.dispatch(createFailureAction(type, error));
      return fn(type, error);
    }
  }, {
    key: 'apiRequest',
    value: function apiRequest(fetchArgs, action) {
      var meta = action.meta || {};
      var completeApiRequest = this.completeApiRequest.bind(this, action.type);
      var catchApiRequestError = this.catchApiRequestError.bind(this, action.type);
      return _isomorphicFetch2.default.apply(this, fetchArgs).then(this.checkResponseIsOk).then(responseToCompletion).then(meta.responseHandler).then(completeApiRequest).catch(catchApiRequestError);
    }
  }, {
    key: 'apiRequestPromise',
    value: function apiRequestPromise(fetchArgs) {
      return function () {
        return _isomorphicFetch2.default.apply(null, fetchArgs).then(checkResponseIsOk).then(responseToCompletion);
      };
    }
  }, {
    key: 'apiCallFromAction',
    value: function apiCallFromAction(action) {
      var token = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var apiFetchArgs = this.getApiFetchArgsFromActionPayload(action.payload, token);
      this.dispatch(createStartAction(action.type, action.payload));
      return this.apiRequest(apiFetchArgs, action, this.store);
    }
  }, {
    key: 'multipleApiCallsFromAction',
    value: function multipleApiCallsFromAction(action) {
      var _this = this;

      var token = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var meta = action.meta || {};
      var promises = (0, _lodash4.default)(action.payload, function (apiAction) {
        var apiFetchArgs = _this.getApiFetchArgsFromActionPayload(apiAction, token);
        return _this.apiRequestPromise(apiFetchArgs)();
      });
      var completeApiRequest = this.completeApiRequest.bind(this, action.type);
      var catchApiRequestError = this.catchApiRequestError.bind(this, action.type);
      this.dispatch(createStartAction(action.type, action.payload));
      return Promise.all(promises).then(meta.responseHandler).then(completeApiRequest).catch(catchApiRequestError);
    }
  }, {
    key: 'defaultAddTokenToRequest',
    value: function defaultAddTokenToRequest(headers, endpoint, body, token) {
      return {
        headers: Object.assign({
          Authorization: 'JWT ' + token
        }, headers),
        endpoint: endpoint,
        body: body
      };
    }
  }, {
    key: 'getApiFetchArgsFromActionPayload',
    value: function getApiFetchArgsFromActionPayload(payload) {
      var token = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var authenticate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var headers = payload.headers,
          endpoint = payload.endpoint,
          method = payload.method,
          body = payload.body,
          credentials = payload.credentials;

      if ((0, _lodash6.default)(method)) {
        method = 'GET';
      }
      headers = Object.assign({
        'Content-Type': 'application/json'
      }, headers);
      if (token && authenticate) {
        var _addTokenToRequest = this.addTokenToRequest(headers, endpoint, body, token);

        headers = _addTokenToRequest.headers;
        endpoint = _addTokenToRequest.endpoint;
        body = _addTokenToRequest.body;
      }
      if ((0, _lodash8.default)(this.preProcessRequest)) {
        var _preProcessRequest = this.preProcessRequest(headers, endpoint, body);

        headers = _preProcessRequest.headers;
        endpoint = _preProcessRequest.endpoint;
        body = _preProcessRequest.body;
      }
      return [endpoint, (0, _lodash12.default)({ method: method, body: body, credentials: credentials, headers: headers }, _lodash6.default)];
    }
  }, {
    key: 'call',
    value: function call() {
      var _this2 = this;

      if (this.shouldRequestNewToken() && !this.apiAction.noRefresh) {
        var refreshAction = this.refreshAction(this.token);
        var refreshApiAction = refreshAction[CALL_TOKEN_API];
        var refreshApiActionMeta = refreshApiAction.meta || {};
        var refreshArgs = this.getApiFetchArgsFromActionPayload(refreshApiAction.payload, this.token, refreshApiActionMeta.authenticate);
        return _isomorphicFetch2.default.apply(null, refreshArgs).then(this.checkResponseIsOk).then(responseToCompletion).then(this.storeToken).then(function (token) {
          _this2.curriedApiCallMethod(token);
        }).catch(function (error) {
          _this2.dispatch(createFailureAction(_this2.apiAction.type, error));
        });
      } else {
        return this.curriedApiCallMethod(this.token);
      }
    }
  }, {
    key: 'defaultMethods',
    get: function get() {
      return {
        checkTokenFreshness: checkTokenFreshness,
        retrieveToken: retrieveToken,
        storeToken: storeToken,
        refreshAction: function refreshAction() {},
        shouldRequestNewToken: shouldRequestNewToken,
        addTokenToRequest: this.defaultAddTokenToRequest,
        catchApiRequestError: this.defaultCatchApiRequestError,
        checkResponseIsOk: checkResponseIsOk
      };
    }
  }, {
    key: 'apiCallMethod',
    get: function get() {
      return (0, _lodash10.default)(this.apiAction.payload) ? this.multipleApiCallsFromAction : this.apiCallFromAction;
    }
  }, {
    key: 'curriedApiCallMethod',
    get: function get() {
      return this.apiCallMethod.bind(this, this.apiAction);
    }
  }, {
    key: 'token',
    get: function get() {
      return this.retrieveToken();
    }
  }]);

  return TokenApiService;
}();

function createApiAction(action) {
  return _defineProperty({}, CALL_TOKEN_API, action);
}

function actionAsPromise(action, dispatch, config) {
  var actionKey = config.actionKey || CALL_TOKEN_API;
  var apiAction = action()[actionKey];
  if (apiAction) {
    var tokenApiService = new TokenApiService(apiAction, dispatch, config);
    return tokenApiService.call();
  } else {
    return Promise.reject('not an API action!');
  }
}

function createTokenApiMiddleware(config) {
  if (!config) config = {};
  return function (store) {
    return function (next) {
      return function (action) {

        var apiAction = action[config.actionKey];

        if (apiAction === undefined) {
          if (action[CALL_TOKEN_API] === undefined) {
            return next(action);
          }
          apiAction = action[CALL_TOKEN_API];
        }

        var tokenApiService = new TokenApiService(apiAction, store.dispatch, config);

        return tokenApiService.call();
      };
    };
  };
}