'use strict';

/* globals SettingsListener*/

(function(exports) {
  var HardwareKeyManager = function HardwareKeyManager() {
  };

  HardwareKeyManager.prototype = {
    _settingsKeyVariant: ['power', 'exit', 'volumedown', 'volumeup'],
    _settings: {},
    start: function hkm_start() {
      var that = this;
      // for hardware-key-tester
      this._settingsKeyVariant.forEach(function(keyVariant) {
        var defaultValue = 'dontCare';
        var beforeKey = 'hardware-key.' + keyVariant + '.before';
        var afterKey = 'hardware-key.' + keyVariant + '.after';
        SettingsListener.observe(beforeKey, defaultValue,
          function(value) {
            that._settings[beforeKey] = value;
        });
        SettingsListener.observe(afterKey, defaultValue,
          function(value) {
            that._settings[afterKey] = value;
        });
      });
      console.log('[HardwareKeyManager] started');
      return this;
    },
    stop: function hkm_stop() {
      console.log('[HardwareKeyManager] stopped');
    },
    process: function hkm_process(evt) {
      var key;
      var beforeKey;
      console.log(evt.type + ': ' + JSON.stringify(evt.detail));
      switch (evt.type) {
        case 'mozbrowserbeforekeyup':
        case 'mozbrowserbeforekeydown':
          key = (evt.detail && evt.detail.key && evt.detail.key.toLowerCase())||
            (evt.key && evt.key.toLowerCase());
          if (key === 'home') {
            key = 'exit';
          }
          beforeKey = 'hardware-key.' + key + '.before';
          if (this._settings[beforeKey] === 'preventDefault') {
            evt.preventDefault();
          }
          break;
        case 'mozbrowserkeyup':
        case 'mozbrowserkeydown':
          // TODO:
          break;
      }
    }
  };

  exports.HardwareKeyManager = HardwareKeyManager;
}(window));
