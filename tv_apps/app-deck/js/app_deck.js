/* global SpatialNavigator, SharedUtils, Applications, URL */

(function(exports) {
  'use strict';

  var AppDeck = function() {
  };

  AppDeck.prototype = {
    _navigableElements: [],

    _spatialNavigator: undefined,

    _selectionBorder: undefined,

    _focusElem: undefined,

    _appDeckGridViewElem: undefined,

    _appDeckListScrollable: undefined,

    init: function ad_init() {
      var that = this;
      Applications.init(function() {
        var apps = Applications.getAllAppEntries();
        var appGridElements = apps.map(that._createAppGridElement.bind(that));
        that._appDeckGridViewElem =
          document.getElementById('app-deck-grid-view');
        appGridElements.forEach(function(appGridElem) {
          that._appDeckGridViewElem.appendChild(appGridElem);
        });
        that._appDeckListScrollable = new XScrollable({
          frameElem: 'app-deck-list-frame',
          listElem: 'app-deck-list',
          items: 'app-banner'
        });
        that._navigableElements =
          SharedUtils.nodeListToArray(document.querySelectorAll('.navigable'))
            .concat(appGridElements);
        that._navigableElements.unshift(that._appDeckListScrollable);
        that._spatialNavigator = new SpatialNavigator(that._navigableElements);
        that._selectionBorder = new SelectionBorder({
            multiple: false,
            container: document.getElementById('main-section'),
            forground: true });

        window.addEventListener('keydown', that);
        that._spatialNavigator.on('focus', that.handleFocus.bind(that));
        that._appDeckListScrollable.on('focus', function(scrollable, elem) {
          that._selectionBorder.select(elem, scrollable.getItemRect(elem));
          that._focusElem = elem;
        });
        that._spatialNavigator.focus();
      });
    },

    _createAppGridElement: function ad_createAppGridElement(app) {
      // <div class="app navigable">
      //   <div class="app-name">
      //     <span class="app-name-text">App1</span>
      //   </div>
      // </div>
      var container = document.createElement('div');
      var appNameElem = document.createElement('div');
      var appNameTextElem = document.createElement('div');

      container.className = 'app navigable';
      container.dataset.manifestURL = app.manifestURL;
      appNameElem.className = 'app-name';
      appNameTextElem.className = 'app-name-text';
      appNameTextElem.textContent = app.name;

      appNameElem.appendChild(appNameTextElem);
      container.appendChild(appNameElem);

      // XXX: width of container is 10vw, so the best fit icon will be
      // screensize * (10/100) = 1920 * 10/100
      Applications.getIconBlob(
        app.manifestURL, app.entryPoint, 200, function(blob) {
          container.style.backgroundImage =
            'url("' + URL.createObjectURL(blob) + '")';
        });
      return container;
    },

    handleFocus: function ad_handleFocus(elem) {
      if (elem instanceof XScrollable) {
        elem.spatialNavigator.focus(elem.spatialNavigator.getFocusedElement());
      } else if (elem.nodeName) {
        this._selectionBorder.select(elem);
        this._focusElem = elem;
      } else {
        this._selectionBorder.selectRect(elem);
      }
    },

    handleEvent: function ad_handleEvent(evt) {
      switch(evt.type) {
        case 'keydown':
          this.handleKeyEvent(evt);
          break;
      }
    },

    handleKeyEvent: function ad_handleKeyEvent(evt) {
      var key;
      var focused = this._spatialNavigator.getFocusedElement();
      switch(evt.key) {
        case 'Down':
        case 'ArrowDown':
          key = 'down';
          break;
        case 'Up':
        case 'ArrowUp':
          key = 'up';
          break;
        case 'Right':
        case 'ArrowRight':
          key = 'right';
          break;
        case 'Left':
        case 'ArrowLeft':
          key = 'left';
          break;
      }
      console.log('key = ' + key);
      if (key) {
        if (focused instanceof XScrollable) {
          console.log('move inside scrollable');
          if (focused.spatialNavigator.move(key)) {
            return;
          }
        }
        console.log('move between element');
        this._spatialNavigator.move(key);
      }
    }
  };

  exports.appDeck = new AppDeck();
  exports.appDeck.init();

}(window));
