var matchmakingServer,
	matchmakingServerConnected = false,
	snacking = 0,
	played = 0;

StartMatchmakingConnection = function() {
    matchmakingServer = new matchmakingServerHelper();
    matchmakingServer.matchmakingServerSocket.onopen = function() {
        matchmakingServerConnected = true;
    };
	
	matchmakingServer.matchmakingServerSocket.onclose = function() {
        $.snackbar({content:'Lost Connection to Matchmaking Server'});
		$('#notification')[0].currentTime = 0;
		$('#notification')[0].play();
        matchmakingServerConnected = false;
    };
	
    matchmakingServer.matchmakingServerSocket.onerror = function() {
		if(!snacking) {
			$.snackbar({content:'Connection to Matchmaking Server failed, retrying.'});
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
        matchmakingServerConnected = false;
        if(!matchmakingServerConnected) {
    		setTimeout(StartMatchmakingConnection, 1000);
		}
    };
	
    matchmakingServer.matchmakingServerSocket.onmessage = function(message) {
		try {
			var result = JSON.parse(JSON.stringify(eval('(' + message.data + ')')));
			switch (result.type) {
				case "disconnected":
					
				break;
				default:
					console.log("Unhandled packet: " + result.type);
				break;
			}
		} catch (e) {
			console.log(e);
			console.log(message.data);
		}

		if (typeof matchmakingServer.callback == 'function')
			matchmakingServer.callback(message.data);
        matchmakingServer.lastMessage = message.data;
    };
}
function startSearch(playlist) {
	console.log(playlist);
	$("#search").empty();
	for (var i = 0; i < party.length; i++) {
		var isDev = (developers.indexOf(party[i].split(':')[1]) >= 0) ? "developer" : "";
		addPlayer("#search", party[i], isDev);
	}
	for (var i = 0; i < (8 - party.length); i++) {
		addPlayer("#search", "Looking for player...:000000", "", 0.6);
	}
	
	matchmakingServer.send(JSON.stringify({
		type: "search",
		players: party
	}));
}

matchmakingServerHelper = function() {
    window.WebSocket2 = window.WebSocket2 || window.MozWebSocket2;
    this.matchmakingServerSocket = new WebSocket('ws://127.0.0.1:55555/matchmakingServer', 'matchmakingServer');
    this.lastMessage = "";
    this.lastCommand = "";
    this.open = false;
	this.callback = {};
    this.send = function(command, cb) {
		this.callback = cb;
        this.matchmakingServerSocket.send(command);
        this.lastCommand = command;
    }
}