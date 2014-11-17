/* global KeyEvent */

(function(exports) {
  'use strict';

  exports.KeyEventHelper = {
    CONVERSION_KEYS_FOR_SPATIAL_NAVIGATOR: Object.freeze({
      'Down': 'down',
      'ArrowDown': 'down',
      'Up': 'up',
      'ArrowUp': 'up',
      'Right': 'right',
      'ArrowRight': 'right',
      'Left': 'left',
      'ArrowLeft': 'left',
      'Enter': 'enter',
      'Esc': 'esc',
      'Backspace': 'esc'
    }),

    convertKeyForSpatialNavigator:
      function ke_convertKeyForSpatialNavigator(event) {
        if (event instanceof KeyEvent) {
          return this.CONVERSION_KEYS_FOR_SPATIAL_NAVIGATOR[event.key];
        } else {
          return undefined;
        }
      }
  };

}(window));
