"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var Utils = require('./Utils');
var JsSIP_C = require('./Constants');
var Grammar = require('./Grammar');
var URI = require('./URI');
var Socket = require('./Socket');
var Exceptions = require('./Exceptions');

// Default settings.
exports.settings = {
  // SIP authentication.
  authorization_user: null,
  password: null,
  realm: null,
  ha1: null,
  authorization_jwt: null,
  // SIP account.
  display_name: null,
  uri: null,
  contact_uri: null,
  // SIP instance id (GRUU).
  instance_id: null,
  // Preloaded SIP Route header field.
  use_preloaded_route: false,
  // Session parameters.
  session_timers: true,
  session_timers_refresh_method: JsSIP_C.UPDATE,
  session_timers_force_refresher: false,
  no_answer_timeout: 60,
  // Registration parameters.
  register: true,
  register_expires: 600,
  registrar_server: null,
  // Connection options.
  sockets: null,
  connection_recovery_max_interval: JsSIP_C.CONNECTION_RECOVERY_MAX_INTERVAL,
  connection_recovery_min_interval: JsSIP_C.CONNECTION_RECOVERY_MIN_INTERVAL,
  // Global extra headers, to be added to every request and response
  extra_headers: null,
  /*
   * Host address.
   * Value to be set in Via sent_by and host part of Contact FQDN.
  */
  via_host: "".concat(Utils.createRandomToken(12), ".invalid")
};

