"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var JsSIP_C = require('../Constants');
var Transactions = require('../Transactions');
var RequestSender = require('../RequestSender');

// Default event handlers.
var EventHandlers = {
  onRequestTimeout: function onRequestTimeout() {},
  onTransportError: function onTransportError() {},
  onSuccessResponse: function onSuccessResponse() {},
  onErrorResponse: function onErrorResponse() {},
  onAuthenticated: function onAuthenticated() {},
  onDialogError: function onDialogError() {}
};
module.exports = /*#__PURE__*/function () {
  function DialogRequestSender(dialog, request, eventHandlers) {
    _classCallCheck(this, DialogRequestSender);
    this._dialog = dialog;
    this._ua = dialog._ua;
    this._request = request;
    this._eventHandlers = eventHandlers;

    // RFC3261 14.1 Modifying an Existing Session. UAC Behavior.
    this._reattempt = false;
    this._reattemptTimer = null;

    // Define the undefined handlers.
    for (var handler in EventHandlers) {
      if (Object.prototype.hasOwnProperty.call(EventHandlers, handler)) {
        if (!this._eventHandlers[handler]) {
          this._eventHandlers[handler] = EventHandlers[handler];
        }
      }
    }
  }
  _createClass(DialogRequestSender, [{
    key: "request",
    get: function get() {
      return this._request;
    }
  }, {
    key: "send",
    value: function send() {
      var _this = this;
      var request_sender = new RequestSender(this._ua, this._request, {
        onRequestTimeout: function onRequestTimeout() {
          _this._eventHandlers.onRequestTimeout();
        },
        onTransportError: function onTransportError() {
          _this._eventHandlers.onTransportError();
        },
        onAuthenticated: function onAuthenticated(request) {
          _this._eventHandlers.onAuthenticated(request);
        },
        onReceiveResponse: function onReceiveResponse(response) {
          _this._receiveResponse(response);
        }
      });
      request_sender.send();

      // RFC3261 14.2 Modifying an Existing Session -UAC BEHAVIOR-.
      if ((this._request.method === JsSIP_C.INVITE || this._request.method === JsSIP_C.UPDATE && this._request.body) && request_sender.clientTransaction.state !== Transactions.C.STATUS_TERMINATED) {
        this._dialog.uac_pending_reply = true;
        var stateChanged = function stateChanged() {
          if (request_sender.clientTransaction.state === Transactions.C.STATUS_ACCEPTED || request_sender.clientTransaction.state === Transactions.C.STATUS_COMPLETED || request_sender.clientTransaction.state === Transactions.C.STATUS_TERMINATED) {
            request_sender.clientTransaction.removeListener('stateChanged', stateChanged);
            _this._dialog.uac_pending_reply = false;
          }
        };
        request_sender.clientTransaction.on('stateChanged', stateChanged);
      }
    }
  }, {
    key: "_receiveResponse",
    value: function _receiveResponse(response) {
      var _this2 = this;
      // RFC3261 12.2.1.2 408 or 481 is received for a request within a dialog.
      if (response.status_code === 408 || response.status_code === 481) {
        this._eventHandlers.onDialogError(response);
      } else if (response.method === JsSIP_C.INVITE && response.status_code === 491) {
        if (this._reattempt) {
          if (response.status_code >= 200 && response.status_code < 300) {
            this._eventHandlers.onSuccessResponse(response);
          } else if (response.status_code >= 300) {
            this._eventHandlers.onErrorResponse(response);
          }
        } else {
          this._request.cseq = this._dialog.local_seqnum += 1;
          this._reattemptTimer = setTimeout(function () {
            if (!_this2._dialog.isTerminated()) {
              _this2._reattempt = true;
              _this2.send();
            }
          }, 1000);
        }
      } else if (response.status_code >= 200 && response.status_code < 300) {
        this._eventHandlers.onSuccessResponse(response);
      } else if (response.status_code >= 300) {
        this._eventHandlers.onErrorResponse(response);
      }
    }
  }]);
  return DialogRequestSender;
}();