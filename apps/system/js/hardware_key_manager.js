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
      window.addEventListener('mozbrowserbeforekeydown', this);
      window.addEventListener('mozbrowserbeforekeyup', this);
      window.addEventListener('mozbrowserkeydown', this);
      window.addEventListener('mozbrowserkeyup', this);
      window.addEventListener('keydown', this);
      window.addEventListener('keyup', this);
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
    },
    stop: function hkm_stop() {
      window.removeEventListener('mozbrowserbeforekeydown', this);
      window.removeEventListener('mozbrowserbeforekeyup', this);
      window.removeEventListener('mozbrowserkeydown', this);
      window.removeEventListener('mozbrowserkeyup', this);
      window.removeEventListener('keydown', this);
      window.removeEventListener('keyup', this);
      console.log('[HardwareKeyManager] stopped');
    },
    handleEvent: function hkm_handleEvent(evt) {
      var key;
      var beforeKey;
      console.log(evt.type + ': ' + JSON.stringify(evt.detail));
      switch (evt.type) {
        case 'mozbrowserbeforekeyup':
        case 'mozbrowserbeforekeydown':
          key = evt.detail.key.toLowerCase();
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

  /*
   * XXX: Should be move to correct location after
   * examining dependency
   */
  exports.hardwareKeyManager = new HardwareKeyManager();
  exports.hardwareKeyManager.start();

  exports.HardwareKeyManager = HardwareKeyManager;
}(window));