// Configuration checks.
var checks = {
  mandatory: {
    sockets: function sockets(_sockets2) {
      /* Allow defining sockets parameter as:
       *  Socket: socket
       *  Array of Socket: [socket1, socket2]
       *  Array of Objects: [{socket: socket1, weight:1}, {socket: Socket2, weight:0}]
       *  Array of Objects and Socket: [{socket: socket1}, socket2]
       */
      var _sockets = [];
      if (Socket.isSocket(_sockets2)) {
        _sockets.push({
          socket: _sockets2
        });
      } else if (Array.isArray(_sockets2) && _sockets2.length) {
        var _iterator = _createForOfIteratorHelper(_sockets2),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var socket = _step.value;
            if (Object.prototype.hasOwnProperty.call(socket, 'socket') && Socket.isSocket(socket.socket)) {
              _sockets.push(socket);
            } else if (Socket.isSocket(socket)) {
              _sockets.push({
                socket: socket
              });
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } else {
        return;
      }
      return _sockets;
    },
    uri: function uri(_uri) {
      if (!/^sip:/i.test(_uri)) {
        _uri = "".concat(JsSIP_C.SIP, ":").concat(_uri);
      }
      var parsed = URI.parse(_uri);
      if (!parsed) {
        return;
      } else if (!parsed.user) {
        return;
      } else {
        return parsed;
      }
    }
  },
  optional: {
    authorization_user: function authorization_user(_authorization_user) {
      if (Grammar.parse("\"".concat(_authorization_user, "\""), 'quoted_string') === -1) {
        return;
      } else {
        return _authorization_user;
      }
    },
    authorization_jwt: function authorization_jwt(_authorization_jwt) {
      if (typeof _authorization_jwt === 'string') {
        return _authorization_jwt;
      }
    },
    user_agent: function user_agent(_user_agent) {
      if (typeof _user_agent === 'string') {
        return _user_agent;
      }
    },
    connection_recovery_max_interval: function connection_recovery_max_interval(_connection_recovery_max_interval) {
      if (Utils.isDecimal(_connection_recovery_max_interval)) {
        var value = Number(_connection_recovery_max_interval);
        if (value > 0) {
          return value;
        }
      }
    },
    connection_recovery_min_interval: function connection_recovery_min_interval(_connection_recovery_min_interval) {
      if (Utils.isDecimal(_connection_recovery_min_interval)) {
        var value = Number(_connection_recovery_min_interval);
        if (value > 0) {
          return value;
        }
      }
    },
    contact_uri: function contact_uri(_contact_uri) {
      if (typeof _contact_uri === 'string') {
        var uri = Grammar.parse(_contact_uri, 'SIP_URI');
        if (uri !== -1) {
          return uri;
        }
      }
    },
    display_name: function display_name(_display_name) {
      return _display_name;
    },
    instance_id: function instance_id(_instance_id) {
      if (/^uuid:/i.test(_instance_id)) {
        _instance_id = _instance_id.substr(5);
      }
      if (Grammar.parse(_instance_id, 'uuid') === -1) {
        return;
      } else {
        return _instance_id;
      }
    },
    no_answer_timeout: function no_answer_timeout(_no_answer_timeout) {
      if (Utils.isDecimal(_no_answer_timeout)) {
        var value = Number(_no_answer_timeout);
        if (value > 0) {
          return value;
        }
      }
    },
    session_timers: function session_timers(_session_timers) {
      if (typeof _session_timers === 'boolean') {
        return _session_timers;
      }
    },
    session_timers_refresh_method: function session_timers_refresh_method(method) {
      if (typeof method === 'string') {
        method = method.toUpperCase();
        if (method === JsSIP_C.INVITE || method === JsSIP_C.UPDATE) {
          return method;
        }
      }
    },
    session_timers_force_refresher: function session_timers_force_refresher(_session_timers_force_refresher) {
      if (typeof _session_timers_force_refresher === 'boolean') {
        return _session_timers_force_refresher;
      }
    },
    password: function password(_password) {
      return String(_password);
    },
    realm: function realm(_realm) {
      return String(_realm);
    },
    ha1: function ha1(_ha) {
      return String(_ha);
    },
    register: function register(_register) {
      if (typeof _register === 'boolean') {
        return _register;
      }
    },
    register_expires: function register_expires(_register_expires) {
      if (Utils.isDecimal(_register_expires)) {
        var value = Number(_register_expires);
        if (value > 0) {
          return value;
        }
      }
    },
    registrar_server: function registrar_server(_registrar_server) {
      if (!/^sip:/i.test(_registrar_server)) {
        _registrar_server = "".concat(JsSIP_C.SIP, ":").concat(_registrar_server);
      }
      var parsed = URI.parse(_registrar_server);
      if (!parsed) {
        return;
      } else if (parsed.user) {
        return;
      } else {
        return parsed;
      }
    },
    use_preloaded_route: function use_preloaded_route(_use_preloaded_route) {
      if (typeof _use_preloaded_route === 'boolean') {
        return _use_preloaded_route;
      }
    },
    extra_headers: function extra_headers(_extra_headers) {
      var _extraHeaders = [];
      if (Array.isArray(_extra_headers) && _extra_headers.length) {
        var _iterator2 = _createForOfIteratorHelper(_extra_headers),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var header = _step2.value;
            if (typeof header === 'string') {
              _extraHeaders.push(header);
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      } else {
        return;
      }
      return _extraHeaders;
    }
  }
};
exports.load = function (dst, src) {
  // Check Mandatory parameters.
  for (var parameter in checks.mandatory) {
    if (!src.hasOwnProperty(parameter)) {
      throw new Exceptions.ConfigurationError(parameter);
    } else {
      var value = src[parameter];
      var checked_value = checks.mandatory[parameter](value);
      if (checked_value !== undefined) {
        dst[parameter] = checked_value;
      } else {
        throw new Exceptions.ConfigurationError(parameter, value);
      }
    }
  }

  // Check Optional parameters.
  for (var _parameter in checks.optional) {
    if (src.hasOwnProperty(_parameter)) {
      var _value = src[_parameter];

      /* If the parameter value is null, empty string, undefined, empty array
       * or it's a number with NaN value, then apply its default value.
       */
      if (Utils.isEmpty(_value)) {
        continue;
      }
      var _checked_value = checks.optional[_parameter](_value);
      if (_checked_value !== undefined) {
        dst[_parameter] = _checked_value;
      } else {
        throw new Exceptions.ConfigurationError(_parameter, _value);
      }
    }
  }
};