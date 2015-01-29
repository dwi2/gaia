/* globals MockEventTarget, MockPresentationSession */
(function(exports) {
  'use strict';

  // Mock API from http://bit.ly/1A12BxK
  var MockPresentation = function() {};
  MockPresentation.prototype = Object.create(MockEventTarget.prototype);
  Object.defineProperty(MockPresentation.prototype, 'session', {
    get: function() {
      return this._mSession;
    }
  });

  // navigator.presentation.startSession is for sender only
  MockPresentation.prototype.startSession = function(url, sessionId) {
    var session = new MockPresentationSession();
    session._mState = 'connected';
    // navigator.presentation.session is only available on receiver
    this._mSession = undefined;
    return Promise.resolve(session);
  };
  MockPresentation.prototype.joinSession = function(url, sessionId) {};
  MockPresentation.prototype._mInjectReceiverSession = function(session) {
    this._mSession = session;
    this.dispatchEvent({
      type: 'sessionready'
    });
  };

  exports.MockPresentation = MockPresentation;
}(window));
