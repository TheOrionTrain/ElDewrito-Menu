var dewRcon,
	dewRconConnected = false,
	snacking = 0,
	played = 0;
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
		loadSettings();
    };
    dewRcon.dewWebSocket.onerror = function() {
		if(!snacking) {
			$.snackbar({content:'Not connected. Is the game running?'});
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
				console.log(dewRcon.lastMessage);
    };
}
dewRconHelper = function() {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    this.dewWebSocket = new WebSocket('ws://127.0.0.1:11776', 'dew-rcon');
    this.lastMessage = "";
    this.lastCommand = "";
    this.open = false;
    this.send = function(command) {
        this.dewWebSocket.send(command);
        this.lastCommand = command;
    }
}

function after(ms, fn){ setTimeout(fn, ms); }
