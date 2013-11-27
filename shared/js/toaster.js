/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/**
 * XXX: Toaster create a HTML structure like this:
 *   <section role="status" hidden>
 *     <p></p>
 *   </section>
 * and insert it to the bottom of <body> (or any other element you specified.)
 * This HTML structure depends on styles declared in shared/style/status.css
 */

var Toaster = {
  _containerElement: null,
  _messageElement: null,
  _maxLatency: 5000,
  _toastQueue: [],
  _parentElement: null,

  _isBacklogged: function t_isBacklogged() {
    return this._toastQueue.length > 0;
  },

  _isBusy: function t_isBusy() {
    return !this._containerElement.hidden;
  },

  _produceToast: function t_producetToast(messageId, messageArgs, latency) {
    this._toastQueue.push({
      messageL10nId: messageId,
      messageL10nArgs: messageArgs,
      latency: (latency < this._maxLatency) ? latency : this._maxLatency
    });
    // if toaster is busy, don't bother to call it to consume toast
    if (!this._isBusy()) {
      this._consumeToast();
    }
  },

  _consumeToast: function t_consumeToast() {
    var self = this;
    var toast = null;
    if (self._isBacklogged()) {
      toast = self._toastQueue.shift();
      navigator.mozL10n.localize(
        self._messageElement, toast.messageL10nId, toast.messageL10nArgs);
      self._containerElement.hidden = false;
      setTimeout(function() {
        self._messageElement.innerHTML = '';
        self._containerElement.hidden = true;
        if (self._isBacklogged()) {
          self._consumeToast();
        }
      }, toast.latency);
    }
  },

  _destroy: function t_destroy() {
    this._toastQueue = [];
    if (this._parentElement && this._containerElement) {
      this._parentElement.removeChild(this._containerElement);
    }
    this._messageElement = null;
    this._containerElement = null;
  },

  get containerElement() {
    return this._containerElement;
  },

  get messageElement() {
    return this._messageElement;
  },

  initialize: function t_initialize(parentElement) {
    var existedToastContainer =
      document.querySelector('section[role="status"]');
    // Remove existing element of id equals to #toast.
    // This case only existed in unit test
    if (existedToastContainer) {
      existedToastContainer.parentNode.removeChild(existedToastContainer);
    }
    this._destroy();
    this._containerElement = document.createElement('section');
    this._containerElement.hidden = true;
    this._containerElement.setAttribute('role', 'status');
    this._messageElement = document.createElement('p');
    this._containerElement.appendChild(this._messageElement);
    this._parentElement = parentElement || document.body;
    this._parentElement.appendChild(this._containerElement);
  },

  isInitialized: function t_isInitialized() {
    return (this._containerElement &&
            this._messageElement &&
            this._toastQueue);
  },

  showToast: function t_showToast(options) {
    // make sure toaster is initialized
    if (!this.isInitialized()) {
      this.initialize();
    }
    this._produceToast(
      options.messageL10nId,
      options.messageL10nArgs,
      options.latency);
  }
};
