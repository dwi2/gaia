/* global MockEventTarget */
(function(exports) {
  'use strict';

  // Mock API from http://bit.ly/1uAh0jd
  var MockPresentationSession = function (id) {
    this._mState = 'disconnected';
    this.id = id || 'testsession';
  };

  MockPresentationSession.prototype = Object.create(MockEventTarget.prototype);
  Object.defineProperty(MockPresentationSession.prototype, 'state', {
    get: function() {
      return this._mState;
    }
  });
  MockPresentationSession.prototype.send = function(data) {};
  MockPresentationSession.prototype.disconnect = function() {
    this.state = 'disconnected';
  };
  MockPresentationSession.prototype._mSetState = function(state) {
    if (state !== this._mState) {
      this._mState = state;
      this.dispatchEvent({
        type: 'statechange',
        state: this._mState
      });
    }
  };
  MockPresentationSession.prototype._mTriggerMessage = function(payload) {
    this.dispatchEvent({
      type: 'message',
      data: payload
    });
  };


  exports.MockPresentationSession = MockPresentationSession;
}(window));
