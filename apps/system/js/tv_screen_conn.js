'use strict';

/* globals TVScreenConn */
(function(exports) {
  var TVScreenConn = function() {
    window.addEventListener('iac-tv-request', this);
  };

  TVScreenConn.prototype = {
    start: function tvsc_start() {
      console.log('TVScreenConn started!');
      return this;
    },
    stop: function tvsc_stop() {

    },
    handleEvent: function tvsc_handleEvent(evt) {
      var message = evt.detail;
      // TODO
      console.log('received request message:[' + message + ']');
      this.sendMessage('got message: ' + message);
    },
    sendMessage: function tvsc_sendMessage(message) {
      navigator.mozApps.getSelf().onsuccess = function(evt) {
        var app = evt.target.result;
        app.connect('tv-response').then(function onConnAccepted(ports) {
          ports.forEach(function(port) {
            port.postMessage(message);
          });
        }, function onConnRejected(reason) {
          console.log('connection rejected due to: ' + reason);
        });
      };
    }
  };

  exports.TVScreenConn = TVScreenConn;
}(window));

window.tvScreenConn = new TVScreenConn().start();