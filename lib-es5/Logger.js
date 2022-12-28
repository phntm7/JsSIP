"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var debug = require('debug');
var APP_NAME = 'JsSIP';
module.exports = /*#__PURE__*/function () {
  function Logger(prefix) {
    _classCallCheck(this, Logger);
    if (prefix) {
      this._debug = debug["default"]("".concat(APP_NAME, ":").concat(prefix));
      this._warn = debug["default"]("".concat(APP_NAME, ":WARN:").concat(prefix));
      this._error = debug["default"]("".concat(APP_NAME, ":ERROR:").concat(prefix));
    } else {
      this._debug = debug["default"](APP_NAME);
      this._warn = debug["default"]("".concat(APP_NAME, ":WARN"));
      this._error = debug["default"]("".concat(APP_NAME, ":ERROR"));
    }
    /* eslint-disable no-console */
    this._debug.log = console.info.bind(console);
    this._warn.log = console.warn.bind(console);
    this._error.log = console.error.bind(console);
    /* eslint-enable no-console */
  }
  _createClass(Logger, [{
    key: "debug",
    get: function get() {
      return this._debug;
    }
  }, {
    key: "warn",
    get: function get() {
      return this._warn;
    }
  }, {
    key: "error",
    get: function get() {
      return this._error;
    }
  }]);
  return Logger;
}();