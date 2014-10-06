/* global Promise */

(function(exports) {
  'use strict';

  var CardStore = function() {
    var that = this;
    navigator.mozApps.getSelf().onsuccess = function(evt) {
      var app = evt.target.result;
      that._manifestURL = app.manifestURL;
      that._getStore();
    }
  };

  CardStore.prototype = {
    STORE_NAME: 'home_cards',

    _dataStore: undefined,

    _appRevisionId: undefined,

    _manifestURL: undefined,

    isStarted: function cs_isStarted() {
      return !!this._manifestURL && !!this._dataStore;
    },

    _onChange: function cs_onChange(evt) {
      console.log('id = ' + evt.id);
      console.log('operation = ' + evt.operation);
      // TODO
    },

    _getStorePromise: undefined,

    _getStore: function cs_getStore() {
      var that = this;
      if (!this._getStorePromise) {
        // we cache promise for chaining upcoming request until promise resolved
        this._getStorePromise = new Promise(function(resolve, reject) {
          if (that.isStarted()) {
            console.log('return cached _dataStore');
            that._getStorePromise = undefined;
            resolve(that._dataStore);
            return;
          }
          console.log('isStarted? ' + that.isStarted());
          navigator.getDataStores(that.STORE_NAME).then(
          function(stores) {
            stores.forEach(function(store) {
              if (store.owner === that._manifestURL) {
                that._dataStore = store;
                console.log('register onchange event');
                store.onchange = that._onChange;
              }
            });
            if (that._dataStore) {
              that._getStorePromise = undefined;
              resolve(that._dataStore);
            } else {
              that._getStorePromise = undefined;
              reject();
            }
          });
        });
      }
      return this._getStorePromise;
    },

    getData: function cs_getData(id) {
      var that = this;
      return new Promise(function(resolve, reject) {
        that._getStore().then(function onFulfill(store) {
          if (store) {
            store.get(id).then(resolve);
          } else {
            reject('no store available');
          }
        }, function onReject(reason) {
          reject(reason);
        });
      });
    },

    saveData: function cs_saveData(id, data) {
      var that = this;
      return new Promise(function(resolve, reject) {
        that._getStore().then(function onFulfill(store) {
          if (store) {
            console.log('put [' + id + '] data');
            store.put(data, id).then(resolve);
          } else {
            reject('no store available');
          }
        }, function onReject(reason) {
          reject(reason);
        });
      });
    }
  };

  exports.CardStore = CardStore;

}(window));
