var pc_config = {'iceServers':[{'url':'stun:23.21.150.121'}]}
var pc_constraints = {
  'optional': [
    {'RtpDataChannels': true}
  ]};
var serverURL = '127.0.0.1';
var serverPort = 8000;
function error(e) {
  throw e;
}

var PureHTTPPeer = {
  rank: rank, // 'host' or 'guest'
  pc: null,
  dc: null,
  evtSrc: null,
  onsecondarychange: null,
  ondatachannelopened: null,
  get isIdle() {
    return !(this.dc);
  },
  init: function php_init() {
    this.pc && this.pc.close();
    this.evtSrc && this.evtSrc.close();

    this.pc = new RTCPeerConnection(pc_config, pc_constraints);
    this.evtSrc = new EventSource(eventUrl);
    this.evtSrc.addEventListener('secondarychange', this);
    this.evtSrc.addEventListener('icecandidate', this);
    this.evtSrc.addEventListener('requestsession', this);
    this.evtSrc.addEventListener('offer', this);
    this.evtSrc.addEventListener('answer', this);
    this.evtSrc.addEventListener('ping', this);
    this.evtSrc.onerror = error;
    this.evtSrc.onclose = this.reset.bind(this);
    this.pc.onicecandidate = function (e) {
      if (e.candidate == null) {
        return;
      }
      this.serializeSend( {
        roomNum: roomNum,
        candidate: e.candidate,
        event: this.rank + "icecandidate"
      });
      this.pc.onicecandidate = null;
    }.bind(this);
    this.pc.onsignalingstatechange = function() {
    }.bind(this);
  },
  onopen: function php_onopen() {
  },
  handleEvent: function php_ondata(evt) {
    var message = JSON.parse(evt.data);
    switch (evt.type) {
      case 'secondarychange':
        this.rank = 'primary';
        this.log(message.length + ' screens available:' + message);
        this.emit('secondarychange', message.screens);
        break;
      case 'offer':
        this.rank = 'secondary';
        if (this.isIdle) {
          this.gotRemoteOffer(message.data);
        }
        break;
      case 'answer':
        this.gotRemoteAnswer(message.data);
        break;
      case 'ping':
        this.log('Connected to signaling server:' + message.ping);
        break;
      case 'icecandidate':
        this.pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        break;
    }
  },

/////////////////////////////////////
  sendOffer: function php_sendOffer(secondaryId) {
    // create Data channel and set receiver for it
    // (we call onDataChannel manually since it's only triggered on answer side)
    this.onDataChannel({channel: this.pc.createDataChannel("myc")});
    this.pc.createOffer(function(offer) {
      this.pc.setLocalDescription(offer);
      this.serializeSend({
        event: 'offer',
        data: offer,
        roomNum: roomNum,

      });
    }.bind(this), error);
  },
  serializeSend: function php_serializeSend(message) {
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/' + message.event);

    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');


    xhr.send(JSON.stringify(message));
    //xhr.onload = this.log.bind();
  },
  gotRemoteOffer: function php_gotRemoteOffer(offer) {
    this.pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
      this.pc.createAnswer(function(answer) {
        this.pc.setLocalDescription(answer);
        this.serializeSend({
          event: 'answer',
          data: answer,
          roomNum: roomNum
        });
      }.bind(this), error);
    }.bind(this), error);
    this.pc.ondatachannel = this.onDataChannel.bind(this);
  },
  gotRemoteAnswer: function php_gotRemoteAnswer(answer) {
    if (this.rank == 'host') {
      return;
    }
    this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  },

  //////
  onDataChannel: function php_onDataChannel(evt) {
    this.dc = evt.channel;
    this.dc.onmessage = function(evt) {
      this.emit('datachannelreceive', JSON.parse(evt.data));
    }.bind(this);
    this.dc.onopen = this._onDataChannelOpened.bind(this);
    this.dc.onerror = error;
    this.dc.onclose = this.reset.bind(this);
  },
  _onDataChannelOpened: function p_onDataChannelOpened(evt) {
    this.emit('datachannelopen', evt);
  },
  dataChannelSend: function php_send(type, data, id) {
    this.dc.onerror = function(e) {
      console.log("ERROR:" + e);
    };
    this.dc.send(JSON.stringify({
      event: type,
      data: data,
      id: id
    }));
  },
  reset: function php_reset() {
    this.init();
  },
  log: function php_log(message) {
    var div = document.createElement('div');
    div.textContent = message;
    document.body.appendChild(div);
  },
  emit: function php_emit(eventname, data) {
    var cbname = 'on' + eventname;
    if (typeof this[cbname] == 'function' ) {
      this[cbname](data);
    }
  }
}
