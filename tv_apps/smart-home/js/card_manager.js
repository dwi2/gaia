/* global evt, Promise, App, Deck, CardStore */
(function(exports) {
  'use strict';

  var CardManager = function() {
  };

  CardManager.prototype = evt({
    HIDDEN_ROLES: ['system', 'input', 'homescreen', 'search'],

    _cardStore: undefined,
    _cardList: [],

    installedApps: {},

    _ready: false,

    _isHiddenApp: function cm_isHiddenApp(role) {
      if (!role) {
        return false;
      }
      return (this.HIDDEN_ROLES.indexOf(role) !== -1);
    },

    _isCardListLoaded: function cm_isCardListLoaded() {
      return this._cardList && this._cardList.length > 0;
    },

    // appEntry is:
    // {
    //   manifestURL: 'app://gallery.gaiamobile.org/manifest.webapp',
    //   entryPoint: '',
    //   name: 'Gallery',
    //   type: 'App'
    // }
    // returns instance of App
    _appEntryToCard: function cm_appEntryToCard(appEntry) {
      return new App({
          nativeApp: this.installedApps[appEntry.manifestURL],
          entryPoint: appEntry.entryPoint,
          name: appEntry.name
        });
    },

    _deckEntryToCard: function cm_deckEntryToCard(deckEntry) {
      // XXX: use fake deck until we have real deck
      return new FakeDeck({
        name: deckEntry.name,
        cachedIconURL: deckEntry.cachedIconURL
      });
    },

    _loadDefaultCardListPromise: undefined,

    _loadDefaultCardList: function cm_loadDefaultCardList() {
      var that = this;
      if (!this._loadDefaultCardListPromise) {
        this._loadDefaultCardListPromise =
          new Promise(function(resolve, reject) {
            var defaultCardListFile = 'js/init.json';
            that._loadFile({
              url: defaultCardListFile,
              responseType: 'json'
            }).then(function onFulfill(config) {
              that._cardList = [];
              config.card_list.forEach(function(cardEntry) {
                switch(cardEntry.type) {
                  case 'App':
                    that._cardList.push(that._appEntryToCard(cardEntry));
                    break;
                  case 'Deck':
                    that._cardList.push(that._deckEntryToCard(cardEntry));
                }
              });
              that._cardStore.saveData('cardList', that._cardList);
              that._loadDefaultCardListPromise = undefined;
              resolve();
            }, function onReject(error) {
              var reason ='request ' + defaultCardListFile + ' got reject ' + error;
              console.log(reason);
              that._loadDefaultCardListPromise = undefined;
              reject(reason);
            });
          });
      }
      return this._loadDefaultCardListPromise;
    },

    _reloadCardListPromise: undefined,

    _reloadCardList: function cm_loadCardList() {
      var that = this;
      if (!this._reloadCardListPromise) {
        this._reloadCardListPromise = new Promise(function(resolve, reject) {
          // load card from datastore
          if (!that._cardStore) {
            that._cardStore = new CardStore();
          }
          that._cardStore.getData('cardList').then(function(cardList) {
            if (cardList) {
              console.log('successfully load cardList from data store');
              console.log(cardList);
              cardList.forEach(function(cardEntry) {
                var card =
                  cardEntry.type === 'App' ? that._appEntryToCard(cardEntry)
                                           : cardEntry;
                that._cardList.push(card);
              });
              that._reloadCardListPromise = undefined;
              resolve();
            } else {
              // no cardList in datastore, load default from config file
              console.log('load cardList from init.json');
              that._reloadCardListPromise = undefined;
              that._loadDefaultCardList().then(resolve, reject);
            }
          });
        });
      }
      return this._reloadCardListPromise;
    },

    _loadFile: function cm_loadIcon(request) {
      return new Promise(function(resolve, reject) {
        var url = request.url;
        var responseType = request.responseType || 'text';

        if (typeof url === 'string') {
          try {
            var xhr = new XMLHttpRequest({mozAnon: true, mozSystem: true});
            xhr.open('GET', url, true);
            xhr.responseType = responseType;
            xhr.onload = function onload(evt) {
              if (xhr.status !== 0 && xhr.status !== 200) {
                reject(xhr.statusText);
              } else {
                resolve(xhr.response);
              }
            };
            xhr.ontimeout = xhr.onerror = function onErrorOrTimeout() {
              reject();
            };

            xhr.send();
          } catch (e) {
            reject(e.message);
          }
        } else {
          reject('invalid request');
        }
      });
    },

    _bestMatchingIcon:
    function cm_bestMatchingIcon(app, manifest, preferredSize) {
      preferredSize = preferredSize || Number.MAX_VALUE;

      var max = 0;
      var closestSize = 0;

      for (var size in manifest.icons) {
        size = parseInt(size, 10);
        if (size > max) {
          max = size;
        }
        if (!closestSize && size >= preferredSize) {
          closestSize = size;
        }
      }

      if (! closestSize) {
        closestSize = max;
      }

      var url = manifest.icons[closestSize];
      if (!url) {
        return;
      }
      if (url.indexOf('data:') === 0 ||
          url.indexOf('app://') === 0 ||
          url.indexOf('http://') === 0 ||
          url.indexOf('https://') === 0) {
        return url;
      }
      if (url.charAt(0) != '/') {
        console.warn('`' + manifest.name + '` app icon is invalid. ' +
                     'Manifest `icons` attribute should contain URLs -or- ' +
                     'absolute paths from the origin field.');
        return '';
      }

      if (app.origin.slice(-1) === '/') {
        return app.origin.slice(0, -1) + url;
      }

      return app.origin + url;
    },

    isReady: function cm_isReady() {
      var that = this;
      return new Promise(function(resolve, reject) {
        if (that._ready) {
          resolve();
        } else {
          reject('CardManager is not ready');
        }
      });
    },

    start: function cm_start() {
      var that = this;
      var appMgmt = navigator.mozApps.mgmt;
      return new Promise(function(resolve, reject) {
        appMgmt.getAll().onsuccess = function onsuccess(event) {
          event.target.result.forEach(function eachApp(app) {
            var manifest = app.manifest;
            if (!app.launch || !manifest || !manifest.icons ||
                that._isHiddenApp(manifest.role)) {
              return;
            }
            that.installedApps[app.manifestURL] = app;
          });

          that._reloadCardList().then(function() {
            that._ready = true;
            resolve();
          });
        };

        appMgmt.oninstall = function(evt) {
          var app = evt.application;
          var manifest = app.manifest || app.updateManifest;
          if (!app.launch || !manifest || !manifest.icons ||
              that._isHiddenApp(manifest.role)) {
            return;
          }

          var message =
            that.installedApps[app.manifestURL] ? 'update' : 'install';
          that.installedApps[app.manifestURL] = app;
          that.fire(message, that.getAppEntries(app.manifestURL));
        };

        appMgmt.onuninstall = function(evt) {
          var app = evt.application;
          if (that.installedApps[app.manifestURL]) {
            delete that.installedApps[app.manifestURL];
            that.fire('uninstall', that.getAppEntries(app.manifestURL));
          }
        };

        console.log('window.cardManager started');
      });
    },

    stop: function cm_stop() {
      var appMgmt = navigator.mozApps.mgmt;
      appMgmt.oninstall = null;
      appMgmt.onuninstall = null;

      this._stopCardStore();
      this.installedApps = {};
      this._ready = false;
    },

    getAppEntries: function cm_getAppEntries(manifestURL) {
      if (!manifestURL || !this.installedApps[manifestURL]) {
        return [];
      }

      var manifest = this.installedApps[manifestURL].manifest ||
        this.installedApps[manifestURL].updateManifest;
      var entryPoints = manifest.entry_points;
      var entries = [];

      if (!entryPoints || manifest.type !== 'certified') {
        entries.push({
          manifestURL: manifestURL,
          entryPoint: '',
          name: manifest.name,
          type: 'App'
        });
      } else {
        for (var entryPoint in entryPoints) {
          if (entryPoints[entryPoint].icons) {
            entries.push({
              manifestURL: manifestURL,
              entryPoint: entryPoint,
              name: entryPoints[entryPoint].name,
              type: 'App'
            });
          }
        }
      }
      return entries;
    },

    launch: function cm_launch(manifestURL, entryPoint) {
      var installedApps = this.installedApps;

      if (!manifestURL || !installedApps[manifestURL] ||
          !installedApps[manifestURL].launch) {
        return false;
      }

      entryPoint = entryPoint || '';
      installedApps[manifestURL].launch(entryPoint);

      return true;
    },

    getEntryManifest: function cm_getEntryManifest(manifestURL, entryPoint) {
      if (!manifestURL || !this.installedApps[manifestURL]) {
        return null;
      }

      var manifest = this.installedApps[manifestURL].manifest ||
        this.installedApps[manifestURL].updateManifest;

      if (entryPoint) {
        var entry_manifest = manifest.entry_points[entryPoint];
        return entry_manifest || null;
      }

      return manifest;
    },

    getIconBlob:
    function cm_getIconBlob(manifestURL, entryPoint, preferredSize) {
      var that = this;
      return new Promise(function(resolve, reject) {
        var entry_manifest = that.getEntryManifest(manifestURL, entryPoint);
        if (!entry_manifest) {
          reject('No manifest');
        }

        var url = that._bestMatchingIcon(
          that.installedApps[manifestURL], entry_manifest, preferredSize);
        if (!url) {
          reject('No url');
        }

        that._loadFile({
          url: url,
          responseType: 'blob'
        }).then(function onFulfill(blob) {
          resolve(blob);
        }, function onReject(error) {
          reject('Error on loading blob of ' + manifestURL);
        });
      });
    },

    getCardList: function cm_getCardList() {
      var that = this;
      return new Promise(function(resolve, reject) {
        if (!that._isCardListLoaded()) {
          that._reloadCardList().then(function() {
            resolve(that._cardList);
          });
        } else {
          resolve(that._cardList);
        }
      });
    }

  });

  exports.CardManager = CardManager;
}(window));
