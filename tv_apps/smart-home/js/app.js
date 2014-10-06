(function(exports) {
  'use strict';

  var App = function(options) {
    this.nativeApp = options.nativeApp;
    this.entryPoint = options.entryPoint;
    this.name = options.name;
    // XXX: only cached one size for now
    this.cachedIconBlob = undefined;
    this.cachedIconURL = options.cachedIconURL;
  };

  App.prototype = Object.create(Card.prototype);

  App.prototype.constructor = App;

  App.prototype.CLASS_NAME = 'App';

  // expose getter of property of nativeApp
  var exposedPropertyNames = ['manifest', 'updateManifest'];
  exposedPropertyNames.forEach(function(propertyName) {
    Object.defineProperty(App.prototype, propertyName, {
      get: function() {
        return this.nativeApp && this.nativeApp[propertyName];
      }
    });
  });

  App.prototype.launch = function app_launch(args) {
    if (this.nativeApp && this.nativeApp.launch) {
      this.nativeApp.launch(args);
    }
  };

  exports.App = App;
}(window));
