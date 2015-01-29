/* global MockPresentation, MockPresentationSession, MockFlingPlayer,
          Connector */
'use strict';

require('/js/connector.js');
require('/tv_apps/tv_shared/js/vendor/evt.js');
require('/test/unit/mock_fling_player.js');
require('/shared/test/unit/mocks/mock_event_target.js');
require('/tv_apps/tv_shared/test/unit/mocks/mock_presentation.js');
require('/tv_apps/tv_shared/test/unit/mocks/mock_presentation_session.js');

suite('fling-player/Connector', function() {
  var connector;

  suite('init()', function() {
    var realPresentation;
    var mockPlayer;
    var mockSession;

    setup(function() {
      realPresentation = navigator.mozPresentation;
      navigator.mozPresentation = new MockPresentation();
      this.sinon.spy(navigator.mozPresentation, 'addEventListener');

      mockSession = new MockPresentationSession();
      this.sinon.spy(mockSession, 'addEventListener');

      mockPlayer = new MockFlingPlayer();
      connector = new Connector(mockPlayer);
    });

    teardown(function() {
      navigator.mozPresentation = realPresentation;
      mockSession.addEventListener.restore();
      connector = undefined;
      mockPlayer = undefined;
    });

    test('should listen to "sessionready" event if session is not ready',
      function() {
        connector.init();

        assert.isTrue(
          navigator.mozPresentation.addEventListener.calledWith(
            'sessionready'));
      });

    test('should call initSession if session is ready', function() {
      navigator.mozPresentation._mInjectReceiverSession(mockSession);

      connector.init();

      assert.isTrue(
        navigator.mozPresentation.addEventListener.calledWith('message'));
      assert.ok(connector._session);
    });
  });

  suite('handleRemoteMessage()', function() {
    var realPresentation;
    var mockPlayer;
    var mockSession;

    setup(function() {
      realPresentation = navigator.mozPresentation;
      navigator.mozPresentation = new MockPresentation();

      mockSession = new MockPresentationSession();
      navigator.mozPresentation._mInjectReceiverSession(mockSession);

      mockPlayer = new MockFlingPlayer();
      connector = new Connector(mockPlayer);
    });

    teardown(function() {
      navigator.mozPresentation = realPresentation;
      connector = undefined;
      mockPlayer = undefined;
    });

    test('should call player.load() when receive "load" message', function() {
      mockSession._mTriggerMessage({
        type: 'load'
        // TODO
      });
      // TODO
    });
  });

});