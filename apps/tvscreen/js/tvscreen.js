'use strict';

/* globals TVscreen */

(function(exports){
  var TVscreen = function() {
    window.addEventListener('iac-tv-response', this);
  };

  TVscreen.prototype = {
    _sendButton: undefined,
    _inputBox: undefined,

    _sendButtonHandler: function(evt) {
      var msg;
      if (evt.target.id === 'send') {
        msg = this._inputBox.value;
        console.log('call sendMessage(' + msg + ')');
        this.sendMessage(msg);
      }
    },

    sendMessage: function tvs_sendMessage(message) {
      console.log('we would like to send ' + message + ' to system');
      navigator.mozApps.getSelf().onsuccess = function(evt) {
        var app = evt.target.result;
        app.connect('tv-request').then(function onConnAccepted(ports) {
          ports.forEach(function(port) {
            port.postMessage(message);
          });
        }, function onConnRejected(reason) {
          console.log('connection rejected due to: ' + reason);
          console.log('tv-request');
        });
      };
    },
    handleEvent: function tvs_handleEvent(evt) {
      var message = evt.detail;
      console.log('received response message: [' + message + ']');
    },
    start: function tvs_start() {
      this._inputBox = document.getElementById('message');
      this._sendButton = document.getElementById('send');
      window.addEventListener(
        'click', this._sendButtonHandler.bind(this));
      console.log('TVscreen started!');
      return this;
    },
    stop: function tvs_stop() {
      this._sendButton.removeEventListener(
        'click', this._sendButtonHandler.bind(this));
    }
  };
  exports.TVscreen = TVscreen;
}(window));
window.tvscreen = new TVscreen().start();
