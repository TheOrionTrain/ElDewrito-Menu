/*
    (c) 2015 Brayden Strasen & Ryan Palmer
    http://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var players = [],
	serverz = [],
	joined = 0,
	track = 5,
	scale = 1,
	anit = 400,
	currentGame = "HaloOnline",
	currentType = "Slayer",
	currentSetting = "menu",
	currentAlbum = isset(localStorage.getItem('album'), "halo3"),
	currentServer,
	selectedserver,
	loopPlayers,
	host = 1,
	forge = 0,
	servers,
	network = "offline",
	browsing = 0,
	sortMap,
	sortType,
	sortFull = false,
	sortLocked = false,
	sortSprint = false,
	Halo3Index = 7,
	currentVersion,
	usingGamepad = true,
	debug = false,
	songs,
	thisSong,
	nextSong,
	songIndex,
	localBackground = isset(localStorage.getItem('localbackground'), 0),
	videoURL = "http://158.69.166.144/video/";

var Chat = {
	time: 0,
	pinned: 0,
	currentTab: "",
	hovering: 0,
	focused: 0,
	createTab: function(player) {
		Chat.currentTab = player;
		$('.chat-tab,.chat-window').removeClass('selected');
		$('#chat-tabs').append("<div data-player='"+player+"' class='chat-tab selected'>"+player+"<div class='x'></div></div>");
		$('#chat-windows').append("<div data-player='"+player+"' class='chat-window selected'></div>");
		$('.chat-tab').click(function() {
			Chat.changeTab($(this).attr('data-player'));
		});
		$('.chat-tab > .x').click(function() {
			Chat.destroyTab($(this).parent('.chat-tab').attr('data-player'));
		});
		var n = $('.chat-tab').length;
		$('.chat-tab').css('width',Math.floor(420/n)+'px');
	},
	renameTab: function(previous, name) {
		$('.chat-tab[data-player="'+previous+'"]').text(name);
		$('.chat-tab[data-player="'+previous+'"]').attr("data-player", name);
		$('.chat-window[data-player="'+previous+'"]').attr("data-player", name);
		//console.log($('.chat-tab[data-player="'+name+'"]').data());
	},
	destroyTab: function(player) {
		if(player == Chat.currentTab) {
			$('.chat-window[data-player="'+player+'"]').remove();
			$('.chat-tab[data-player="'+player+'"]').remove();
			if($('.chat-tab').length > 0) {
				var e = $('.chat-tab:first-of-type').attr('data-player');
				Chat.changeTab(e);
			} else {
				Chat.hideBox();
			}
		} else {
			$('.chat-window[data-player="'+player+'"]').remove();
			$('.chat-tab[data-player="'+player+'"]').remove();
		}
		var n = $('.chat-tab').length;
		$('.chat-tab').css('width',Math.floor(420/n)+'px');
	},
	isOpen: function(player) {
		if($('.chat-tab[data-player="'+player+'"]').length > 0) {
			return true;
		} else {
			return false;
		}
	},
	receiveMessage: function(player,message,balloon) {
		if(!Chat.isOpen(player)) {
			Chat.createTab(player);
		}
		//$('.chat-window[data-player="'+player+'"]').append("<span class='chat-message " + (message.split(': ')[0] == pname ? "self" : "") + "'>" + (balloon == 1 ? "<div class='balloon'></div> " : "")+message+"</span>");
		console.log(balloon);
		$('<span>', {
			class: 'chat-message ' + (message.split(': ')[0] == pname ? "self" : ""),
			text: message
		}).prepend(balloon == 1 ? '<div class="balloon"/> ' : null).appendTo('.chat-window[data-player="'+player+'"]');

		/*if (balloon == 1) {
			m.prepend('<div class="balloon"/> ');
		}*/

		//m.appendTo('.chat-window[data-player="'+player+'"]');
		$('.chat-window[data-player="'+player+'"]').scrollTop($('.chat-window[data-player="'+player+'"]')[0].scrollHeight);
		Chat.showBox();
	},
	sendMessage: function(player,message) {

		if (player.contains("Party Chat -")) {
			friendServer.send(JSON.stringify({
				type: "partymessage",
				message: message,
				player: pname,
				senderguid: puid,
				partymembers: party
			}));
		} else {
			friendServer.send(JSON.stringify({
				type: "pm",
				message: message,
				player: pname,
				senderguid: puid,
				guid: getPlayerUIDFromFriends(player) == "" ? getPlayerUID(player) : getPlayerUIDFromFriends(player)
			}));
		}

		Chat.receiveMessage(player,pname+": "+message, party[0].split(':')[0] == pname ? 1 : 0);
	},
	showBox: function() {
		$('#chatbox').clearQueue().fadeIn(anit);
		Chat.time = 8000;
	},
	hideBox: function() {$('#chatbox').clearQueue().fadeOut(anit);},
	changeTab: function(player) {
		Chat.currentTab = player;
		$('.chat-tab,.chat-window').removeClass('selected');
		$('.chat-tab[data-player="'+player+'"]').addClass('selected');
		$('.chat-window[data-player="'+player+'"]').addClass('selected');
	},
	loop: setInterval(function() {
		if(!Chat.pinned && !Chat.hovering && !Chat.focused) {
			Chat.time -= 100;
			if(Chat.time <= 0) {
				Chat.time = 0;
				Chat.hideBox();
			}
		}
	},100)
};

(function() {
	var e = (window.innerHeight - 80) / 2;
	var d = getURLParameter('debug');
	if (d !== undefined && d == "1") {
		console.log("debug yes");
	}
})();

function debugLog(val) {
	if (!debug) return;

	console.log(val);
}

function getServers(browser) {
	if (usingGamepad) {
		gamepadDeselect();
	}
	servers = [];
	gp_servers = 0;
	gp_on = 0;
	for (var i = 0; i < serverz.servers.length; i++) {
		queryServer(serverz.servers[i], i, browser);
	}
}

var pings = [];

function queryServer(serverInfo, i, browser) {
	if (serverInfo.numPlayers > 16 || serverInfo.maxPlayers > 16) {
		return false;
	}
	var isPassworded = serverInfo.passworded !== undefined;
		servers[i] = {
			"address": sanitizeString(serverInfo.address),
			"host": sanitizeString(serverInfo.hostPlayer),
			"name": sanitizeString(serverInfo.name),
			"variant": sanitizeString(serverInfo.variant),
			"variantType": sanitizeString(serverInfo.variantType),
			"map": sanitizeString(serverInfo.map),
			"mapFile": sanitizeString(serverInfo.mapFile),
			"status": sanitizeString(serverInfo.status),
			"eldewritoVersion": sanitizeString(serverInfo.eldewritoVersion),
			"ping": parseInt(serverInfo.ping),
			"location_flag": typeof serverInfo.location_flag == 'undefined' ? "[ " : (serverInfo.location_flag.contains("base64") || serverInfo.location_flag.toLowerCase().contains("rcon")) ? "undefined" : serverInfo.location_flag,
			"players": {
				"max": parseInt(serverInfo.maxPlayers),
				"current": parseInt(serverInfo.numPlayers)
			},
			"password": isPassworded,
			"sprintEnabled" : parseInt(serverInfo.sprintEnabled)
		};
	addServer(i);
}

function getMapName(filename) {
	switch (filename) {
		case "guardian":
			return "Guardian";
		case "riverworld":
			return "Valhalla";
		case "s3d_avalanche":
			return "Diamondback";
		case "s3d_edge":
			return "Edge";
		case "s3d_reactor":
			return "Reactor";
		case "s3d_turf":
			return "Icebox";
		case "zanzibar":
			return "Last Resort";
		case "cyberdyne":
			return "The Pit";
		case "Bunkerworld":
		case "bunkerworld":
			return "Standoff";
		case "Standoff":
			return "Bunkerworld";
		case "chill":
			return "Narrows";
		case "shrine":
			return "Sandtrap";
		case "deadlock":
			return "High Ground";
		case "hangem-high":
				return "Hangem-High CE";
		default:
			return "Edge";
	}
}

var gp_servers = 0;

function addServer(i) {
	if (servers[i].map == "")
		return;
	++gp_servers;
	var on = (!servers[i].variant) ? "" : "on";
	servers[i].location_flag = typeof servers[i].location_flag == 'undefined' ? "[" : servers[i].location_flag;
	servers[i].ping = servers[i].ping || 0;
	var sprint = (servers[i].sprintEnabled == 1) ? "<img class='sprint' src='img/sprint.svg'>" : " ";

	$('#browser').append("<div data-gp='serverbrowser-" + gp_servers + "' class='server" + ((servers[i].password) ? " passworded" : "") + " ' id='server" + i + "' data-server=" + i + "><div class='thumb'><img src='img/maps/" + getMapName(servers[i].mapFile).toString().toUpperCase() + ".jpg'></div><div class='info'><span class='name'>" + ((servers[i].password) ? "[LOCKED] " : "") + servers[i].name + " (" + servers[i].host + ")  " + servers[i].location_flag + "<span id='ping-" + i + "'>"+servers[i].ping+"</span>ms]</span><span class='settings'>" + servers[i].variant + " " + on + " " + servers[i].map.replace("Bunkerworld", "Standoff") +sprint+"<span class='elversion'>" + servers[i].eldewritoVersion + "</span></span></div><div class='players'>" + servers[i].players.current + "/" + servers[i].players.max + "</div></div>");
	$('.server').hover(function() {
		$('#click')[0].currentTime = 0;
		$('#click')[0].play();
		gamepadSelect($(this).attr('data-gp'));
	});
	$('.server').unbind().click(function() {
		Lobby.join($(this).attr('data-server'));
	});
	filterServers();
	if (usingGamepad && gp_servers == 1) {
		gamepadSelect('serverbrowser-1');
	}
}

