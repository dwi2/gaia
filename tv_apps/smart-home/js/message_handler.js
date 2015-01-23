'use strict';

/* global ConnectionManager */

(function(exports) {

  var MessageHandler = function() {};

  MessageHandler.prototype = {
    _connectionManager: undefined,

    _home: undefined,

    init: function cm_init(home) {
      this._home = home;
      navigator.mozSetMessageHandler(
                                    'activity', this.handleActivity.bind(this));
      this._connectionManager = new ConnectionManager();
      this._connectionManager.init(['iac-appdeck-channel']);
      this._connectionManager.on('unpin', this.unpin.bind(this));
    },

    pin: function mh_pin(cardEntry) {
      console.log('got pin ' + cardEntry.manifestURL);
      var cm = this._home.cardManager;
      console.log('mode = ' + cm._mode + ', state = ' + cm.state);
      this._home.cardManager.insertCard({
        cardEntry: cardEntry
      });
    },

    unpin: function mh_unpin(data) {
      var home = this._home;
      // XXX: this is extra step, we should remove this step once we were
      // done fixing and refactoring cardManager.removeCard.
      // The reason we need this step here is because cardManager.removeCard
      // only accept card instance as sole parameter.
      var card = home.cardManager.findCardFromCardList(data);
      home.cardManager.removeCard(card);
    },

    handleActivity: function mh_handleActivity(activity) {
      var name = activity.source.name;
      switch(name) {
        case 'pin':
          this.pin(activity.source.data);
          break;
      }
    }
  };

  exports.MessageHandler = MessageHandler;
})(window);
