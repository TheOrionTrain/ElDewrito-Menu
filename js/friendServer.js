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
	developers = [];
/*jQuery(function() {
	if(getURLParameter('offline') !== "1" && dewRconConnected) {
		StartConnection();
	}
});*/

StartConnection = function() {
    friendServer = new friendServerHelper();
    friendServer.friendsServerSocket.onopen = function() {
		dewRcon.send('player.name', function(name) {
			dewRcon.send('player.printUID', function(uid) {
				dewRcon.send('Player.Colors.Primary', function(col) {
					pname = name;
					puid = uid.split(' ')[2];
					colour = col;

					friendServer.send(JSON.stringify({
						type: "connection",
						message: " has connected.",
						guid: uid.split(' ')[2],
						player: name,
						colour: col
					}));

					party = [];
					party.push(name + ":" + uid.split(' ')[2] + ":" + col);
					loadParty();
				});
			});
		});
        $.snackbar({content:'Connected to Friend Server!'});
		$('#notification')[0].currentTime = 0;
		$('#notification')[0].play();
        friendServerConnected = true;
		$.getJSON("http://thefeeltra.in/developers.json", function(json) {
			developers = json;
		});
		StartMatchmakingConnection();
    };
	friendServer.friendsServerSocket.onclose = function() {
        $.snackbar({content:'Lost Connection to Friend Server'});
		$('#notification')[0].currentTime = 0;
		$('#notification')[0].play();
        friendServerConnected = false;
    };
    friendServer.friendsServerSocket.onerror = function() {
		if(!snacking) {
			$.snackbar({content:'Connection to Friend Server failed, retrying.'});
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
        friendServerConnected = false;
        if(!friendServerConnected) {
    		setTimeout(StartConnection, 1000);
		}
    };
    friendServer.friendsServerSocket.onmessage = function(message) {
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
						if (Chat.isOpen("Party Chat - " + party[0].split(':')[0])) {
							$('.chat-window[data-player="' + "Party Chat - " + party[0].split(':')[0] + '"]').append("<span class='chat-message alert'>" + sanitizeString(result.player) + " has gone offline.</span>");
							if (party[0].split(':')[0] == result.player)
								$('.chat-window[data-player="' + "Party Chat - " + party[0].split(':')[0] + '"]').append("<span class='chat-message alert'>" + party[1].split(':')[0] + " is the new party leader.</span>");
							$('.chat-window[data-player="' + "Party Chat - " + party[0].split(':')[0] + '"]').scrollTop($('.chat-window[data-player="' + "Party Chat - " + party[0].split(':')[0] + '"]')[0].scrollHeight);
							if (party[0].split(':')[0] == result.player)
								Chat.renameTab("Party Chat - " + result.player, "Party Chat - " + party[1].split(':')[0]);
						}

						party = $.grep(party, function(value) {
						  return value != (result.player + ":" + result.guid + ":" + getPlayerColour(result.guid));
						});

						for (var i = 0; i < party.length; i++) {
							friendServer.send(JSON.stringify({
								type: "updateparty",
								party: JSON.stringify(party),
								guid: party[i].split(':')[1]
							}));

							if (party[0].split(':')[1] == puid)
								continue;

							friendServer.send(JSON.stringify({
								type: "notification",
								message: result.player + " has left the party.",
								guid: party[i].split(':')[1]
							}));
						}

						if (party[0].split(':')[1] == puid) {

							$.snackbar({content: result.player + ' has left your party.'});
							$('#notification')[0].currentTime = 0;
							$('#notification')[0].play();

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
					if ($.inArray(result.player + ":" + result.guid, friends) == -1)
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
					$('#notification')[0].currentTime = 0;
					$('#notification')[0].play();

					party.push(result.player + ":" + result.pguid + ":" + result.colour);

					for (var i = 0; i < party.length; i++) {
						friendServer.send(JSON.stringify({
							type: "updateparty",
							party: JSON.stringify(party),
							guid: party[i].split(':')[1]
						}));

						if (party[i].split(':')[1] == result.pguid || party[i].split(':')[1] == puid)
							continue;

						friendServer.send(JSON.stringify({
							type: "notification",
							message: result.player + " has joined the party.",
							guid: party[i].split(':')[1]
						}));
					}

					loadParty();
				break;
				case "acceptgame":

				break;
				case "connect":
					if (party[0].split(':')[1] != result.guid)
						return;
					
					jumpToServer(result.address);
					setTimeout(function() {
						startgame(result.address, 'JOIN GAME'.split(' '), result.password);
					}, 500);
				break;
				case "notification":
					$.snackbar({content: result.message});
					$('#notification')[0].currentTime = 0;
					$('#notification')[0].play();
				break;
				case "updateparty":
					party = JSON.parse(result.party);
					loadParty();
					if(!Chat.isOpen("Party Chat - " + party[0].split(':')[0]) && party.length > 1) {
						Chat.createTab("Party Chat - " + party[0].split(':')[0]);
						Chat.showBox();
					}
				break;
				case "updateplayers":
					onlinePlayers = JSON.parse(result.players);
					updateFriends();
					loadFriends();
				break;
				case "partymessage":
					console.log($.inArray(result.player + ":" + result.senderguid + ":" + getPlayerColour(result.senderguid), party));
					if ($.inArray(result.player + ":" + result.senderguid + ":" + getPlayerColour(result.senderguid), party) == -1)
						return;
					var lead = party[0].split(':')[0];
					console.log("Party Chat - " + lead);
					if(result.player == lead) {
						Chat.receiveMessage("Party Chat - " + lead, sanitizeString(result.player) + ": " + sanitizeString(result.message),1);
					} else {
						Chat.receiveMessage("Party Chat - " + lead, sanitizeString(result.player) + ": " + sanitizeString(result.message));
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

		if (typeof friendServer.callback == 'function')
			friendServer.callback(message.data);
        friendServer.lastMessage = message.data;
				//console.log(friendServer.lastMessage);
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
		$('#notification')[0].currentTime = 0;
		$('#notification')[0].play();
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
    this.friendsServerSocket = new WebSocket('ws://158.69.166.144:55555', 'friendServer');
    this.lastMessage = "";
    this.lastCommand = "";
    this.open = false;
	this.callback = {};
    this.send = function(command, cb) {
		this.callback = cb;
        this.friendsServerSocket.send(command);
        this.lastCommand = command;
    }
}