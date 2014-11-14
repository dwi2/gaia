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

    _appDeckGridViewElem: document.getElementById('app-deck-grid-view'),

    _appDeckListScrollable: undefined,

    init: function ad_init() {
      var that = this;
      Applications.init(function() {
        var apps = Applications.getAllAppEntries();
        var appGridElements = apps.map(that._createAppGridElement.bind(that));
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

      var ICON_SIZE_VIEWPORT_WIDTH_RATIO = 10;
      // XXX: width of container is 10vw, so the best fit icon will be
      // viewport size * (10/100) if viewport is not scalable. However this
      // value is subject to change once UX spec has definition on it.
      var bestFitIconSize =
        Math.max(window.innerWidth, window.innerHeight) /
        ICON_SIZE_VIEWPORT_WIDTH_RATIO;
      Applications.getIconBlob(
        app.manifestURL, app.entryPoint, bestFitIconSize, function(blob) {
          var iconURL = URL.createObjectURL(blob);
          // XXX: make sure to revoke iconURL once it is no longer needed.
          // For example, icon is changed or app is uninstalled
          container.dataset.iconURL = iconURL;
          container.style.backgroundImage =
            'url("' + iconURL + '")';
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
      console.log(appDeck.handleKeyEvent.caller);
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
      if (key) {
        if (focused instanceof XScrollable) {
          if (focused.spatialNavigator.move(key)) {
            return;
          }
        }
        this._spatialNavigator.move(key);
      }
    }
  };

  exports.appDeck = new AppDeck();
  exports.appDeck.init();

}(window));
