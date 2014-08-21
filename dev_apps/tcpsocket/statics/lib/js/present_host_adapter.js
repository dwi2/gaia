var PresentHostAdapter = {
  channelPeer: PureHTTPPeer,
  presentWindows: {},
  init: function() {
    this.channelPeer.init();
    this.channelPeer.ondatachannelreceive = this.handleDCEvent.bind(this);
    window.addEventListener("message", this.handleWindowEvent.bind(this));

  },

  handleWindowEvent: function pha_handleWindowEvent(evt) {
    console.log("EVTTTTTTTTTT" + evt.type);
    switch(evt.type) {
      case 'message':
        var message = evt.data;
        switch(message.event) {
          case 'presentoffer':
            //  @event presentoffer : {
            //    event: 'presentoffer'
            //    data: offer SDP from presenter
            //    url: URL/id of presenter
            //  }
            this.channelPeer.dataChannelSend('presentoffer', message.data, message.id);
            break;
          case 'closesession':
            if (!this.presentWindows[message.id]) {
              break;
            }
            this.presentWindows[message.id].close();
            delete this.presentWindows[evt.data.id];
            break;
        }
        break;
    }
  },
  handleDCEvent: function pha_onDataChannelReceive(message) {
    switch(message.event) {
      case 'opensession':
        // @event opensession: {
        //   event: 'opensession',
        //   data: [  URL for window to be opened]
        // }
        this.presentWindows[message.data] = new PresentWindow(message.data);
        break;
      case 'presentanswer':
        //  @event presentanswer: {
        //    event: 'presentanswer'
        //    data: answer SDP from remote client side
        //    id: URL/id of presenter
        //  }
        //  Just transfer it to presentWindow
        this.presentWindows[message.id]._handleMessage({data: message});
        break;
    }
  }

};

function PresentWindow(url) {
  // TODO: open window by OOP.
  this.frame = document.createElement('iframe');
  this.id = url;
  this.frame.src = url;
  document.body.appendChild(this.frame);
  // @event initpresent: {
  //   event: 'initpresent',
  //   data: URL for window to be opened
  // }
  this.frame.onload = function() {
    this.frame.contentWindow.postMessage({event: 'initpresent', id: this.id}, '*');
  }.bind(this);
}

PresentWindow.prototype = {
  _handleMessage: function ps_handleMessage(evt) {
  var message = evt.data;
  if (!message) {
    return;
  }
    switch(message.event) {

    case 'presentanswer':
      this.frame.contentWindow.postMessage({
          event: 'presentanswer',
          data: message.data,
          id: message.id}, '*');
      break;
    };
  },
  close: function ps_close() {
    this.frame.parentElement.removeChild(this.frame);
  }
}

PresentHostAdapter.init();
