(function(window){
  'use strict';
  
  var noop  = function() {};
  var BASE  = 'http://127.0.0.1:31999/api/v1/';

  var UBAPlugin = function(options) {
    options    = options || {};
    this.base  = BASE;
    this.state = void 0;
    this.id    = void 0; // interval id
    this.interval = options.interval    || 1000; // 1 sec for ajax looping
    
    this.onConnected    = options.onConnected || noop; // event for on connection
    this.onUninstalled    = options.onUninstalled || noop; // event for on installation required
    this.onDisconnected = options.onDisconnected || noop; // event for on disconnected
  };

  // connect to api
  UBAPlugin.prototype.connect = function(application_name) {
    function onConnection(err, response) {
      if (response.status != 200) {
        return;
      }
      this.start();
    }

    this._onConnection.call(this, 'GET', this.base + 'connect?app_name=' + application_name, onConnection.bind(this));
  };

  // disconnect from api
  UBAPlugin.prototype.disconnect = function() {
    this.state = false;
    this._onConnection.call(this, 'GET', this.base + 'disconnect', this.onDisconnected);
  };

  // start listening to status, ajax pooling
  UBAPlugin.prototype.start = function() {
    var connection = null;
    function onStart(err, response) {
      var result = void 0;
      var responseMessage = void 0;

      if (err || response.status !== 200 || !response.responseText) {
        console.error(err, response);
        this.onUninstalled();
      }

      try {
        result = JSON.parse(response.responseText);
      } catch(e) {
        console.error(e);
        return;
      }

      responseMessage = result.status.toLowerCase();
      if (this.state && result.connected && responseMessage === 'connected') {
        return;
      }

      // should run interval when the 
      if (responseMessage === 'disconnected'){
        this.onDisconnected();
        this.state = false;
        clearInterval(this.id);
      } else if (responseMessage === 'connected') {
        this.onConnected();
        this.state = true;
        this.id = setInterval(function() {
          connection();
        }.bind(this), this.interval);
      } else {
        console.debug(responseMessage);
      }
    }

    // reuse connection
    connection = this._onConnection.bind(this, 'GET', this.base + 'status', onStart.bind(this));
    connection();
  };

  // private on connection wrapper
  UBAPlugin.prototype._onConnection = function(method, url, cb) {
    var httpRequest       = new XMLHttpRequest();
    httpRequest.onloadend = cb.bind(this, null, httpRequest);
    httpRequest.open(method, url, true);
    httpRequest.send();
  };

  window.UBAPlugin = UBAPlugin;
})(window);
