/* global MockPresentation, MockPresentationSession, MockNotification,
          Receiver */

'use strict';

require('/js/receiver.js');
require('/shared/test/unit/mocks/mock_notification.js');
require('/shared/test/unit/mocks/mock_event_target.js');
require('/tv_apps/tv_shared/test/unit/mocks/mock_presentation.js');
require('/tv_apps/tv_shared/test/unit/mocks/mock_presentation_session.js');

suite('notification-receiver/Receiver', function() {
  var receiver;
  var realNotification;

  suiteSetup(function() {
    realNotification = window.Notification;
    window.Notification = MockNotification;
  });

  suiteTeardown(function() {
    window.Notification = realNotification;
  });

  suite('init()', function() {
    var realPresentation;
    var mockSession;

    setup(function() {
      realPresentation = window.navigator.presentation;
      window.navigator.presentation = new MockPresentation();
      this.sinon.spy(window.navigator.presentation, 'addEventListener');

      mockSession = new MockPresentationSession();
      this.sinon.spy(mockSession, 'addEventListener');

      receiver = new Receiver();
      this.sinon.spy(receiver, '_handleSessionReady');
    });

    teardown(function() {
      window.navigator.presentation = realPresentation;

      mockSession.addEventListener.restore();
      receiver._handleSessionReady.restore();
      receiver.uninit();
    });

    test('> _handleSessionReady should called once ' +
      'when session object is not ready', function() {
        assert.isFalse(receiver._handleSessionReady.called);
        receiver.init();
        navigator.presentation._mInjectReceiverSession(mockSession);

        assert.isTrue(receiver._handleSessionReady.calledOnce);
        assert.isTrue(
          mockSession.addEventListener.calledWith('message'));
        assert.isTrue(
          mockSession.addEventListener.calledWith('statechange'));
      });

    test('> _handleSessionReady should called once ' +
      'when session object is ready', function() {
        navigator.presentation._mInjectReceiverSession(mockSession);

        assert.isFalse(receiver._handleSessionReady.called);
        receiver.init();
        assert.isTrue(receiver._handleSessionReady.calledOnce);
        assert.isTrue(
          mockSession.addEventListener.calledWith('message'));
        assert.isTrue(
          mockSession.addEventListener.calledWith('statechange'));
      });
  });

  suite('onmessage', function() {
    var mockSession;
    var realPresentation;

    setup(function() {
      realPresentation = window.navigator.presentation;
      window.navigator.presentation = new MockPresentation();

      mockSession = new MockPresentationSession();
      receiver = new Receiver();
      this.sinon.spy(receiver, '_handleMessage');
      navigator.presentation._mInjectReceiverSession(mockSession);
      receiver.init();
    });

    teardown(function() {
      mockSession = undefined;
      window.navigator.presentation = realPresentation;
      receiver._handleMessage.restore();
      receiver.uninit();
    });

    test('should invoke _handleMessage', function() {
      // XXX: evt is subject to changed if we change message data format
      var data = {
        type: 'start-ringing',
        call: '0987654321'
      };
      mockSession._mTriggerMessage(data);
      assert.isTrue(receiver._handleMessage.calledOnce);
    });
  });

});
