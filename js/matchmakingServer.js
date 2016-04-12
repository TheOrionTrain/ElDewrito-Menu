var matchmakingServer,
	matchmakingServerConnected = false,
	snacking = 0,
	played = 0;

StartMatchmakingConnection = function() {
    matchmakingServer = new matchmakingServerHelper();
    matchmakingServer.matchmakingServerSocket.onopen = function() {
		matchmakingServer.send(JSON.stringify({
			type: "connection",
			message: " has connected.",
			player: {
				name: pname,
				guid: puid,
				colour: colour,
				rank: 0
			},
		}));
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
				case "updatesearch":
					console.log(result);
					$("#search").empty().append('<tr class="top"><td class="info" colspan="2">Searching...</td></tr>');
					var isDev = (developers.indexOf(puid) >= 0) ? "developer" : "";
					addPlayer("search", {
						name: pname,
						guid: puid,
						colour: colour,
						rank: 0
					}, isDev);
					for (var i = 0; i < result.players.length; i++) {
						var isDev2 = (developers.indexOf(result.players[i].guid) >= 0) ? "developer" : "";
						if (result.players[i].guid != puid)
							addPlayer("search", result.players[i], isDev2);
					}
					for (var i = 0; i < (8 - result.players.length); i++) {
						addPlayer("search", {
							name: "Looking for player...",
							guid: "000000",
							colour: "#BDBDBD",
							rank: 0
						}, null, 0.6);
					}
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
	$("#search").empty().append('<tr class="top"><td class="info" colspan="2">Searching...</td></tr>');
	for (var i = 0; i < party.length; i++) {
		var isDev = (developers.indexOf(party[i].split(':')[1]) >= 0) ? "developer" : "";
		addPlayer("search", {
			name: party[i].split(':')[0],
			guid: party[i].split(':')[1],
			colour: party[i].split(':')[2],
			rank: 0,
		}, isDev);
	}
	for (var i = 0; i < (8 - party.length); i++) {
		addPlayer("search", {
			name: "Looking for player...",
			guid: "000000",
			colour: "#BDBDBD",
			rank: 0
		}, null, 0.6);
	}

	matchmakingServer.send(JSON.stringify({
		type: "search",
		playlist: playlist,
		players: [
			{
				name: pname,
				guid: puid,
				colour: colour,
				rank: 0
			}
		]
	}));
}

matchmakingServerHelper = function() {
    window.WebSocket2 = window.WebSocket2 || window.MozWebSocket2;
    this.matchmakingServerSocket = new WebSocket('ws://182.239.201.24:55555/matchmakingServer', 'matchmakingServer');
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
