/**
 *
 *
 *
 *
 **/



var friendServer,
	friendServerConnected = false,
	snacking = 0,
	played = 0,
	pname,
	puid,
	colour = "#000000",
	onlinePlayers = {},
	party = [],
	player = null,
	developers = [];
/*jQuery(function() {
	if(getURLParameter('offline') !== "1" && dewRconConnected) {
		StartConnection();
	}
});*/

StartConnection = function() {
    friendServer = new friendServerHelper();
    friendServer.friendsServerSocket.onopen = function() {
		friendServer.send(JSON.stringify({'type':'developers'}));
		
		dewRcon.send('player.name', function(name) {
			dewRcon.send('player.printUID', function(uid) {
				dewRcon.send('Player.Colors.Primary', function(col) {
					pname = name;
					puid = uid.split(' ')[2];
					colour = col;
					
					player = {
						name: pname,
						guid: puid,
						id: null,
						colour: colour,
						rank: 0
					};

					friendServer.send(JSON.stringify({
						type: "connection",
						message: " has connected.",
						player: player
					}));

					party = [];
					party.push(player);
					loadParty();
					
					StartMatchmakingConnection();
				});
			});
		});
        $.snackbar({content:'Connected to Friend Server!'});
		Audio.notification.currentTime = 0;
		Audio.notification.play();
        friendServerConnected = true;
    };
	friendServer.friendsServerSocket.onclose = function() {
        $.snackbar({content:'Lost Connection to Friend Server'});
		Audio.notification.currentTime = 0;
		Audio.notification.play();
        friendServerConnected = false;
    };
    friendServer.friendsServerSocket.onerror = function() {
		if(!snacking) {
			$.snackbar({content:'Connection to Friend Server failed, retrying.'});
			if(!played) {
				Audio.notification.currentTime = 0;
				Audio.notification.play();
				played = 1;
			}
			snacking = 1;
			setTimeout(function() {
				snacking = 0;
			},9000);
		}
        friendServerConnected = false;
        if(!friendServerConnected) {
    		setTimeout(StartConnection, 1000);
		}
    };
    friendServer.friendsServerSocket.onmessage = function(message) {
		if (typeof friendServer.callback == 'function')
			friendServer.callback(message.data);
		friendServer.lastMessage = message.data;
		
		try {
			var result = JSON.parse(JSON.stringify(eval('(' + message.data + ')')));
			switch (result.type) {
				case "disconnected":
					if ($.inArray(result.player + ":" + result.guid, friends) != -1 || $.inArray(result.player, friends) != -1) {
						if(Chat.isOpen(result.player)) {
							$('.chat-window[data-player="'+sanitizeString(result.player)+'"]').append("<span class='chat-message alert'>" + sanitizeString(result.player) + " has gone offline.</span>");
							$('.chat-window[data-player="'+sanitizeString(result.player)+'"]').scrollTop($('.chat-window[data-player="'+sanitizeString(result.player)+'"]')[0].scrollHeight);
						}
					}

					if ($.inArray(result.player + ":" + result.guid + ":" + getPlayerColour(result.guid), party) != -1 && party.length > 1) {
						if (Chat.isOpen("Party Chat - " + party[0].name)) {
							$('.chat-window[data-player="' + "Party Chat - " + party[0].name + '"]').append("<span class='chat-message alert'>" + sanitizeString(result.player) + " has gone offline.</span>");
							if (party[0].name == result.player)
								$('.chat-window[data-player="' + "Party Chat - " + party[0].name + '"]').append("<span class='chat-message alert'>" + party[1].name + " is the new party leader.</span>");
							$('.chat-window[data-player="' + "Party Chat - " + party[0].name + '"]').scrollTop($('.chat-window[data-player="' + "Party Chat - " + party[0].name + '"]')[0].scrollHeight);
							if (party[0].name == result.player) {
								Chat.destroyTab(result.player);
								if ((party.length - 1) > 1)
									Chat.createTab(party[1].name);
							}
						}

						party = $.grep(party, function(value) {
						  return value.guid != result.player.guid;
						});

						for (var i = 0; i < party.length; i++) {
							friendServer.send(JSON.stringify({
								type: "updateparty",
								party: JSON.stringify(party),
								guid: party[i].guid
							}));

							if (party[0].guid == puid)
								continue;

							friendServer.send(JSON.stringify({
								type: "notification",
								message: result.player + " has left the party.",
								guid: party[i].guid
							}));
						}

						if (party[0].guid == puid) {

							$.snackbar({content: result.player + ' has left your party.'});
							Audio.notification.currentTime = 0;
							Audio.notification.play();

						}

						loadParty();
					}
				break;
				case "pm":
					/*dewRcon.send('game.info', function(resp) {
						var res = new Array();
						resp = resp.split('\n');
						for (var i = 0; i < resp.length; i++) {
							res[resp[i].split(': ')[0].replaceAll(" ", "")] = resp[i].split(': ')[1];
						}
						if (typeof res.CurrentMap == 'undefined' || res.CurrentMap == "mainmenu")
							Chat.receiveMessage(result.player, result.player + ": " + result.message);
						else
							dewRcon.send('irc.chatmessage "<' + result.player + '> "' + result.message);
					});*/
					if ($.inArray(result.player + ":" + result.senderguid, friends) == -1 && $.inArray(result.player, friends) == -1)
						return;
					Chat.receiveMessage(sanitizeString(result.player), sanitizeString(result.player) + ": " + sanitizeString(result.message));
					console.log(sanitizeString(result.player) + ": " + sanitizeString(result.message));
				break;
				case "partyinvite":
					dewAlert({
						title: "Party Invitation",
						content: sanitizeString(result.player) + " has invited you to a party",
						info: result.senderguid,
						cancel: true,
						cancelText: "Decline",
						callback: partyInvite
					});
				break;
				case "gameinvite":
					dewAlert({
						title: "Game Invitation",
						content: result.player + " has invited you join " + result.server,
						cancel: true,
						cancelText: "Decline",
						callback: gameInvite
					});
				break;
				case "acceptparty":
					$.snackbar({content: result.player + ' has joined your party.'});
					Audio.notification.currentTime = 0;
					Audio.notification.play();

					party.push(result.player + ":" + result.pguid + ":" + result.colour);

					for (var i = 0; i < party.length; i++) {
						friendServer.send(JSON.stringify({
							type: "updateparty",
							party: JSON.stringify(party),
							guid: party[i].guid
						}));

						if (party[i].guid == result.pguid || party[i].guid == puid)
							continue;

						friendServer.send(JSON.stringify({
							type: "notification",
							message: result.player + " has joined the party.",
							guid: party[i].guid
						}));
					}

					loadParty();
				break;
				case "acceptgame":

				break;
				case "rank":
					console.log(result);
					player.rank = parseInt(result.rank);
					loadParty();
				break;
				case "connect":
					if (party[0].guid != result.guid)
						return;
					
					jumpToServer(result.address);
					setTimeout(function() {
						startgame(result.address, 'JOIN GAME'.split(' '), result.password);
					}, 500);
				break;
				case "notification":
					$.snackbar({content: result.message});
					Audio.notification.currentTime = 0;
					Audio.notification.play();
				break;
				case "updateparty":
					if ($.inArray(result.player + ":" + result.guid, party) == -1) {
						
					}
						
					party = JSON.parse(result.party);
					loadParty();
					if(!Chat.isOpen("Party Chat - " + party[0].name) && party.length > 1) {
						Chat.createTab("Party Chat - " + party[0].name);
						Chat.showBox();
					}
				break;
				case "updateplayers":
					onlinePlayers = JSON.parse(result.players);
					updateFriends();
					loadFriends();
				break;
				case "partymessage":
					if ($.inArray(result.player + ":" + result.senderguid + ":" + getPlayerColour(result.senderguid), party) == -1)
						return;
					var lead = party[0].name;
					if(result.player == lead) {
						Chat.receiveMessage("Party Chat - " + lead, result.player + ": " + result.message,1);
					} else {
						Chat.receiveMessage("Party Chat - " + lead, result.player + ": " + result.message);
					}
				break;
				case "developers":
					developers = result.developers;
				break;
				default:
					console.log("Unhandled packet: " + result.type);
				break;
			}
		} catch (e) {
			console.log(e);
			console.log(message.data);
		}
    };
}

function partyInvite(accepted, guid) {
	console.log(guid);
	if (accepted && party.length < 2) {
		friendServer.send(JSON.stringify({
			type: 'acceptparty',
			player: pname,
			guid: guid,
			pguid: puid,
			colour: colour
		}));
	} else if (party.length > 1) {
		$.snackbar({content: "You are already in a party."});
		Audio.notification.currentTime = 0;
		Audio.notification.play();
	}
	console.log(accepted);
}

function gameInvite(accepted, guid) {
	if (accepted) {
		friendServer.send({
			type: 'acceptgame',
			player: pname,
			guid: puid
		});
	}
	console.log(accepted);
}

friendServerHelper = function() {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    this.friendsServerSocket = new WebSocket('ws://127.0.0.1:55555/friendServer', 'friendServer');
    this.lastMessage = "";
    this.lastCommand = "";
	this.callback = {};
    this.send = function(command, cb) {
		this.callback = cb;
        this.friendsServerSocket.send(command);
        this.lastCommand = command;
    }
}