var settingsToLoad = [['gamemenu', 'game.menuurl'], ['username', 'player.name'], ['servername', 'server.name'], ['centeredcrosshair', 'camera.crosshair'], ['fov', 'camera.fov'], ['starttimer', 'server.countdown'], ['maxplayers', 'server.maxplayers'], ['serverpass', 'server.password'], ['rawinput', 'input.rawinput'], ['saturation', 'graphics.saturation'], ['gameversion', 'game.version'], ['maplist', 'game.listmaps']];
var loadedSettings = false;
var mapList;

function loadSettings(i) {
	if (i != settingsToLoad.length) {
		if (settingsToLoad[i][0] == "serverpass")
			i++;
		dewRcon.send(settingsToLoad[i][1], function(ret) {
			if (settingsToLoad[i][0] == "gameversion") {
				settings[settingsToLoad[i][0]].set(ret);
				$('#version').text("ElDewrito " + ret);
			} else if (settingsToLoad[i][0] == "maplist") {
				mapList = new Array(ret.split(','));
			} else {
				settings[settingsToLoad[i][0]].current = ret;
				settings[settingsToLoad[i][0]].update();
				//console.log(settingsToLoad[i][0] + ": " + settings[settingsToLoad[i][0]].current);
			}
			i++;
			loadSettings(i);
		});
	} else {
		if (!friendServerConnected)
			StartConnection();
		loadedSettings = true;
		if (!dewRconConnected && hook) {
			$('#music')[0].pause();
			$("video").each(function(){
				$(this)[0].pause();
			});

			loopPlayers = false;
			clearInterval(totallyLoopingPlayers);
		}
	}
}

function initialize() {
	getCurrentVersion();
	var set, b, g, i, e;
	$.getJSON(settings.localmusic.current == 0 ? "music.json" : "http://halo.thefeeltra.in/music.json", function(j) {
		songs = j;
		for (i = 0; i < Object.keys(songs).length; i++) {
			b = Object.keys(songs)[i];
			$('#choosemusic').children('.music-select').append("<div data-gp='music-"+(i+1)+"' data-game='" + b + "' class='selection'><span class='label'>" + getGame(b).toUpperCase() + "</span></div>");
			$('#choosemusic').append("<div class='music-select2 animated' id='songs-" + b + "'></div>");
			for (e = 0; e < Object.keys(songs[b]).length; e++) {
				g = songs[b][e];
				$('#songs-' + b).append("<div data-gp='songs-"+b+"-"+(e+1)+"' data-song='" + g + "' class='selection'><span class='label'>" + g.toUpperCase() + "</span></div>");
			}
		}
		$('.music-select .selection').click(function() {
			changeSong1($(this).attr('data-game'));
		});
		$('.music-select2 .selection').click(function() {
			changeSong2($(this).attr('data-song'));
		});
		$('.music-select .selection').hover(function() {
			$('#click')[0].currentTime = 0;
			$('#click')[0].play();
		});
		$('.music-select2 .selection').hover(function() {
			$('#click')[0].currentTime = 0;
			$('#click')[0].play();
		});
		changeSong2(isset(localStorage.getItem('song'), "Mythic Menu Theme"));
	});
	for (i = 0; i < Object.keys(settings).length; i++) {
		set = Object.keys(settings)[i];
		var category = settings[set].category;
		if (settings[set].typeof == "select") {
			++catergories[category];
			$('#settings-' + category).append("<div data-gp='settings-" + category + "-" + catergories[category] + "' data-option='" + set + "' class='selection'><span class='label'>" + settings[set].name + "</span><span class='left'></span><span class='value'>...</span><span class='right'></span></div>");
		}
		if (settings[set].typeof == "input") {
			++catergories[category];
			$('#settings-' + category).append("<div data-gp='settings-" + category + "-" + catergories[category] + "' data-option='" + set + "' class='selection'><span class='label'>" + settings[set].name + "</span><span class='input'><input type='text' maxlength=40 /></span></div>");
		}
		if (settings[set].typeof == "color") {
			++catergories[category];
			$('#settings-' + category).append("<div data-gp='settings-" + category + "-" + catergories[category] + "' data-option='" + set + "' class='selection'><span class='label'>" + settings[set].name + "</span><span class='input'><input id='option-" + set + "'/></span></div>");
			$('#option-' + set).spectrum({
				color: settings[set].current,
				preferredFormat: "hex",
				showInput: true,
				showPalette: true,
				showSelectionPalette: false,
				palette: [
                    ["#fb8b9f", "#cf3e3e", "#e97339"],
                    ["#ffdb41", "#2f703d", "#375799"],
                    ["#41aaa9", "#d4d4d4", "#5a5a5a"]
                ],
				change: function(color) {
					changeSetting(set, color.toHexString());
					debugLog(color.toHexString());
				}
			});
		}
		settings[set].update();
	}
	$.getJSON("http://158.69.166.144/matchmaking/Standard.json", function(json) {
		for (i = 0; i < Object.keys(json).length; i++) {
			$("#settings-standard").append("<div class='selection' style='width: 250px; line-height: 20px;'><span class='label'>" + Object.keys(json)[i] + "</span></div>");
		}
	});
	$.getJSON("http://158.69.166.144/matchmaking/Social.json", function(json) {
		for (i = 0; i < Object.keys(json).length; i++) {
			$("#settings-social").append("<div class='selection' style='width: 250px; line-height: 20px;'><span class='label'>" + Object.keys(json)[i] + "</span></div>");
		}
	});
	//loadSettings(Object.keys(settings).length);
	for (i = 0; i < Object.keys(maps).length; i++) {
		b = Object.keys(maps)[i];
		$('#choosemap').children('.map-select').append("<div data-game='" + b + "' class='selection'><span class='label'>" + maps[b].name + "</span></div>");
		$('#choosemap').append("<div class='map-select2 animated' id='maps-" + b + "'></div>");
		for (e = 1; e < Object.keys(maps[b]).length; e++) {
			g = Object.keys(maps[b])[e];
			$('#maps-' + b).append("<div data-map='" + g + "' class='selection'><span class='label'>" + g + "</span></div>");
		}
	}
	for (i = 0; i < Object.keys(gametypes).length; i++) {
		b = Object.keys(gametypes)[i];
		$('#choosetype').children('.type-select').append("<div data-maintype='" + b + "' class='selection'><span class='label'>" + b.toUpperCase() + "</span></div>");
		$('#choosetype').append("<div class='type-select2 animated' id='types-" + b.replace(/\s/g, "") + "'></div>");
		for (e = 0; e < Object.keys(gametypes[b]).length; e++) {
			g = Object.keys(gametypes[b])[e];
			$('#types-' + b.replace(/\s/g, "")).append("<div data-type='" + g + "' class='selection'><span class='label'>" + g.toUpperCase() + "</span></div>");
		}
	}
	if(!localStorage.getItem('newlogo')) {
		settings.logo.current = 1;
		settings.logo.update();
		localStorage.setItem('newlogo',1);
	}
}

function changeSetting(s, by) {
	$('#click')[0].currentTime = 0;
	$('#click')[0].play();
	var e = settings[s];
	if (e.name == "GAME VERSION") {
		e.update();
		return;
	}
	if (e.typeof == "select") {
		if (by == 1) {
			if (e.current < e.max) {
				e.current += e.increment;
			} else {
				e.current = e.min;
			}
		} else if (by == 0) {
			if (e.current > e.min) {
				e.current -= e.increment;
			} else {
				e.current = e.max;
			}
		}
	}
	if (e.typeof == "input" || e.typeof == "color") {
		e.current = by;
	}
	settings[s] = e;
	e.update();
	localStorage.setItem(s, e.current);
}

function toggleNetwork() {
	if (network == "offline") {
		//network = "online";
		//callbacks.networkType(1);
	} else {
		network = "offline";
		//callbacks.networkType(2);
	}
	$('#network').text(network.toUpperCase());
	$('#click')[0].currentTime = 0;
	$('#click')[0].play();
}

var friends = [], friends_online;

function quickJoin() {
	var lowestPing = 5000;
	for (var i = 0; i < serverz.servers.length; i++) {
		if (typeof serverz.servers[i] != 'undefined') {
			if (serverz.servers[i].ping < lowestPing && (parseInt(serverz.servers[i].numPlayers + 2) < parseInt(serverz.servers[i].maxPlayers)) && !serverz.servers[i].passworded) {
				lowestPing = parseInt(serverz.servers[i].ping);
				currentServer = serverz.servers[i];
			}
		}
		if (i == serverz.servers.length - 1) {
			jumpToServer(currentServer.address);
			setTimeout(function() {
				startgame(currentServer.address, 'JOIN GAME'.split(' '), "");
			}, 500);
		}
	}
}

