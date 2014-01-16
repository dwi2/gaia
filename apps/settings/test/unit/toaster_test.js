/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

// Tests the toaster.js from shared

'use strict';

require('/shared/js/toaster.js');
requireApp('settings/test/unit/mock_l10n.js');
requireApp('settings/test/unit/mock_mutation_observer.js');

var ToasterTestHelper = {
  thereShouldBeNoToastShowed: function tth_thereShouldBeNoToastShowed(elem) {
    if (elem) {
      assert.ok(elem.hasAttribute('hidden'),
        'element should have attribute "hidden"');
      assert.ok(elem.hidden, 'element.hidden should be true');
    } else {
      assert.fail(null, null, 'No element');
    }
  },

  thereMustHaveToastShowed:
      function tth_thereMustHaveToastShowed(elem, expectedContent) {
    if (elem) {
      assert.ok(!elem.hidden,
        'element.hidden = ' + elem.hidden);
    } else {
      assert.fail(null, null, 'No element');
    }
  },

  simulateMutation: function tth_simulateMutation() {
    if (Toaster._containerElementObserver &&
        Toaster._containerElementObserver.simulateMutation) {
      Toaster._containerElementObserver.simulateMutation({
        target: Toaster._containerElement,
        attributeName: 'class',
        oldValue: 'toast-visible'
      });
    }
  }
};

suite('Toaster', function() {
  var realMozL10n;
  var realMutationObserver;

  suiteSetup(function() {
    realMozL10n = navigator.mozL10n;
    realMutationObserver = MutationObserver;
    MutationObserver = MockMutationObserver;
    navigator.mozL10n = MockL10n;
  });

  suiteTeardown(function() {
    navigator.mozL10n = realMozL10n;
    MutationObserver = realMutationObserver;
  });

  suite(' > Initialize methods', function() {
    test(' > initialize() with parentElement', function() {
      var parentElement = document.createElement('div');
      Toaster.initialize(parentElement);
      assert.ok(Toaster.containerElement, 'containerElement does not exist');
      assert.ok(Toaster.messageElement,
        'messageElement does not exist');
      ToasterTestHelper.thereShouldBeNoToastShowed(
        parentElement.getElementsByTagName('section')[0]);
      Toaster._destroy();
    });

    test(' > initialize() without parentElement', function() {
      Toaster.initialize();
      assert.ok(Toaster.containerElement, 'containerElement does not exist');
      assert.ok(Toaster.messageElement,
        'messageElement does not exist');
      Toaster._destroy();
    });
  });

  suite(' > Public methods', function() {
    setup(function() {
      Toaster.initialize();
    });

    teardown(function() {
      Toaster._destroy();
    });

    test(' > isInitialized()', function() {
      var initialized = Toaster.isInitialized();
      ToasterTestHelper.thereShouldBeNoToastShowed(
        document.querySelector('section[role="status"]'));
    });

    test(' > showToast()', function() {
      var expectedContent = 'under testing';
      Toaster.showToast({
        messageL10nId: expectedContent,
        latency: 5000
      });
      ToasterTestHelper.thereMustHaveToastShowed(
        document.querySelector('section[role="status"]'),
        expectedContent);
    });
  });

  suite(' > Private methods', function() {
    setup(function() {
      Toaster.initialize();
      Toaster.showToast({messageL10nId: 'under testing'});
    });

    teardown(function() {
      Toaster._destroy();
    });

    test(' > _isBusy()', function() {
      assert.ok(Toaster._isBusy(), 'toaster is not busy');
    });

    test(' > _isBacklogged()', function() {
      Toaster.showToast({messageL10nId: 'more coming'});
      assert.ok(Toaster._isBacklogged(), 'toaster is not backlogged');
    });
  });

  suite(' > Complex scenarios with time bending', function() {
    var clock;
    setup(function() {
      clock = this.sinon.useFakeTimers();
      Toaster.initialize();
    });

    teardown(function() {
      Toaster._destroy();
      clock.restore();
    });

    test(' > show toast once', function() {
      var expectedContent = 'This should display for only 2 seconds';
      Toaster.showToast({
        messageL10nId: expectedContent,
        latency: 2000
      });
      clock.tick(1000);
      ToasterTestHelper.thereMustHaveToastShowed(
        document.querySelector('section[role="status"]'),
        expectedContent);
      clock.tick(1000);
      ToasterTestHelper.simulateMutation();
      // wait for transition
      clock.tick(1000);
      ToasterTestHelper.thereShouldBeNoToastShowed(
        document.querySelector('section[role="status"]'));
    });

    test(' > show 3 toasts in a row', function() {
      var expectedContent = [
        'The 1st toast should display for only 2 seconds',
        'The 2nd toast should display for only 3 seconds',
        'The 3rd toast should display for only 1 seconds'
      ];

      Toaster.showToast({
        messageL10nId: expectedContent[0],
        latency: 2000
      });
      Toaster.showToast({
        messageL10nId: expectedContent[1],
        latency: 3000
      });
      Toaster.showToast({
        messageL10nId: expectedContent[2],
        latency: 1000
      });

      // 1st toast showed
      clock.tick(1000); // 1.000 second
      ToasterTestHelper.thereMustHaveToastShowed(
        document.querySelector('section[role="status"]'), expectedContent[0]);
      clock.tick(1000); // 2.000 second
      ToasterTestHelper.simulateMutation();
      // wait for transition
      clock.tick(800); // 2.800 second

      // 2nd toast showed
      clock.tick(1500); // 4.300 second
      ToasterTestHelper.thereMustHaveToastShowed(
        document.querySelector('section[role="status"]'), expectedContent[1]);
      clock.tick(1500); // 5.800 second
      ToasterTestHelper.simulateMutation();
      // wait for transition
      clock.tick(800); // 6.600 second

      // 3rd toast showed
      ToasterTestHelper.thereMustHaveToastShowed(
        document.querySelector('section[role="status"]'), expectedContent[2]);
      clock.tick(1000);  // 7.600 second
      ToasterTestHelper.simulateMutation();
      // wait for transition
      clock.tick(800); // 8.400 second

      // all toasts should be cleared
      ToasterTestHelper.thereShouldBeNoToastShowed(
        document.querySelector('section[role="status"]'));
    });
  });
});
