(function(exports) {
  var InProcFrame = function () {
  };

  InProcFrame.prototype = {
    _eventDashboardElem: undefined,
    start: function() {
      this._eventDashboardElem = document.getElementById('event-dashboard');
      window.addEventListener('keyup', this);
      window.addEventListener('keydown', this);
      console.log('InProcFrame started!');
      return this;
    },
    stop: function() {

    },
    _clearDashboardTimer: undefined,
    _clearDashboard: function() {
      if (this._eventDashboardElem) {
        this._eventDashboardElem.textContent = '';
      }
      this._clearDashboardTimer = undefined;
    },
    _display: function(content) {
      if (this._eventDashboardElem) {
        this._eventDashboardElem.textContent = content;
        if (this._clearDashboardTimer) {
          window.clearTimeout(this._clearDashboardTimer);
          this._clearDashboardTimer = undefined;
        }
        this._clearDashboardTimer =
          window.setTimeout(this._clearDashboard.bind(this), 1500);
      }
    },
    handleEvent: function(evt) {
      var key;
      console.log('got event!');
      if (evt.type === 'keyup' || evt.type === 'keydown') {
        key = evt.key.toLowerCase();
        this._display(evt.type + ': ' + evt.key);
        console.log(evt.type + ': ' + evt.key);
      } else {
        this._display(evt.type);
        console.log(evt.type);
      }
    }
  };

  exports.inProcFrame = new InProcFrame().start();
}(window));
