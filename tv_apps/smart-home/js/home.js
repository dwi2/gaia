'use strict';
/* global CardNavigator, KeyEvent, SelectionBorder */

(function(exports) {

  function $(id) {
    return document.getElementById(id);
  }

  function Home() {}

  Home.prototype = {
    navigableIds: ['search-input'],
    navigableClasses: ['card-thumbnail', 'filter-tab', 'command-button'],

    init: function() {
      var collection = this.getNavigateElements();
      this.cardNavigator = new CardNavigator(collection);
      this.selectionBorder = new SelectionBorder({ multiple: false,
                                                   container: $('main-section'),
                                                   forground: true });

      window.addEventListener('keydown', this.handleKeyEvent.bind(this));

      this.cardNavigator.on('focus', this.handleSelection.bind(this));
      this.cardNavigator.focus();
    },

    handleKeyEvent: function(evt) {
      var key = this.convertKeyToString(evt.keyCode);
      switch (key) {
        case 'up':
        case 'down':
        case 'left':
        case 'right':
          this.cardNavigator.move(key);
      }
    },

    convertKeyToString: function(keyCode) {
      switch (keyCode) {
        case KeyEvent.DOM_VK_UP:
          return 'up';
        case KeyEvent.DOM_VK_RIGHT:
          return 'right';
        case KeyEvent.DOM_VK_DOWN:
          return 'down';
        case KeyEvent.DOM_VK_LEFT:
          return 'left';
        case KeyEvent.DOM_VK_RETURN:
          return 'enter';
        case KeyEvent.DOM_VK_ESCAPE:
          return 'esc';
        case KeyEvent.DOM_VK_BACK_SPACE:
          return 'esc';
        default:// we don't consume other keys.
          return null;
      }
    },

    getNavigateElements: function() {
      var elements = [];
      this.navigableIds.forEach(function(id) {
        var elem = document.getElementById(id);
        if (elem) {
          elements.push(elem);
        }
      });
      this.navigableClasses.forEach(function(className) {
        var elems = document.getElementsByClassName(className);
        if (elems.length) {
          // Change HTMLCollection to array before concatenating
          elements = elements.concat(Array.prototype.slice.call(elems));
        }
      });
      return elements;
    },

    handleSelection: function(elem) {
      if (elem.nodeName) {
        this.selectionBorder.select(elem);
      } else {
        this.selectionBorder.selectRect(elem);
      }
    }
  };

  exports.Home = Home;
}(window));

window.home = new Home();
window.home.init();
