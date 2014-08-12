'use strict';

// var assert = require('assert');

marionette('E.me', function() {
  var client = marionette.client({
    settings: {
      'ftu.manifestURL': null,
      'software-button.enabled': true,
      'lockscreen.enabled': false
    }
  });
  var realHomescreen;
  var tapHomeButton = function() {
    if (client) {
      var softwareHomeButton;
      client.switchToFrame();
      softwareHomeButton = client.findElement('#software-home-button');
      softwareHomeButton.click();
    }
  };

  setup(function() {
    realHomescreen = client.findElement('iframe[mozapptype="homescreen"]');
    tapHomeButton();
    client.switchToFrame(realHomescreen);
    client.helper.wait(1000);
  });
  teardown(function() {
  });

  test('tap collection icon and press home button', function() {
    var musicCollectionIcon =
      client.findElement(
        '#icongrid > .evmePage > ol > li.icon[aria-label="Music"]');
    client.helper.waitForElement(musicCollectionIcon);
    musicCollectionIcon.tap();
    tapHomeButton();
    var i = 1;
    for (i = 1; i < 1001; i += 1) {
      client.switchToFrame(realHomescreen);
      // assert.ok(icons.cssProperty('display') !== 'none');
      musicCollectionIcon =
        client.findElement(
          '#icongrid > .evmePage > ol > li.icon[aria-label="Music"]');
      client.helper.waitForElement(musicCollectionIcon);
      musicCollectionIcon.tap();
      tapHomeButton();
      console.log('Repeat ' + i + ' times');
    }
  });

});