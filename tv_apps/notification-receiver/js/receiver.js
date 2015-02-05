/* global Notification */
/* jshint nonew: false */
'use strict';

(function(exports) {

  const DEFAULT_ICON_URL = 'style/icons/ic_default-notification.png';

  var Receiver = function Receiver() {
  };

  Receiver.prototype = {

    _onSessionReady: undefined,
    _onMessage: undefined,
    _onStateChange: undefined,

    init: function r_init() {
      var that = this;
      console.log('[Demo] start init');
      this._onSessionReady = this._handleSessionReady.bind(this);
      this._onMessage = this._handleMessage.bind(this);
      this._onStateChange = this._handleStateChange.bind(this);

      if (navigator.mozPresentation) {
        console.log('[Demo] wait a second before fetching ' +
          'mozPresentation.session ');
        window.setTimeout(function() {
          if (navigator.mozPresentation.session) {
            console.log('[Demo] mozPresentation.session is ready');
            that._onSessionReady();
          } else {
            console.log('[Demo] mozPresentation.session is not ready, ' +
              'add eventListener for sessionready');
            navigator.mozPresentation.addEventListener('sessionready',
              that._onSessionReady);
          }
        });
      }
    },

    uninit: function r_uninit() {
      if (navigator.mozPresentation) {
        navigator.mozPresentation.removeEventListener('sessionready',
          this._onSessionReady);

        var session = navigator.mozPresentation.session;
        if (session) {
          // XXX: message is an exception that we could not use addEventListener
          // on it. See http://bugzil.la/1128384
          session.removeEventListener('message', this._onMessage);
          session.removeEventListener('statechange', this._onStateChange);
        }
      }
    },

    _handleSessionReady: function r_handleSessionReady() {
      console.log('[Demo] _handleSessionReady, mozPresentation.session ' +
        'is ready');
      var session = navigator.mozPresentation.session;
      session.addEventListener('message', this._onMessage);
      session.addEventListener('statechange', this._onStateChange);
    },

    _renderMessage: function r_renderMessage(message) {
      var result;

      switch(message.type) {
        case 'Message':
        case 'Laundry':
        case 'Home':
        case 'Mail':
          result = {
            body: message.body,
            title: message.title
          };
          break;
      }
      return result;
    },

    _handleMessage: function r_handleMessage(evt) {
      console.log('[Demo] _handleMessage, got ' + evt.data);
      var message = JSON.parse(evt.data);
      var renderedMessage = this._renderMessage(message);

      if (renderedMessage) {
        new Notification(renderedMessage.title, {
          body: renderedMessage.body,
          icon: DEFAULT_ICON_URL
        });
      }
    },

    _handleStateChange: function r_handleStateChange(evt) {
      console.log('[Demo] _handleStateChange, evt.state = ' + evt.state);
      if (!evt.state) {
        this.uninit();
        window.close();
      }
    }
  };

  exports.Receiver = Receiver;

}(window));
