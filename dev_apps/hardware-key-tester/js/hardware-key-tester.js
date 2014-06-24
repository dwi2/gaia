'use strict';

/* globals SettingsListener */

(function(exports) {
  var HardwareKeyTester = {
    _settingsKeyVariant: ['power', 'exit', 'volumedown', 'volumeup'],
    _settings: {},
    _defaultValue: 'dontCare',
    _hardwareKeySelectElements: undefined,
    _keySelector: undefined,
    _twoLayerScenarioSelector: undefined,
    _threeLayerScenarioSelector: undefined,
    _eventDashboardElem: undefined,
    _switchModeButton: undefined,
    _outerFrame: undefined,
    _innerFrame: undefined,
    _checkbox: undefined,
    _pages: undefined,
    _scenarioKey: undefined,
    _scenario: undefined,
    _updateSelectValue: function(name, value) {
      if (this._hardwareKeySelectElements) {
        try {
          Array.prototype.forEach.call(this._hardwareKeySelectElements,
              function(elem) {
              if (elem.name === name) {
                elem.value = value;
                throw new Error('break');
              }
            });
        } catch (e) {
          if (e.message !== 'break') {
            throw e;
          }
        }
      }
    },
    _clearDashboardTimer: undefined,
    _clearDashboard: function() {
      if (this._eventDashboardElem) {
        this._eventDashboardElem.textContent = '';
      }
      this._clearDashboardTimer = undefined;
    },
    _switchMode: function() {
      if (this._pages) {
        Array.prototype.forEach.call(this._pages, function(page) {
          page.classList.toggle('slideaway');
        });
      }
    },
    _hideOnTransitionEnd: function(evt) {
      if (this._pages) {
        Array.prototype.forEach.call(this._pages, function(page) {
          page.hidden = !page.hidden;
        });
      }
    },
    _createFrame: function() {
      if (this._innerFrame) {
        this._destroyFrame();
      }
      this._innerFrame = document.createElement('iframe');
      // we hardcoded to open frame.html
      this._innerFrame.src = '/frame.html';
      this._innerFrame.height = '80px';
      this._outerFrame.appendChild(this._innerFrame);
    },
    _destroyFrame: function() {
      if (this._innerFrame) {
        this._innerFrame.remove();
        this._innerFrame = undefined;
      }
    },
    handleEvent: function(evt) {
      var key = evt.key.toLowerCase();
      var settingsKey = 'hardware-key.' + key + '.after',
        embedderBeforeKey = 'hardware-key.' + key + '.embedderBefore',
        embedderAfterKey = 'hardware-key.' + key + '.embedderAfter';
      if (this._settingsKeyVariant.indexOf(key) >= 0) {
        if (this._eventDashboardElem) {
          this._eventDashboardElem.textContent = evt.type + ': ' + evt.key;
          if (this._clearDashboardTimer) {
            window.clearTimeout(this._clearDashboardTimer);
            this._clearDashboardTimer = undefined;
          }
          this._clearDashboardTimer =
            window.setTimeout(this._clearDashboard.bind(this), 1500);
        }
        if ((evt.type === 'keydown' || evt.type === 'keyup') &&
            this._settings[settingsKey] === 'embeddedCancelled') {
          evt.preventDefault();
        } else if ((evt.type === 'mozbrowserbeforekeydown' ||
            evt.type === 'mozbrowserbeforekeyup') &&
            this._settings[embedderBeforeKey] === 'preventDefault') {
          evt.preventDefault();
        } else if (evt.type == 'mozbrowserkeydown' ||
            evt.type === 'mozbrowserkeyup') {
          if (this._settings[embedderAfterKey] === 'preventDefault') {
            evt.preventDefault();
          } else if (this._settings[embedderAfterKey] === 'embeddedCancelled') {
            console.log(key + ' ' + evt.type + '.embeddedCancelled = ' +
              evt.embeddedCancelled);
          }
        }
      }
      console.log(evt.type + ': ' + evt.key);
    },
    scenarioProcessor: function(key, scenario) {
      var key = this._scenarioKey,
        scenario = this._scenario,
        beforeKey = 'hardware-key.' + key + '.before',
        afterKey = 'hardware-key.' + key + '.after',
        embedderBeforeKey = 'hardware-key.' + key + '.embedderBefore',
        embedderAfterKey = 'hardware-key.' + key + '.embedderAfter',
        sset = {};

      switch (scenario) {
        case 'system-only': // system prevent default on mozbrowserbeforekeydown/up
          sset[beforeKey] = 'preventDefault';
          sset[afterKey] = 'dontCare';
          sset[embedderBeforeKey] = 'dontCare';
          sset[embedderAfterKey] = 'dontCare';
          break;
        case 'system-first':
          sset[beforeKey] = 'dontCare';
          sset[afterKey] = 'dontCare';
          sset[embedderBeforeKey] = 'dontCare';
          sset[embedderAfterKey] = 'dontCare';
          break;
        case 'app-cancelled': // embedded app prevent default on keydown
          sset[beforeKey] = 'dontCare';
          sset[afterKey] = 'embeddedCancelled';
          sset[embedderBeforeKey] = 'dontCare';
          sset[embedderAfterKey] = 'dontCare';
          break;
        case 'app-first':
          sset[beforeKey] = 'dontCare';
          sset[afterKey] = 'embeddedCancelled';
          sset[embedderBeforeKey] = 'dontCare';
          sset[embedderAfterKey] = 'dontCare';
          break;
        case 's1': // no any preventDefault
          sset[beforeKey] = 'dontCare';
          sset[afterKey] = 'dontCare';
          sset[embedderBeforeKey] = 'dontCare';
          sset[embedderAfterKey] = 'dontCare';
          break;
        case 's2': // system app prevent default on mozbrowserbeforekeydown/up
          sset[beforeKey] = 'preventDefault';
          sset[afterKey] = 'dontCare';
          sset[embedderBeforeKey] = 'dontCare';
          sset[embedderAfterKey] = 'dontCare';
          break;
        case 's3': // embedder app prevent default on mozbrowserbeforekeydown/up
          sset[beforeKey] = 'dontCare';
          sset[afterKey] = 'dontCare';
          sset[embedderBeforeKey] = 'preventDefault';
          sset[embedderAfterKey] = 'dontCare';
          break;
        case 's4': // embedded app prevent default on keydown/up
          sset[beforeKey] = 'dontCare';
          sset[afterKey] = 'dontCare';
          sset[embedderBeforeKey] = 'dontCare';
          sset[embedderAfterKey] = 'embeddedCancelled';
          break;
        case 's5': // embedder app prevent default on mozbrowserkeydown/up
          sset[beforeKey] = 'dontCare';
          sset[afterKey] = 'embeddedCancelled';
          sset[embedderBeforeKey] = 'dontCare';
          sset[embedderAfterKey] = 'preventDefault';
          break;
        case 's6': // system app prevent default on mozbrowserkeydown/up
          // seems useless
          sset[beforeKey] = 'dontCare';
          sset[afterKey] = 'preventDefault';
          sset[embedderBeforeKey] = 'dontCare';
          sset[embedderAfterKey] = 'dontCare';
          break;
      }
      SettingsListener.getSettingsLock().set(sset);
    },
    start: function hkt_start() {
      var that = this;
      this._eventDashboardElem = document.getElementById('event-dashboard');
      this._switchModeButton = document.getElementById('switch-mode-button');
      this._hardwareKeySelectElements =
        document.querySelectorAll('select.hardware-key');
      this._keySelector = document.getElementById('key-selector');
      this._twoLayerScenarioSelector =
        document.getElementById('two-layer-scenario-selector');
      this._threeLayerScenarioSelector =
        document.getElementById('three-layer-scenario-selector');
      this._scenarioKey = this._keySelector.value;
      this._scenario = this._twoLayerScenarioSelector.value;
      this._outerFrame = document.getElementById('outer-frame');
      this._checkbox = document.querySelector('div.checkbox');
      this._pages = document.querySelectorAll('article.page');
      window.addEventListener('transitionend',
        that._hideOnTransitionEnd.bind(that));
      this._settingsKeyVariant.forEach(function(keyVariant) {
        var beforeKey = 'hardware-key.' + keyVariant + '.before';
        var afterKey = 'hardware-key.' + keyVariant + '.after';
        SettingsListener.observe(beforeKey, that._defaultValue,
          function(value) {
            console.log(beforeKey + ' = ' + value);
            that._settings[beforeKey] = value;
            that._updateSelectValue(beforeKey, value);
          });
        SettingsListener.observe(afterKey, that._defaultValue,
          function(value) {
            console.log(beforeKey + ' = ' + value);
            that._settings[afterKey] = value;
            that._updateSelectValue(afterKey, value);
          });
      });
      console.log('Load init value');

      Array.prototype.forEach.call(that._hardwareKeySelectElements,
        function(elem) {
          var value = that._settings[elem.name];
          elem.value = value;
        });

      this._switchModeButton.addEventListener('click',
        this._switchMode.bind(this));
      window.addEventListener('change', function(evt) {
        var target = evt.target;
        var sset = {};
        var settingsKeys = Object.keys(that._settings);
        if (target.tagName.toLowerCase() === 'select' &&
            settingsKeys.indexOf(target.name) >= 0) {
          console.log(evt);
          sset[target.name] = target.value;
          SettingsListener.getSettingsLock().set(sset);
        }
      });
      this._checkbox.addEventListener('click', function(evt) {
        console.log('clicked');
        that._checkbox.classList.toggle('checked');
        if (that._checkbox.classList.contains('checked')) {
          that._createFrame();
          that._twoLayerScenarioSelector.disabled = true;
          that._threeLayerScenarioSelector.disabled = false;
          that._scenario = that._threeLayerScenarioSelector.value;
          console.log('_scenario = ' + that._scenario);
        } else {
          that._destroyFrame();
          that._twoLayerScenarioSelector.disabled = false;
          that._threeLayerScenarioSelector.disabled = true;
          that._scenario = that._twoLayerScenarioSelector.value;
          console.log('_scenario = ' + that._scenario);
        }
      });
      this._keySelector.addEventListener('change', function(evt) {
        that._scenarioKey = evt.target.value;
        console.log('_scenarioKey = ' + that._scenarioKey);
        that.scenarioProcessor();
      });
      this._twoLayerScenarioSelector.addEventListener('change', function(evt) {
        that._scenario = evt.target.value;
        console.log('_scenario = ' + that._scenario);
        that.scenarioProcessor();
      });
      this._threeLayerScenarioSelector.addEventListener('change', function(evt) {
        that._scenario = evt.target.value;
        console.log('_scenario = ' + that._scenario);
        that.scenarioProcessor();
      });
      window.addEventListener('keydown', this);
      window.addEventListener('keyup', this);
      window.addEventListener('mozbrowserbeforekeydown', this);
      window.addEventListener('mozbrowserkeydown', this);
      window.addEventListener('mozbrowserbeforekeyup', this);
      window.addEventListener('mozbrowserkeyup', this);
    },
    stop: function hkt_stop() {
      // TODO
    }
  };

  exports.HardwareKeyTester = HardwareKeyTester;
  HardwareKeyTester.start();

}(window));
