'use strict';

/* global evt, CardNavigator */
(function(exports) {

  function XScrollable(frameElem, listElem, items) {
    this.translateX = 0;
    this.scrollEdgeOffset = 20;
    this.frameElem = (typeof frameElem == 'string') ?
                          document.getElementById(frameElem) : frameElem;
    this.listElem = (typeof listElem == 'string') ?
                          document.getElementById(listElem) : frameElem;
    this.items = Array.prototype.slice.call(
        (typeof items == 'string') ? document.getElementsByClassName(items) :
                                     Array.prototype.slice.call(items));

    var defaultItem = this.listElem.dataset.defaultItem;
    this.cardNavigator = new CardNavigator(this.items);
    this.cardNavigator.focus(
              this.items.length > defaultItem ? this.items[defaultItem] : null);
    this.cardNavigator.on('focus', this.handleSelection.bind(this));
  }

  XScrollable.prototype = evt({
    CLASS_NAME: 'XScrollable',
    getItemRect: function(elem) {
      var frameRect = this.frameElem.getBoundingClientRect();
      return {
        left: frameRect.left + elem.offsetLeft + this.translateX,
        top: frameRect.top + elem.offsetTop,
        width: elem.offsetWidth,
        height: elem.offsetHeight
      };
    },

    getBoundingClientRect: function() {
      return this.frameElem.getBoundingClientRect();
    },

    scrollTo: function(elem) {
      this.translateX = this._getScrollOffset(elem);
      this.listElem.style.transform =
                          'translateX(' + this.translateX + 'px)';
    },

    _getScrollOffset: function(elem) {
      var sibling;
      var offsetRight = elem.offsetLeft + elem.offsetWidth;
      var frameWidth = this.frameElem.offsetWidth;
      if (elem.offsetLeft + this.translateX <= 0) {
        sibling = this.getPrevItem(elem);
        if (sibling) {
          return -(sibling.offsetLeft + 0.5 * sibling.offsetWidth);
        } else {
          return -(elem.offsetLeft - this.scrollEdgeOffset);
        }
      } else if (offsetRight > (frameWidth - this.translateX)) {
        sibling = this.getNextItem(elem);
        if (sibling) {
          return frameWidth - (sibling.offsetLeft + 0.5 * sibling.offsetWidth);
        } else {
          return frameWidth - (offsetRight + this.scrollEdgeOffset);
        }
      } else {
        return this.translateX;
      }
    },

  getNextItem: function(elem) {
      var iter = elem;
      while (iter.parentElement != this.listElem) {
        iter = iter.parentElement;
      }
      return iter.nextElementSibling ?
        iter.nextElementSibling.getElementsByClassName(elem.className)[0] :
        null;
    },

    getPrevItem: function(elem) {
      var iter = elem;
      while (iter.parentElement != this.listElem) {
        iter = iter.parentElement;
      }
      return iter.previousElementSibling ?
        iter.previousElementSibling.getElementsByClassName(elem.className)[0] :
        null;
    },

    handleSelection: function(elem) {
      this.scrollTo(elem);
      this.fire('focus', this, elem);
    }
  });
  exports.XScrollable = XScrollable;
})(window);
