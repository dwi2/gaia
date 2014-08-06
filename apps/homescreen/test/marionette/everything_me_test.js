'use strict';

// var assert = require('assert');
var Homescreen = require('./lib/homescreen');

marionette('E.me', function() {
  var client = marionette.client({
    settings: {
      'ftu.manifestURL': null,
      'software-button.enabled': true,
      'lockscreen.enabled': false
    }
  });
  var homescreen;
  var tapHomeButton = function() {
    if (client) {
      // client.executeScript(function() {
      //   window.wrappedJSObject.hardwareButtons.handleEvent({
      //     detail: {
      //       type: 'home-button-press'
      //     }
      //   });
      //   window.wrappedJSObject.hardwareButtons.handleEvent({
      //     detail: {
      //       type: 'home-button-release'
      //     }
      //   });
      // });
      var softwareHomeButton;
      client.switchToFrame();
      softwareHomeButton = client.findElement('#software-home-button');
      softwareHomeButton.click();
    }
  };

  setup(function() {
    homescreen = new Homescreen(client);
    homescreen.launch();
  });
  teardown(function() {
  });

  test('tap collection icon and press home button', function() {
    // var icons = client.findElement('#icongrid');
    var musicCollectionIcon =
      client.findElement(
        '#icongrid > .evmePage > ol > li.icon[aria-label="Music"]');
    client.helper.waitForElement(musicCollectionIcon);
    musicCollectionIcon.tap();
    // client.switchToFrame();
    tapHomeButton();
    var i = 1;
    for (i = 1; i < 301; i += 1) {
      homescreen.backToApp();
      // icons = client.findElement('#icongrid');
      // console.log(icons.cssProperty('display'));
      // assert.ok(icons.cssProperty('display') !== 'none');
      musicCollectionIcon =
        client.findElement(
          '#icongrid > .evmePage > ol > li.icon[aria-label="Music"]');
      client.helper.waitForElement(musicCollectionIcon);
      musicCollectionIcon.tap();
      // client.switchToFrame();
      tapHomeButton();
      console.log('Repeat ' + i + ' times');
    }
  });

});