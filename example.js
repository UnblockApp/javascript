$(document).ready(function() {
  var elm = $('#uba');
  var installationElement = $('<button>Install</button>');
  var disconnectElement   = $('<button>Disconnect</button>');
  var connectElement      = $('<button>Connect</button>');
  var initialElement      = $('<button>Connecting..</button>');

  var uba = new window.UBAPlugin({
    onConnected: function(){
      elm.html(disconnectElement);
    },
    onInstalled: function(){
      elm.html(installationElement);
      // go to download link
    },
    onDisconnected: function(){
      elm.html(connectElement);
    }
  });

  installationElement.click(function() {
    uba.install();
  });

  disconnectElement.click(function() {
    uba.disconnect();
  });

  connectElement.click(function() {
    uba.connect(123);
  });

  elm.html(initialElement);

  uba.start();
});
