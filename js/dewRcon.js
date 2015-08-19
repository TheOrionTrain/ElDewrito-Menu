var dewRcon,
	dewRconConnected = false,
	snacking = 0,
	played = 0,
	port = 11776;
jQuery(function() {
	if(getURLParameter('offline') !== "1") {
		StartRconConnection();
	}
});
StartRconConnection = function() {
    dewRcon = new dewRconHelper();
    dewRcon.dewWebSocket.onopen = function() {
        $.snackbar({content:'Connected!'});
		$('#notification')[0].currentTime = 0;
		$('#notification')[0].play();
        dewRconConnected = true;
				loadSettings(Object.keys(settings).length);
    };
    dewRcon.dewWebSocket.onerror = function() {
		if(!snacking) {
			$.snackbar({content:'Not connected. Is the game running?'});
			port = port == 11776 ? (port == 11764 ? 11776 : 11764) : 11776;
			console.log(port);
			if(!played) {
				$('#notification')[0].currentTime = 0;
				$('#notification')[0].play();
				played = 1;
			}
			snacking = 1;
			setTimeout(function() {
				snacking = 0;
			},9000);
		}
        dewRconConnected = false;
        if(!dewRconConnected){
    		setTimeout(StartRconConnection, 1000);
	}
    };
    dewRcon.dewWebSocket.onmessage = function(message) {
        dewRcon.lastMessage = message.data;
				if (dewRcon.lastMessage.toLowerCase().contains('unable to connect to server') || dewRcon.lastMessage.toLowerCase().contains('host not found')) {
					$('#loading').hide();
					$('#black').hide();
					backButton.appendTo('body');
					$.snackbar({
						content: 'Failed to connect to server.'
					});
					$('#notification')[0].currentTime = 0;
					$('#notification')[0].play();
				}
				//console.log(dewRcon.lastMessage);
    };
}
dewRconHelper = function() {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    this.dewWebSocket = new WebSocket('ws://127.0.0.1:' + port, 'dew-rcon');
    this.lastMessage = "";
    this.lastCommand = "";
    this.open = false;
    this.send = function(command) {
        this.dewWebSocket.send(command);
        this.lastCommand = command;
    }
}

function after(ms, fn){ setTimeout(fn, ms); }
