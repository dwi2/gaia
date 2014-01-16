(function(exports) {
  'use strict';

  var MockMutationObserver = function(callback) {
    if (!callback) {
      throw {
        message: 'Not enough arguments to MutationObserver.constructor.',
        name: 'TypeError'
      };
    }
    this.callback = callback;
    this.connected = false;
  };

  // we only mock what we need
  MockMutationObserver.prototype = {
    observe: function mmo_observe(target, options) {
      if (!options || !(options.childList ||
                        options.attributes || options.characterData)) {
        throw {
          message: 'An invalid or illegal string was specified.',
          name: 'SyntaxError'
        };
      }
      this.target = target;
      this.connected = true;
    },
    disconnect: function mmo_disconnect() {
      this.connected = false;
    },
    // below are helper methods
    // please refer to https://developer.mozilla.org/
    // en-US/docs/Web/API/MutationObserver#MutationRecord
    // for properties of param 'record'
    simulateMutation: function mmo_simulateMutation(record) {
      if (this.connected)
        this.callback([record]);
    }
  };

  exports.MockMutationObserver = MockMutationObserver;

}(this));