function jumpToServer(ip) {
		var d;
		for (var i = 0; i < serverz.servers.length; i++) {
			if (serverz.servers[i].address == ip)
				d = serverz.servers[i];
		}
		host = 0;
		browsing = 0;
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span class='numbers'><span id='joined'>0</span>/<span id='maxplayers'>0</span></span></td></tr>");
		if((typeof d.players !== 'undefined' && typeof d.players.current !== 'undefined' && d.players.current == d.players.max) || (typeof d.numPlayers !== 'undefined' && d.numPlayers == d.maxPlayers)) {
			dewAlert({
				title: "Server Full",
				content: 'This server is full, try joining a different one.',
				acceptText: "OK"
			});
			$('#notification')[0].currentTime = 0;
			$('#notification')[0].play();
			return;
		}
		changeMap2(getMapName(d.mapFile));
		$('#subtitle').text(d.name + " : " + d.address);
		if (d.variant === "")
			d.variant = "Slayer";
		$('#gametype-display').text(d.variant.toUpperCase());
		if (d.variantType === "none")
			d.variantType = "Slayer";
		$('#gametype-icon').css('background', "url('img/gametypes/" + (d.variantType === "ctf" || d.variantType === "koth") ? d.variantType : d.variantType.toString().capitalizeFirstLetter + ".png') no-repeat 0 0/cover");
		changeMenu(currentMenu+",customgame,vertical");
		$('#friendslist').css('right','-250px');
		$('#friends-online').fadeIn(anit);
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'customgame,serverbrowser,vertical');
		playersJoin(d.numPlayers, d.maxPlayers, 20, d.address);
		currentServer = d;
		loopPlayers = false;
		setTimeout(function() {
			lobbyLoop(d.address);
			loopPlayers = true;
		},3000);
		$('#start').children('.label').text("JOIN GAME");
		$('#friends-on').stop().fadeOut(anit);
		$('#title').text('CUSTOM GAME');
		$('#network-toggle').hide();
		$('#type-selection').show();
		currentMenu = "customgame";
		$('#slide')[0].currentTime = 0;
		$('#slide')[0].play();
}

