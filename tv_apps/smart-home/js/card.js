(function(exports) {
  'use strict';

  // Base class for App, Deck, and Folder
  var Card = function(options) {
    this.name = 'Unknown';
    this.cachedIconURL = options.cachedIconURL;
  };

  Card.prototype = evt({
    CLASS_NAME: 'Card',
    get type() {
      return this.CLASS_NAME;
    }
  });

  exports.Card = Card;

}(window));
