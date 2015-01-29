/* global evt */
'use strict';

(function(exports) {
  var MockFlingPlayer = function() {};

  MockFlingPlayer.prototype = evt({
    load: function() {},
    play: function() {},
    pause: function() {},
    seek: function() {},
    mFireEvent: function(evtName, detail) {
      this.fire(evtName, detail);
    }
  });

  exports.MockFlingPlayer = MockFlingPlayer;
}(window));