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
  _containerElementObserver: null,
  _messageElement: null,
  _defaultLatency: 3000,
  _maxLatency: 5000,
  _maxTransitionLatency: 800,
  _toastQueue: [],
  _parentElement: null,

  _isBacklogged: function t_isBacklogged() {
    return this._toastQueue.length > 0;
  },

  _isBusy: function t_isBusy() {
    return !this._containerElement.hidden;
  },

  _showContainerElement: function t_showContainerElement() {
    if (this._containerElement) {
      this._containerElement.hidden = false;
    }
  },

  _hideContainerElement: function t_hideContainerElement() {
    if (this._containerElement) {
      this._containerElement.hidden = true;
    }
  },

  _mutationHandler: function t_onMutate(mutation) {
    if (mutation.attributeName === 'class' &&
      !this._containerElement.classList.contains('toast-visible')) {
      this._containerElementObserver.disconnect();
      setTimeout(
        this._hideContainerElement.bind(this),
        this._maxTransitionLatency);
    }
  },

  _onContainerElementMutate: function t_onContainerElementMutate(mutations) {
    mutations.forEach(this._mutationHandler.bind(this));
  },

  _produceToast: function t_producetToast(messageId, messageArgs, latency) {
    this._toastQueue.push({
      messageL10nId: messageId,
      messageL10nArgs: messageArgs,
      latency: Math.min(latency || this._defaultLatency, this._maxLatency)
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
      self._showContainerElement();
      self._containerElement.classList.add('toast-visible');
      self._containerElementObserver.observe(
        self._containerElement, {attributes: true});
      setTimeout(function() {
        self._messageElement.textContent = '';
        navigator.mozL10n.localize(self._messageElement, '');
        self._containerElement.classList.remove('toast-visible');
        self._consumeToast();
      }, toast.latency);
    }
  },

  _destroy: function t_destroy() {
    this._toastQueue = [];
    if (this._containerElementObserver) {
      this._containerElementObserver.disconnect();
    }
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
    // Remove existing element of toast
    // This case only exists in unit test
    if (existedToastContainer) {
      existedToastContainer.parentNode.removeChild(existedToastContainer);
    }
    this._destroy();
    this._containerElement = document.createElement('section');
    this._containerElement.setAttribute('role', 'status');
    this._hideContainerElement();
    this._messageElement = document.createElement('p');
    this._containerElement.appendChild(this._messageElement);
    this._parentElement = parentElement || document.body;
    this._parentElement.appendChild(this._containerElement);
    this._containerElementObserver =
      new MutationObserver(this._onContainerElementMutate.bind(this));
  },

  isInitialized: function t_isInitialized() {
    return (this._containerElement &&
            this._messageElement &&
            this._toastQueue);
  },

  // options are:
  //   messageL10nId
  //   messageL10nArgs
  //   latency
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
