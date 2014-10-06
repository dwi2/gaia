(function(exports) {
  'use strict';

  var FakeDeck = function(options) {
    this.nativeApp = undefined;
    this.entryPoint = '';
    this.name = options.name;
    this.cachedIconBlob = undefined;
    this.cachedIconURL = options.cachedIconURL;
  };

  FakeDeck.prototype = Object.create(Card.prototype);

  FakeDeck.prototype.constructor = FakeDeck;

  FakeDeck.prototype.CLASS_NAME = 'Deck';

  FakeDeck.prototype.launch = function app_launch(args) {
    // nothing to launch
  };

  exports.FakeDeck = FakeDeck;
}(window));