function loadParty() {
	if(party !== previous.party) {
		$('#party').empty();
		$('#current-party').empty().append("<tr class='top' hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='info' colspan='2'>Current Party <span class='numbers'><span id='current-party-count'>"+party.length+"</span>/16</span></td></tr>");
		if(party.length > 0) {
			for(var i=0; i < party.length; i++) {
				$('#party').append("<div class='friend'>"+party[i].split(":")[0]+"</div>");
				var isDev = (developers.indexOf(party[i].split(':')[1]) >= 0) ? "developer" : "";
				//$('#current-party').append("<tr hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='name "+isDev+"'>" + party[i].split(':')[0] + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
				$('#current-party').append("<tr hex-colour='" + party[i].split(":")[2] + "' data-color='" + hexToRgb(party[i].split(":")[2], 0.5) + "' style='background:" + hexToRgb(party[i].split(":")[2], 0.5) + ";'><td class='name "+isDev+"'>" + party[i].split(':')[0] + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
			}
			$('.friend,#friend-add,#friend-remove').hover(function() {
				$('#click')[0].currentTime = 0;
				$('#click')[0].play();
			});
			$('#party .friend:first-of-type').attr('title','Party Leader');
		} else {
			$('#party').append("<div class='nofriends'>You're not partying :(</div>");
			$('#current-party').empty();
		}
	}
	previous.party = party;
}

function updateFriends() {
	for (var i = 0; i < onlinePlayers.length; i++) {
		for (var o = 0; o < friends.length; o++) {
			if (((!friends[o].contains(":0x") || friends[o].contains(":n")) && friends[o] == onlinePlayers[i].split(':')[0]) || (onlinePlayers[i].split(':')[1] == friends[o].split(':')[1] && onlinePlayers[i].split(':')[0] != friends[o].split(':')[0])) {
				friends[o] = onlinePlayers[i].split(":")[0] + ":" + onlinePlayers[i].split(":")[1];
				localStorage.setItem("friends", JSON.stringify(friends));
			}
		}
	}
}

function getPlayerColour(guid) {
	for (var i = 0; i < onlinePlayers.length; i++) {
		if (guid == onlinePlayers[i].split(":")[1]) {
			return(onlinePlayers[i].split(":")[2] === 'undefined' || onlinePlayers[i].split(":")[2].length < 1 || onlinePlayers[i].split(":")[2] === null) ? "#000000" : onlinePlayers[i].split(":")[2];
		}
	}
	return "#000000";
}

function loadFriends() {
	$('#friends').empty();
	$('#friends-on').empty().append("<tr class='top' hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='info' colspan='2'>Friends Online <span class='numbers'><span id='friends-on-count'>0</span>/<span id='friends-on-total'>0</span></span></td></tr>");
	friends_online = 0;
	friends = JSON.parse(localStorage.getItem("friends"));

	if(!friends || friends.length < 1) {
		friends = [];
		localStorage.setItem("friends", JSON.stringify(friends));
		$('#friends-online').text("0 Friends Online");
		$('#friends').append("<div class='nofriends'>You have no friends :(<br/>Add some below</div>");
		return false;
	}
	friends.sort(function(a, b) {
			if ((!a.contains(":0x") ? a.toLowerCase() : a.split(':')[0].toLowerCase()) < (!b.contains(":0x") ? b.toLowerCase() : b.split(':')[0].toLowerCase())) return -1;
			if ((!a.contains(":0x") ? a.toLowerCase() : a.split(':')[0].toLowerCase()) > (!b.contains(":0x") ? b.toLowerCase() : b.split(':')[0].toLowerCase())) return 1;
			return 0;
	});
	friends.sort(function(a, b) {
			if (isOnline(a) > isOnline(b)) return -1;
			if (isOnline(a) < isOnline(b)) return 1;
			return 0;
	});
	for(var i=0; i < friends.length; i++) {
		var o = (isOnline(friends[i])) ? "online" : "offline";
		$('#friends').append("<div class='friend "+o+"'>"+friends[i].split(':')[0]+"</div>");
		if(o == "online") {
			friends_online++;
			//console.log(getPlayerColour(friends[i].split(':')[1]));
			var isDev = (developers.indexOf(friends[i].split(':')[1]) >= 0) ? "developer" : "";
			//$('#friends-on').append("<tr hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='name "+ isDev +"'>" + friends[i].split(':')[0] + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
			$('#friends-on').append("<tr hex-colour='" + getPlayerColour(friends[i].split(':')[1]) +  "' data-color='" + hexToRgb(getPlayerColour(friends[i].split(':')[1]), 0.5) + "' style='background:" + hexToRgb(getPlayerColour(friends[i].split(':')[1]), 0.5) + ";'><td class='name "+ isDev +"'>" + friends[i].split(':')[0] + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
			/*$('<tr>', {
				"hex-colour": getPlayerColour(friends[i].split(':')[1]),
				"data-color": hexToRgb(getPlayerColour(friends[i].split(':')[1]), 0.5),
				style: "'background:" + hexToRgb(getPlayerColour(friends[i].split(':')[1]), 0.5) + ";",
			}).appendTo('#friends-on');*/
		}
	}
	$('#friends-online').text(friends_online+" " + (friends_online == 1 ? "Friend" : "Friends") + " Online");
	$('#friends-on-count').text(friends_online);
	if(friends_online === 0) {$('#friends-on').empty();}
	$('#friends-on-total').text(friends.length);
	$('.friend,#friend-add,#friend-remove,#lobby-container table tr').hover(function() {
		$('#click')[0].currentTime = 0;
		$('#click')[0].play();
	});
	$("#lobby-container table tr").mouseover(function() {
		var n = $(this).attr('id'),
			col = $(this).attr('hex-colour'),
			bright = brighter(col);
		$(this).css("background-color", hexToRgb(bright, 0.75));
	}).mouseout(function() {
		var n = $(this).attr('id'),
			col = $(this).attr('hex-colour');
		$(this).css("background-color", hexToRgb(col, 0.5));
	});
	$('#friends .friend, #friends-on td.name').click(function(e) {
		if($(this).hasClass("online") || $(this).hasClass("name")) {
			submenu("show",$(this).text(),1,e);
		} else {
			submenu("show",$(this).text(),0,e);
		}
		$('#slide')[0].currentTime = 0;
		$('#slide')[0].play();
	});

	$('#party .friend, #current-party td.name').click(function(e) {
		partysubmenu("show",$(this).text(),e);
		$('#slide')[0].currentTime = 0;
		$('#slide')[0].play();
	});
}

function getPlayerName(UID) {
	for (var i = 0; i < onlinePlayers.length; i++) {
		if (onlinePlayers[i].split(':')[1] == UID)
			return onlinePlayers[i].split(':')[0];
	}
	return "";
}

function getPlayerUID(name) {
	for (var i = 0; i < onlinePlayers.length; i++) {
		if (onlinePlayers[i].split(':')[0] == name)
			return onlinePlayers[i].split(':')[1];
	}
	return "";
}

function getPlayerNameFromFriends(UID) {
	for (var i = 0; i < friends.length; i++) {
		if (friends[i].split(':')[1] == UID)
			return friends[i].split(':')[0];
	}
	return "";
}

function getPlayerUIDFromFriends(name) {
	for (var i = 0; i < friends.length; i++) {
		if (friends[i].contains(":0x") && friends[i].split(':')[0] == name)
			return friends[i].split(':')[1];
	}
	return "";
}

function addFriend(name) {
	if(name !== null || name !== "" || name !== undefined) {
		$('#friend-input').val("");
		if(friends.indexOf(name) == -1) {
			friends.push(getPlayerUID(name) != "" ? name + ":" + getPlayerUID(name) : name);
			friends.sort(function(a, b) {
					if ((!a.contains(":0x") ? a.toLowerCase() : a.split(':')[0].toLowerCase()) < (!b.contains(":0x") ? b.toLowerCase() : b.split(':')[0].toLowerCase())) return -1;
					if ((!a.contains(":0x") ? a.toLowerCase() : a.split(':')[0].toLowerCase()) > (!b.contains(":0x") ? b.toLowerCase() : b.split(':')[0].toLowerCase())) return 1;
					return 0;
			});
			friends.sort(function(a, b) {
					if (isOnline(a) > isOnline(b)) return -1;
					if (isOnline(a) < isOnline(b)) return 1;
					return 0;
			});
		}
		localStorage.setItem("friends", JSON.stringify(friends));
		updateFriends();
		loadFriends();
	}
}

function removeFriend(name) {
	if(name !== null || name !== "" || name !== undefined) {
		$('#friend-input').val("");
		friends.remove(getPlayerUIDFromFriends(name) == "" ? name : name + ":" + getPlayerUIDFromFriends(name));
		friends.sort(function(a, b) {
				if ((!a.contains(":0x") ? a.toLowerCase() : a.split(':')[0].toLowerCase()) < (!b.contains(":0x") ? b.toLowerCase() : b.split(':')[0].toLowerCase())) return -1;
				if ((!a.contains(":0x") ? a.toLowerCase() : a.split(':')[0].toLowerCase()) > (!b.contains(":0x") ? b.toLowerCase() : b.split(':')[0].toLowerCase())) return 1;
				return 0;
		});
		friends.sort(function(a, b) {
				if (isOnline(a) > isOnline(b)) return -1;
				if (isOnline(a) < isOnline(b)) return 1;
				return 0;
		});
		localStorage.setItem("friends", JSON.stringify(friends));
		updateFriends();
		loadFriends();
	}
}

function isOnlineServer(friend) {
	return typeof serverz.players[friend.contains(":0x") ? friend.split(':')[0] : friend] != 'undefined';
}

function isOnline(friend) {
	for (var i = 0; i < onlinePlayers.length; i++) {
		if ((friend.contains(":0x") && (onlinePlayers[i].split(':')[1] == friend.split(':')[1])) | onlinePlayers[i].split(':')[0] == friend || (typeof serverz.players[friend.contains(":0x") ? friend.split(':')[0] : friend] != 'undefined'))
			return true;
	}
	return false;
}

var online = true;

$(document).ready(function() {
	$(window).resize(function(){
		settings.resolution.update();
	});
	if(!localStorage.getItem('PressF11ToQuit')) {
		dewAlert({
			title: "Press F11 to Close the Menu",
			content: "By clicking Accept, you understand that it is your responsibility to remember that the close/quit button is and always has been F11, and you will not bother the developers of this menu to ask them how to close the menu.",
			callback: function() {localStorage.setItem('PressF11ToQuit',1)}
		});
	}
	initializeNewMenu();

	Mousetrap.bind('a', function() {$(".control-A").trigger('click');});
	Mousetrap.bind('b', function() {$(".control-B").trigger('click');});
	Mousetrap.bind('x', function() {$(".control-X").trigger('click');});
	Mousetrap.bind('y', function() {$(".control-Y").trigger('click');});

	Mousetrap.bind('up', function() {
		if ($("[data-gp='" + DewMenu.selected + "-" + (gp_on - 1) + "']").length > 0) {
			gp_on -= 1;
		}
		gamepadSelect(DewMenu.selected + "-" + gp_on);
		if (DewMenu.selected == "serverbrowser") {
			$('#browser').scrollTo('.server.gp-on');
		}
		if (DewMenu.selected.indexOf("songs-") > -1) {
			$('#'+DewMenu.selected).scrollTo('.selection.gp-on');
		}
		$('#click')[0].currentTime = 0;
		$('#click')[0].play();
	});
	Mousetrap.bind('down', function() {
		if ($("[data-gp='" + DewMenu.selected + "-" + (gp_on + 1) + "']").length > 0) {
			gp_on += 1;
		}
		gamepadSelect(DewMenu.selected + "-" + gp_on);
		if (DewMenu.selected == "serverbrowser") {
			$('#browser').scrollTo('.server.gp-on');
		}
		if (DewMenu.selected.indexOf("songs-") > -1) {
			$('#'+DewMenu.selected).scrollTo('.selection.gp-on');
		}
		$('#click')[0].currentTime = 0;
		$('#click')[0].play();
	});
	Mousetrap.bind('left', function() {
		gamepadLeft();
	});
	Mousetrap.bind('right', function() {
		gamepadRight();
	});
	$('#chatbox').hover(
		function() {Chat.hovering = 1;},
		function() {Chat.hovering = 0;}
	);
	$('#chat-input').focus(function() {
		Chat.focused = 1;
	});
	$('#chat-input').blur(function() {
		Chat.focused = 0;
	});
	$('#chat-pin').click(function() {
		Chat.pinned = (Chat.pinned) ? 0 : 1;
		$(this).toggleClass('pinned');
	});
	$('#chat-enter').click(function() {
		var m = $('#chat-input').val();
		if(m.length > 0) {
			$('#chat-input').val("");
			Chat.sendMessage(Chat.currentTab,m);
		}
	});
	$('#chat-input').pressEnter(function(e){
   		$('#chat-enter').trigger('click');
	});
	$('#alert-yes').click(function() {
		var c = $('#alert').attr('data-callback');
		var d = $('#alert').attr('data-info');
		hideAlert(true,c,d);
	});
	$('#alert-no').click(function() {
		var c = $('#alert').attr('data-callback');
		hideAlert(false,c,false);
	});
	$('#friend-add').click(function() {
		$('#slide')[0].currentTime = 0;
		$('#slide')[0].play();
		addFriend($('#friend-input').val());
	});
	$('#click-menu li').click(function() {
		submenu($(this).attr('data-action'),$('#click-menu').attr('data-friend'));
	});
	$('#click-menu li').hover(function() {
		$('#click')[0].currentTime = 0;
		$('#click')[0].play();
	});
	$('#click-menu-container').click(function() {
		$(this).hide();
	});
	$('*[data-gp]').mouseenter(function() {
		if($(this).attr('data-setting')) {
			return false;
		}
		var a = $(this).attr('data-gp').split("-"),
			b = parseInt(a[a.length-1]);
		gp_on = b;
		gamepadSelect(DewMenu.selected + "-" + gp_on);
	});
	$('*[data-gp]').mouseout(function() {
		gp_on = 0;
		gamepadSelect(DewMenu.selected + "-" + gp_on);
	});
	$('#dewmenu-button').click(function() {
		dewAlert({
			title: "Are you sure?",
			content: "Are you sure you want to switch to Scooterpsu's menu?",
			cancel: true,
			acceptText: "Confirm",
			cancelText: "Cancel",
			callback: function(c) {
				if(c) {
					window.location = "http://scooterpsu.github.io/";
					dewRcon.send('game.menuurl "http://scooterpsu.github.io/"');
				}
			}
		});
	});
	$('#browser-settings').click(function() {
		changeMenu("serverbrowser,options,fade");
	});
	if (window.location.origin.toLowerCase().indexOf("no1dead.github.io") >= 0) {
		changeMenu("main2,serverbrowser,vertical");
	} else if (window.location.origin.toLowerCase() == "file://") {
		online = navigator.onLine;
	}
	var CSSfile = getURLParameter('css');
	if (CSSfile) {
		$('#style').attr('href', 'css/' + CSSfile + '.css');
	}
	gamepadBind();
	Mousetrap.bind('f11', function() {
		setTimeout(function() {
			if (dewRconConnected)
				dewRcon.send('Game.SetMenuEnabled 0');
			else
				dew.hide();
		}, anit);
	});
	initialize();
	$('#notification')[0].currentTime = 0;
	$('#notification')[0].play();
	//getTotalPlayers();
	totalPlayersLoop();
	$('#music')[0].addEventListener('ended', function() {
		if (settings.shufflemusic.current === 1) {
			changeSong2(nextSong);
		} else {
			changeSong2(thisSong);
		}
	});
	$('#browser-full').click(function() {
		if (sortFull) {
			sortFull = false;
			$(this).children('.checkbox').toggleClass('checked');
		} else {
			sortFull = true;
			$(this).children('.checkbox').toggleClass('checked');
		}
		filterServers();
	});
	$('#friends-online').click(function() {
		$('#friendslist').css('right','0px');
		$('#friends-online').fadeOut(anit);
		$('#slide')[0].currentTime = 0;
		$('#slide')[0].play();
	});
	$('#friends-close').click(function() {
		$('#friendslist').css('right','-250px');
		$('#friends-online').fadeIn(anit);
		$('#slide')[0].currentTime = 0;
		$('#slide')[0].play();
	});
	$('#browser-locked').click(function() {
		if (sortLocked) {
			sortLocked = false;
			$(this).children('.checkbox').toggleClass('checked');
		} else {
			sortLocked = true;
			$(this).children('.checkbox').toggleClass('checked');
		}
		filterServers();
	});
	$('#browser-sprint').click(function() {
		if (sortSprint) {
			sortSprint = false;
			$(this).children('.checkbox').toggleClass('checked');
		} else {
			sortSprint = true;
			$(this).children('.checkbox').toggleClass('checked');
		}
		filterServers();
	});
	$('#refresh').click(function() {
		loadServers();
		filterServers();
	});
	$('#direct-connect').click(function() {
		directConnect();
	});
	$('#quit').click(function() {
		dewRcon.send('Game.SetMenuEnabled 0');
	});
	$('#clear').click(function() {
		clearFilters();
	});
	$('#network-toggle').click(function() {
		toggleNetwork();
	});
	$('#version').click(function() {
		clearAllCookies();
	});
	var e = ((window.innerHeight - $('#menu').height()) / 2) - 40;
	$('#connectgamepad')[0].volume = settings.musicvolume.current * 0.01;
	$('#music')[0].volume = settings.musicvolume.current * 0.01;
	$('#click')[0].volume = settings.sfxvolume.current * 0.01;
	$('#notification')[0].volume = settings.sfxvolume.current * 0.01;
	$('#start').click(function() {
		var mode = $('#start').children('.label').text().toString().split(" ");
		if (mode[1] === "FORGE" || (mode[0] === "START" && mode[1] === "GAME"))
			startgame("127.0.0.1:11775", mode, "");
		else
			startgame(currentServer.address, mode, "");
	});
	Mousetrap.bind('enter up up down down left right left right b a enter', function() {
		settings.background.current = 9001;
		settings.background.update();
	});
	$('.selection').hover(function() {
		$('#click')[0].currentTime = 0;
		$('#click')[0].play();
		$('.selection').removeClass('gp-on');
		$(this).addClass("gp-on");
		gp_on = $(this).attr('data-gp').split("-")[1];
		gamepadSelect(DewMenu.selected + "-" + gp_on);
		$('#description').text(DewMenu.description[$(this).attr('data-gp')]);
	});
	$('.map-select .selection').click(function() {
		changeMap1($(this).attr('data-game'));
	});
	$('.options-select .selection').click(function() {
		changeSettingsMenu($(this).attr('data-setting'));
	});
	$('.map-select2 .selection').click(function() {
		changeMap2($(this).attr('data-map'), true);
	});
	$('.map-select2 .selection').hover(function() {
		changeMap2($(this).attr('data-map'));
	});
	$('.type-select .selection').click(function() {
		changeType1($(this).attr('data-maintype'));
	});
	$('.type-select2 .selection').click(function() {
		changeType2($(this).attr('data-type'), true);
	});
	$('.type-select2 .selection').hover(function() {
		changeType2($(this).attr('data-type'));
	});
	$('.right').click(function() {
		var c = $(this).parent('.selection').attr('data-option');
		changeSetting(c, 1);
	});
	$('.left').click(function() {
		var c = $(this).parent('.selection').attr('data-option');
		changeSetting(c, 0);
	});
	$('.input input').focusout(function() {
		var c = $(this).parent('.input').parent('.selection').attr('data-option'),
			val = $(this).val();
		changeSetting(c, val);
	});
	$("[data-action='menu']").click(function() {
		changeMenu($(this).attr('data-menu'));
	});
	$("[data-action='matchmaking']").click(function() {
		//quickJoin();
	});
	$("[data-action='menu-option']").click(function() {
		changeMenuOptions($(this).attr('data-menu'));
	});
	$('#back').click(function() {
		changeMenu($(this).attr('data-action'));
		if (usingGamepad) {
			gp_on = p_gp_on;
			gamepadSelect(DewMenu.selected + "-" + p_gp_on);
		}
	});
	$('#back-options').click(function() {
		changeMenuOptions($(this).attr('data-action'),1);
		if (usingGamepad) {
			gp_on = p_gp_on;
			gamepadSelect(DewMenu.selected + "-" + p_gp_on);
		}
	});
	if (getURLParameter('browser')) {
		changeMenu("main2,serverbrowser,vertical");
		setTimeout(function() {
			$('#back').hide();
		},1000);
		$('#browser-settings').show();
	}
});

function loadServers() {
	if (browsing === 1) {
		pings = [];
		$('#refresh img').addClass('rotating');
		setTimeout(function() {
			$('#refresh img').removeClass('rotating');
		}, 4000);
		$('#browser').empty();
		getServers(true);
		$('.server').hover(function() {
			$('#click')[0].currentTime = 0;
			$('#click')[0].play();
		});
		$('.server').click(function() {
			Lobby.join($(this).attr('data-server'));
		});
		filterServers();
	}
}

var previous = new Object();

function lobbyLoop(ip) {
	var success = false;
	if (loopPlayers === false)
		return;
	$.getJSON("http://" + ip, function(serverInfo) {
		success = true;
		console.log(currentServer);
		players = serverInfo.players;
		var colour = "#000000";

		if (serverInfo.variantType == "none")
				serverInfo.variantType = "Slayer";
		if (serverInfo.variant == "")
				serverInfo.variant = "Slayer";
		$('#gametype-display').text(serverInfo.variant.toUpperCase());
		$('#gametype-icon').css('background', "url('img/gametypes/" + (serverInfo.variantType === "ctf" || serverInfo.variantType === "koth") ? serverInfo.variantType : serverInfo.variantType.toString().capitalizeFirstLetter + ".png') no-repeat 0 0/cover");

		if (typeof serverInfo.passworded == 'undefined') {
			players.sort(function(a, b) {
				return a.team - b.team
			});
		}

		if(players !== previous.players) {
			$('#lobby').empty().append("<tr class='top' hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='info' colspan='2'>Current Lobby <span class='numbers'><span id='joined'>"+serverInfo.numPlayers+"</span>/<span id='maxplayers'>"+serverInfo.maxPlayers+"</span></span></td></tr>");
			if (typeof serverInfo.passworded == 'undefined') {
				for (var i = 0; i < players.length; i++) {
					if (typeof players[i] != 'undefined' && players[i].name != "") {
						if (serverInfo.teams)
							colour = (parseInt(players[i].team) === 0) ? "#c02020" : "#214EC0";
							var isDev = (developers.indexOf(players[i].uid) >= 0) ? "developer" : "";
						$('#lobby').append("<tr id='player" + i + "' team='" + players[i].team + "' hex-colour= '" + colour + "' data-color='" + hexToRgb(colour, 0.5) + "' style='background:" + hexToRgb(colour, 0.5) + ";'><td class='name "+isDev+"'>" + players[i].name + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
					}
				}
				previous.players = players;
				$('#lobby-container table tr').hover(function() {
					$('#click')[0].currentTime = 0;
					$('#click')[0].play();
				});
				$("#lobby-container table tr").mouseover(function() {
					var n = $(this).attr('id'),
						col = $(this).attr('hex-colour'),
						bright = brighter(col);
					$(this).css("background-color", hexToRgb(bright, 0.75));
				}).mouseout(function() {
					var n = $(this).attr('id'),
						col = $(this).attr('hex-colour');
					$(this).css("background-color", hexToRgb(col, 0.5));
				});
				$('#lobby tr').click(function() {
					var e = $(this).children('.name').text(),
						n = $(this).attr('id'),
						nn = "user",
						col = $(this).attr('hex-colour'),
						bright = brighter(col);
					changeMenu("customgame,players,horizontal", e);
					$('#lobby tr').each(function() {
						var color = $(this).attr('data-color');
						$(this).css('background', color);
					});
					$(this).css("background-color", hexToRgb(bright, 0.75));
				});
			}
		}

		changeMap2(getMapName(serverInfo.mapFile));
		$('#subtitle').text(serverInfo.name + " : " + ip);
		if (loopPlayers && currentServer.address == ip)
			setTimeout(function() { lobbyLoop(ip); }, 3000);
	});
	setTimeout(function() {
		if (!success) {
			console.log("Failed to contact server, retrying.");
			if (loopPlayers && currentServer.address == ip)
				setTimeout(function() { lobbyLoop(ip); }, 3000);
		}
	}, 5000);
}

function getTotalPlayers() {
	$.getJSON(infoIP+"/count", function(data) {
		$('#players-online').text(data.result);
	});
}

function directConnect() {
	var ip = prompt("Enter IP Address: ");
	jumpToServer(ip);
}

function getCurrentVersion() {
	$.getJSON("http://tracks.thefeeltra.in/update", function(data) {
	});
}

var infoIP = "http://158.69.166.144:8081",
	totallyLoopingPlayers = setInterval(totalPlayersLoop,10000);

function totalPlayersLoop() {
	$.getJSON(infoIP+"/all", function(data) {
		serverz = data;
		for (var i = 0; i < serverz.servers.length; i++) {
			//if (!dewRconConnected) {
				var startTime = Date.now(),
				endTime,
				ping;
				(function(i) {
					$.ajax({
						type: "GET",
						url: "http://" + serverz.servers[i].address + "/",
						async: true,
						success: function() {
							endTime = Date.now();
							ping = Math.round((endTime - startTime) * 0.45);
							serverz.servers[i].ping = ping;
							$('#ping-'+i).text(ping);
						}
					});
				})(i);
		}
		$('#players-online').text(serverz.count);
		loadParty();
		if (!friendServerConnected)
			loadFriends();
	}).fail(function(d) {
		console.log(infoIP+" is currently down.");
		infoIP = (infoIP == "http://158.69.166.144:8081" ? "http://servers.thefeeltra.in" : "http://158.69.166.144:8081");
		console.log("Switched to "+infoIP+".");
		totalPlayersLoop();
	});
}

function playersJoin(number, max, time, ip) {
	$.getJSON("http://" + ip, function(serverInfo) {
		debugLog(ip);
		players = serverInfo.players;
		var colour = "#000000";

		if (typeof serverInfo.passworded == 'undefined') {
			players.sort(function(a, b) {
				return a.team - b.team
			});
		}

		$('#lobby').empty();
		$('#lobby').append("<tr class='top' hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='info' colspan='2'>Current Lobby <span class='numbers'><span id='joined'>0</span>/<span id='maxplayers'>0</span></span></td></tr>");
		$('#maxplayers').text(serverInfo.maxPlayers);
		$('#joined').text(serverInfo.numPlayers);
		if (typeof serverInfo.passworded != 'undefined')
			return;
		for (var i = 0; i < players.length; i++) {
			if (typeof players[i] != 'undefined' && players[i].name != "") {
				if (serverInfo.teams)
					colour = (parseInt(players[i].team) === 0) ? "#c02020" : "#214EC0";
				var isDev = (developers.indexOf(players[i].uid) >= 0) ? "developer" : "";
				$('#lobby').append("<tr id='player" + i + "' team='" + players[i].team + "' hex-colour= '" + colour + "' data-color='" + hexToRgb(colour, 0.5) + "' style='background:" + hexToRgb(colour, 0.5) + ";'><td class='name "+isDev+"'>" + players[i].name + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
				$('#player' + i).css("display", "none");
				$('#player' + i).fadeIn(anit);
			}
		}
		$('#lobby tr').hover(function() {
			$('#click')[0].currentTime = 0;
			$('#click')[0].play();
		});
		$("#lobby tr").mouseover(function() {
			var n = $(this).attr('id'),
				col = $(this).attr('hex-colour'),
				bright = brighter(col);
			$(this).css("background-color", hexToRgb(bright, 0.75));
		}).mouseout(function() {
			var n = $(this).attr('id'),
				col = $(this).attr('hex-colour');
			$(this).css("background-color", hexToRgb(col, 0.5));
		});
		$('#lobby tr').click(function() {
			var e = $(this).children('.name').text(),
				n = $(this).attr('id'),
				nn = "user",
				col = $(this).attr('hex-colour'),
				bright = brighter(col);
			changeMenu("customgame,players,horizontal", e);
			$('#lobby tr').each(function() {
				var color = $(this).attr('data-color');
				$(this).css('background', color);
			});
			$(this).css("background-color", hexToRgb(bright, 0.75));
		});
	});
}

function joinServer(details) {
	var d = servers[details];
	if ((typeof d.players !== 'undefined' && typeof d.players.current !== 'undefined' && d.players.current != d.players.max) || (typeof d.numPlayers !== 'undefined' && d.numPlayers != d.maxPlayers)) {
		host = 0;
		browsing = 0;
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span class='numbers'><span id='joined'>0</span>/<span id='maxplayers'>0</span></span></td></tr>");
		changeMap2(getMapName(d.mapFile));
		$('#subtitle').text(d.name + " : " + d.address);
		if (d.variant === "") {
			d.variant = "Slayer";
		}
		$('#gametype-display').text(d.variant.toUpperCase());
		if (d.variantType === "none")
			d.variantType = "Slayer";
		$('#gametype-icon').css('background', "url('img/gametypes/" + (d.variantType === "ctf" || d.variantType === "koth") ? d.variantType : d.variantType.toString().capitalizeFirstLetter + ".png') no-repeat 0 0/cover");
		Menu.customgame.position = "top";
		changeMenu("serverbrowser,customgame,vertical,serverbrowser");
		$('#back').attr('data-action', 'customgame,serverbrowser,vertical');
		playersJoin(d.players.current, d.players.max, 20, d.address);
		currentServer = d;
		lobbyLoop(servers[selectedserver].address);
		loopPlayers = true;
	} else {
		dewAlert({
			title: "Server Full",
			content: 'This server is full, try joining a different one.',
			acceptText: "OK"
		});
	}
	$('#start').children('.label').text("JOIN GAME");
	$('#friends-on').stop().fadeOut(anit);
	$('#title').text('CUSTOM GAME');
	$('#network-toggle').hide();
	$('#type-selection').show();
}

function initializeNewMenu() {
	if (window.location.protocol == "https:") {
		alert("The server browser doesn't work over HTTPS, switch to HTTP if possible.");
	}
	$('#main-menu').click(function() {
        DewMenu.change("main");
		$('#main').show();
        $('#main2').hide();
    });
}

function changeMenuOptions(m,b) {
	$('#back').hide();
	var e = m.split(",");
	if($('#'+e[0]).attr('data-menu-back') == "main2" && b) {
		if(getURLParameter('browser') == 1) {
			changeMenu("options,serverbrowser,fade");
			$('#back').hide();
		} else {
			changeMenu("options,main2,fade");
		}
	} else {
		$('#'+e[0]).hide();
		$('#'+e[1]).fadeIn(anit);
		$('#back-options').attr('data-action', e[1]+","+e[0]);
		$('#slide')[0].currentTime = 0;
		$('#slide')[0].play();
	}
	$('#back').hide();
}

/*function changeMenu(m) {
	var e = m.split(","), f = Menu[e[0]], t = Menu[e[1]];
	if(e[0] === e[1]) {
		return false;
	}
	if(e[2] == "vertical") {
		var l = (t.position == "top") ? "bottom" : "top";
		f.position = l;
		t.position = "center";
	}
	else if(e[2] == "horizontal") {
		var l = (t.position == "left") ? "right" : "left";
		f.position = l;
		t.position = "center";
	}
	else if(e[2] == "fade") {
		f.hidden = true;
		$('#'+e[0]).fadeOut(anit);
		t.hidden = false;
		$('#'+e[1]).fadeIn(anit);
	}
	if(t.logo) {
		$('#dewrito').removeClass().addClass("animated "+t.logo);
	} else {
		$('#dewrito').removeClass().addClass("animated hidden");
	}
	if(t.playerlist) {
		$('#lobby-container').removeClass().addClass('showing');
	} else {
		$('#lobby-container').removeClass().addClass('hidden');
	}
	if(t.friendslist) {
		$('#friends-on').stop().fadeIn(anit);
	} else {
		$('#friends-on').stop().fadeOut(anit);
	}
	if(t.back) {
		if(e[0] == "options") {e[2] = "vertical";}
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', e[1]+","+t.back+","+e[2]);
	} else {
		$('#back').fadeOut(anit);
	}
	if(typeof t.onchange == "function") {
		if(e[3]) {
			t.onchange(e[3]);
		}
		else {t.onchange();}
	}
	if(t.video) {
		if(t.video == f.video) {
		} else {
			for(var i=0; i< t.video.length; i++) {
				if($('#bg-'+t.video[i]).length) {
					$('#bg-'+t.video[i]).fadeIn(anit);
					$('#bg-'+t.video[i])[0].play();
					if(f.video) {
						for(var i=0; i< f.video.length; i++) {
							if($('#bg-'+f.video[i]).length) {
								$('#bg-'+f.video[i]).fadeOut(anit);
								$('#bg-'+f.video[i])[0].pause();
							}
						}
					}
					else {
						$('#bg1').fadeOut(anit);
						$('#bg1')[0].pause();
					}
				}
			}
		}
	}
	else {
		$('#bg1').fadeIn(anit);
		$('#bg1')[0].play();
		if(f.video) {
			for(var i=0; i< f.video.length; i++) {
				if($('#bg-'+f.video[i]).length) {
					$('#bg-'+f.video[i]).fadeOut(anit);
					$('#bg-'+f.video[i])[0].pause();
				}
			}
		}
	}
	$('#'+e[0]).attr('data-menu-position',f.position);
	$('#'+e[1]).attr('data-menu-position',t.position);
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
	currentMenu = e[1];
	if(currentMenu != "serverbrowser" && e[0] != "serverbrowser") {
		browsing = 0;
	}
}*/

var KDdata = [{
		value: 1,
		color: "#c02020",
		highlight: "#ed5c5c",
		label: "Deaths"
    }, {
		value: 1,
		color: "#214EC0",
		highlight: "#5575b7",
		label: "Kills"
    }],
	ctx = $("#player-kd-chart")[0].getContext("2d"),
	KDchart = new Chart(ctx).Doughnut(KDdata, {
		segmentShowStroke: false,
		percentageInnerCutout: 75,
		animationEasing: "easeInQuad"
	}),
	last_back = "",
	last_menu = "";

function playerInfo(name) {
	if (name != "user") {
		$.getJSON("http://" + servers[selectedserver].address, function(info) {
			for (var i = 0; i < info.players.length; i++) {
				if (info.players[i].name == name) {
					KDchart.segments[0].value = info.players[i].deaths > 0 ? info.players[i].deaths : 1;
					KDchart.segments[1].value = info.players[i].kills > 0 ? info.players[i].kills : 1;
					KDchart.update();
					var kdr = info.players[i].kills / info.players[i].deaths;

					if (!isFinite(kdr))
						kdr = info.players[i].kills;
					if (isNaN(kdr))
						kdr = 0;
					$('#player-kd-display').text(kdr.toFixed(2));
					$('#player-name').text(name);
					$('#player-level-display').text("Level 39");
					$('#player-rank-display').css('background', "url('img/ranks/39.png') no-repeat center center/72px 72px");
					$('#player-armor').css('background', "url('img/players/user.png') no-repeat 0 -50px/320px 704px");
					if (info.nameplate) {
						$('#player-title').css('background-image', "");
					} else {
						$('#player-title').css('background-image', "");
					}
				}
			}
		});
	} else {
		KDchart.segments[0].value = 1;
		KDchart.segments[1].value = 1;
		KDchart.update();
		$('#player-kd-display').text("0.00");
		$('#player-name').text(user.name);
		$('#player-level-display').text("Level " + user.rank);
		$('#player-rank-display').css('background', "url('img/ranks/" + user.rank + ".png') no-repeat center center/72px 72px");
		$('#player-armor').css('background', "url('img/players/user.png') no-repeat 0 -50px/320px 704px");
		$('#player-title').css('background-image', "");
	}
}


function hasMap(map) {
    if(mapList[0].length == 0) {
        return true;
    } else if($.inArray(map, mapList[0]) > -1) {
        return true;
    } else {
        return false;
    }
}

function startgame(ip, mode, pass) {
	if (!dewRconConnected && !hook) {
		dewAlert({
			title: "Not Connected",
			content: 'You must be connected to the game to join or start a server.',
			acceptText: "OK"
		});
		$('#notification')[0].currentTime = 0;
		$('#notification')[0].play();
		return;
	}
	if (!hasMap(currentServer.mapFile)) {
		var map = getMapName(currentServer.mapFile);
		dewAlert({
			title: "Missing Map",
			content: "You don't have " + ((map == "Edge" && currentServer.mapFile != "s3d_edge") ? currentServer.map : map) + ". Try finding it at <a href='https://www.reddit.com/r/HaloOnline/'>https://www.reddit.com/r/HaloOnline/</a>",
			acceptText: "OK"
		});
		return;
	}

	loopPlayers = false;
	var password = pass;
	if (mode[0] === "JOIN" && pass == "")
		password = currentServer.password == true ? prompt(currentServer.name + " has a password, enter the password to join", "") : "";

	if ((typeof currentServer.players !== 'undefined' && typeof currentServer.players.current !== 'undefined'&& currentServer.players.current == currentServer.players.max) || (typeof currentServer.numPlayers !== 'undefined' && currentServer.numPlayers == currentServer.maxPlayers)) {
		dewAlert({
			title: "Server Full",
			content: 'This server is full, try joining a different one.',
			acceptText: "OK"
		});
		$('#notification')[0].currentTime = 0;
		$('#notification')[0].play();
		return;
	}

	if (party.length > 1) {
		if ((typeof currentServer.players !== 'undefined' && (currentServer.players.current + party.length) == currentServer.players.max) || (typeof currentServer.numPlayers !== 'undefined' && (currentServer.numPlayers + party.length) == currentServer.maxPlayers)) {
			dewAlert({
				title: "Not Enough Slots",
				content: 'There are not enough slots for your party, try joining a different one.',
				acceptText: "OK"
			});
			$('#notification')[0].currentTime = 0;
			$('#notification')[0].play();
			return;
		}

		if (party[0].split(':')[1] == puid) {
			for (var i = 0; i < party.length; i++ ) {
				if (party[i].split(':')[1] == puid)
					continue;

				friendServer.send(JSON.stringify({
					type: 'connect',
					guid: party[i].split(':')[1],
					address: ip,
					password: password
				}));
			}
		}
	}
	$('#beep')[0].play();
	setTimeout(function() {
		$('#beep')[0].play();
	}, 1000);
	setTimeout(function() {
		$('#beep')[0].play();
	}, 2000);
	setTimeout(function() {
		$('#beeep')[0].play();
	}, 3000);
	$('#music')[0].pause();
	$('#black').fadeIn(3000);
	delay(function() {
		if (mode[0] === "JOIN") {
			//$('#hoImage').css('background-image','url(./img/' + settings.logo.labels[settings.logo.current] + '.png)');
			dewRcon.send('connect ' + ip + ' ' + password, function (ret) {
				if (!ret.contains("Attempting")) {
					$.snackbar({
						content: ret
					});

					$('#loading').hide();
					$('#black').hide();
					backButton.appendTo('body');
					$.snackbar({
						content: 'Failed to connect to server.'
					});
					$('#notification')[0].currentTime = 0;
					$('#notification')[0].play();

					return;
				}
			});
			if (currentServer.status != "InLobby") {
				$('#loadingMapName').text(currentServer.map.toString().toUpperCase().replace("BUNKERWORLD", "STANDOFF"));//lazy
				$('#loadingMapImage').css('background-image', 'url(./img/loading/maps/' + getMapName(currentServer.mapFile.toString()).replace(/ /g,"").toLowerCase() + '.jpg)');
				$('#loadingGametypeImage').css('background-image', 'url(./img/gametypes/' + currentServer.variantType.toString().capitalizeFirstLetter() + '.png)');
				$('#mapOverlay').css('background-image', 'url(./img/loading/maps/' + currentServer.map.toString().replace(/ /g,"").toLowerCase() + '-overlay.png)');
				$('#mapOverlay').css('opacity', '0.8');
				$('#loading').show();
				$('#back').hide();
				setTimeout(function() {
					dewRcon.send('Game.SetMenuEnabled 0');
				}, 10000);
			} else {
				dewRcon.send('Game.SetMenuEnabled 0');
			}
		} else if (mode[1] === "FORGE") {
			$('#loadingMapName').text(currentServer.map.toString().toUpperCase());
			$('#loadingMapImage').css('background-image', 'url(./img/loading/maps/' + currentServer.map.toString().replace(/ /g,"").toLowerCase() + '.jpg)');
			$('#loadingGametypeImage').css('background-image', 'url(./img/gametypes/' + currentServer.variantType.toString().capitalizeFirstLetter() + '.png)');
			$('#mapOverlay').css('background-image', 'url(./img/loading/maps/' + currentServer.map.toString().replace(/ /g,"").toLowerCase() + '-overlay.png)');
			$('#loading').show();
			$('#back').hide();
			dewRcon.send('game.forceload ' + getMapFile($('#currentmap').text().toString().toLowerCase()) + ' 5')
		} else if (mode[0] === "START" && mode[1] === "GAME") {
			dewRcon.send('start');
		}
	}, 3700);
}

var delay = (function() {
	var timer = 0;
	return function(callback, ms) {
		clearTimeout(timer);
		timer = setTimeout(callback, ms);
	};
})();

function filterServers() {
	$('.server').each(function() {
		$(this).hide();
		var content = $(this).text(),
			mapFilter = new RegExp(sortMap, "i"),
			typeFilter = new RegExp(sortType, "i"),
			isMap = content.match(mapFilter),
			isType = content.match(typeFilter),
			isFull,
			isLocked,
			isSprint;
		if (sortFull) {
			var full = $(this).children('.players').text(),
				numbers = full.split("/");
			if (parseInt(numbers[0]) >= parseInt(numbers[1])) {
				isFull = true;
			} else {
				isFull = false;
			}
		} else {
			isFull = false;
		}
		if (sortLocked) {
			if ($(this).hasClass('passworded')) {
				isLocked = true;
			} else {
				isLocked = false;
			}
		} else {
			isLocked = false;
		}
		if (sortSprint) {
			if ($(this).children('.info').children('.settings').children('.sprint').length) {
				isSprint = true;
			} else {
				isSprint = false;
			}
		} else {
			isSprint = false;
		}
		if (isMap && isType && !isFull && !isLocked && !isSprint) {
			$(this).show();
		}
	});
	if ($('#browser').is(':empty')){
		$('#refresh').trigger('click');
	}
}

function clearFilters() {
	sortMap = "";
	sortType = "";
	sortFull = false;
	sortLocked = false;
	sortSprint = false;
	$('.checkbox').removeClass('checked');
	$('#browser-map').text("Choose Map");
	$('#browser-gametype').text("Choose Gametype");
	$('#clear').fadeOut(anit);
	loadServers();
	filterServers();
}

function changeSettingsMenu(setting) {
	x_axis_function = "settings";
	$('.options-select .selection').removeClass('selected');
	$("[data-setting='" + setting + "']").addClass('selected');
	$('#settings-' + currentSetting).hide().css({
		"left": "310px",
		"opacity": 0
	});
	$('#settings-' + setting).css('display', 'block');
	$('#settings-' + setting).animate({
		"left": "460px",
		"opacity": 1
	}, anit / 8);
	if ($('#back').attr('data-action') != "setting-settings") {
		last_back = $('#back').attr('data-action');
	}
	last_menu = currentMenu;
	currentSetting = setting;
	currentMenu = "settings-" + setting;
	if (usingGamepad) {
		p_gp_on = gp_on;
		gp_on = 1;
		gamepadSelect(currentMenu + "-" + gp_on);
	}
	$('#back').attr('data-action', 'setting-settings');
	debugLog(currentMenu);
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
	$('#back').hide();
}

function changeSettingsBack() {
	x_axis_function = "";
	$('.options-select .selection').removeClass('selected');
	$('#settings-' + currentSetting).hide().css({
		"left": "310px",
		"opacity": 0
	});
	currentSetting = "";
	currentMenu = last_menu;
	if (usingGamepad) {
		gp_on = 1;
		gamepadSelect(last_menu + "-" + gp_on);
	}
	$('#back').attr('data-action', last_back);
	debugLog(currentMenu);
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
}

function changeMap1(game) {
	$('.map-select .selection').removeClass('selected');
	$("[data-game='" + game + "']").addClass('selected');
	$('.map-select').css({
		"left": "100px"
	});
	$('#maps-' + currentGame).hide().css({
		"left": "310px",
		"opacity": 0
	});
	$('#maps-' + game).css('display', 'block');
	$('#maps-' + game).animate({
		"left": "360px",
		"opacity": 1
	}, anit / 8);
	currentGame = game;
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
}

function getGame(game) {
	switch (game) {
		case "haloce":
			return "Halo Combat Evolved";
		case "hcea":
			return "Halo Anniversary";
		case "halo2":
			return "Halo 2";
		case "h2a":
			return "Halo 2 Anniversary";
		case "halo3":
			return "Halo 3";
		case "odst":
			return "Halo 3 ODST";
		case "reach":
			return "Halo Reach";
		case "online":
			return "Halo Online";
		case "halo5":
			return "Halo 5";
	}
}

function getMapFile(name) {
	if (typeof name != 'undefined') {
		switch (name.toString().toLowerCase()) {
			case "guardian":
				return "guardian";
			case "valhalla":
				return "riverworld";
			case "diamondback":
				return "s3d_avalanche";
			case "edge":
				return "s3d_edge";
			case "reactor":
				return "s3d_reactor";
			case "icebox":
				return "s3d_turf";
			case "high ground":
				return "deadlock";
			case "narrows":
				return "chill";
			case "the pit":
				return "cyberdyne";
			case "sandtrap":
				return "shrine";
			case "standoff":
				return "Bunkerworld";
			case "Hangem-High CE":
				return "hangem-high";
		}
		return "";
	}
}

function changeMap2(map, click) {
	$('#map-thumb').css({
		"background-image": "url('img/maps/" + map.toString().toUpperCase() + ".jpg')"
	});
	$('#map-thumb-options').css({
		"background-image": "url('img/maps/" + map.toString().toUpperCase() + ".jpg')"
	});
	$('#currentmap').text(map);
	$('#map-name-options').text(map);
	$('#map-info-options').text(maps[currentGame][map]);
	$('.map-select2 .selection').removeClass('selected');
	$("[data-map='" + map + "']").addClass('selected');
	if ($('#start').children('.label').text() != "JOIN GAME" && dewRconConnected)
		dewRcon.send('map ' + getMapFile($('#currentmap').text()));
	if (browsing === 1 && click === true) {
		$('#browser-map').text(map.toTitleCase());
		changeMenu("options,serverbrowser,fade");
		sortMap = map;
		$('#clear').show();
		filterServers();
	} else if (click === true) {
		changeMenu("options,customgame,fade");
	}
}

function getMapId(map) {
	switch (map.toString().toLowerCase()) {
		case "diamondback":
			return 0;
		case "edge":
			return 1;
		case "icebox":
			return 3;
		case "reactor":
			return 4;
		case "valhalla":
			return 5;
	}
}

function changeType1(maintype) {
	$('.type-select .selection').removeClass('selected');
	$("[data-maintype='" + maintype + "']").addClass('selected');
	$('.type-select').css({
		"left": "100px"
	});
	$('#types-' + currentType.replace(/\s/g, "")).hide().css({
		"left": "310px",
		"opacity": 0
	});
	$('#types-' + maintype.replace(/\s/g, "")).css('display', 'block');
	$('#types-' + maintype.replace(/\s/g, "")).animate({
		"left": "360px",
		"opacity": 1
	}, anit / 8);
	currentType = maintype;
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
}

function changeSong1(game) {
	if (!online)
		return;
	$('.music-select .selection').removeClass('selected');
	$("[data-game='" + game + "']").addClass('selected');
	$('.music-select').css({
		"left": "100px"
	});
	$('#songs-' + currentAlbum.replace(/\s/g, "")).hide().css({
		"left": "310px",
		"opacity": 0
	});
	$('#songs-' + game.replace(/\s/g, "")).css('display', 'block');
	$('#songs-' + game.replace(/\s/g, "")).animate({
		"left": "360px",
		"opacity": 1
	}, anit / 8);
	$('#music-album-cover').css({
		"background-image": "url('img/album/" + game + ".jpg')"
	});
	currentAlbum = game;
	if ($('#back').attr('data-action') != "setting-settings") {
		last_back = $('#back').attr('data-action');
	}
	last_menu = currentMenu;
	currentMenu = "songs-" + currentAlbum;
	if (usingGamepad) {
		p_gp_on = gp_on;
		gp_on = 1;
		gamepadSelect(currentMenu + "-" + gp_on);
	}
	$('#back').attr('data-action', 'setting-settings');
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
}

function changeSong2(song) {
	var directory = settings.localmusic.current == 1 ? "music/" : "http://music.thefeeltra.in/";
	songIndex = songs[currentAlbum].indexOf(song);
	thisSong = songs[currentAlbum][songIndex];
	nextSong = songs[currentAlbum][songIndex + 1];
	if (songIndex + 1 >= songs[currentAlbum].length) {
		nextSong = songs[currentAlbum][0];
	}
	$('.music-select2 .selection').removeClass('selected');
	$("[data-song='" + song + "']").addClass('selected');
	$('#music').attr('src', directory + currentAlbum + "/" + song + '.ogg');
	localStorage.setItem('song', song);
	localStorage.setItem('album', currentAlbum);
	$.snackbar({
		content: 'Now playing ' + song + ' from ' + getGame(currentAlbum) + '.'
	});
	$('#notification')[0].currentTime = 0;
	$('#notification')[0].play();
}

function changeType2(type, click) {
	if (currentType.contains(" ")) {
		var reg = currentType.match(/\b(\w)/g);
		var acronym = reg.join('');
		$('#gametype-icon').css({
			"background-image": "url('img/gametypes/" + acronym.toString().toLowerCase() + ".png')"
		});
		$('#type-icon-options').css({
			"background-image": "url('img/gametypes/" + acronym.toString().toLowerCase() + ".png')"
		});
	} else {
		$('#gametype-icon').css({
			"background-image": "url('img/gametypes/" + (currentType === "ctf" || currentType === "koth") ? currentType : currentType.toString().capitalizeFirstLetter + ".png')"
		});
		$('#type-icon-options').css({
			"background-image": "url('img/gametypes/" + (currentType === "ctf" || currentType === "koth") ? currentType : currentType.toString().capitalizeFirstLetter + ".png')"
		});
	}
	debugLog(type);
	if (dewRconConnected) {
		dewRcon.send('gametype ' + type.toString().toLowerCase().replace(" ", "_"));
	}
	if (type == "")
		type = "Slayer";
	$('#gametype-display').text(type.toUpperCase());
	$('#type-name-options').text(type.toUpperCase());
	$('#type-info-options').text(gametypes[currentType][type]);
	$('.type-select2 .selection').removeClass('selected');
	$("[data-type='" + type + "']").addClass('selected');
	if (browsing === 1 && click === true) {
		$('#browser-gametype').text(type.toTitleCase());
		changeMenu("options,serverbrowser,fade");
		sortType = type;
		$('#clear').show();
		filterServers();
	} else if (click === true) {
		changeMenu("options,customgame,fade");
	}
}

function popup(message) {
	$('#popup').text(message);
	$('#popup').fadeIn(anit);
	setTimeout(function() {
		$('#popup').fadeOut(anit);
	}, 8000);
}
