/* global NotificationSender, MockPresentation, MockPresentationSession */
'use strict';

require('/tv_apps/tv_shared/components/smart-button/script.js');
require('/shared/test/unit/mocks/mock_event_target.js');
require('/tv_apps/tv_shared/test/unit/mocks/mock_presentation.js');
require('/tv_apps/tv_shared/test/unit/mocks/mock_presentation_session.js');


suite('NotificationSender >', function() {
  var realPresentation;
  var mockSession;
  var urlInput;
  var subject;

  suiteSetup(function(done) {
    urlInput = document.createElement('input');
    urlInput.id = 'url-input';
    urlInput.value = 'http://www.test.url.goes.here';
    document.body.appendChild(urlInput);

    require('/tv_apps/notification-sender/js/notification_sender.js', done);

  });

  suiteTeardown(function() {
    document.body.removeChild(urlInput);
  });

  suite('', function() {
    setup(function() {
      subject = new NotificationSender();
      realPresentation = navigator.presentation;
      navigator.presentation = new MockPresentation();
      mockSession = new MockPresentationSession();
    });

    teardown(function() {
      navigator.presentation = realPresentation;
      mockSession = undefined;
    });

    test('connect() should enable buttons', function(done) {
      var spy = this.sinon.spy(subject, 'disableButtons');
      spy.withArgs(false);

      subject.connect().then(function() {
        assert.isTrue(spy.withArgs(false).calledOnce);
        done();
      });
    });

    test('connect() should listen to session.onstatechange', function(done) {
      assert.isUndefined(subject.session);

      subject.connect().then(function() {
        assert.isFunction(subject.session.onstatechange);
      }).then(done, done);
    });

    test('sendMessage() should call session.sendMessage', function(done) {
      var that = this;
      var data = {data: 'hello, world'};
      var dataJSON = JSON.stringify(data);

      subject.connect().then(function() {
        var spy = that.sinon.spy(subject.session, 'send');
        spy.withArgs(dataJSON);

        subject.sendMessage(data);

        assert.isTrue(spy.withArgs(dataJSON).calledOnce);
      }).then(done, done);
    });
  });

});
