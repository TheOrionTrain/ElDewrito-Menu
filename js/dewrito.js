/*
    (c) 2015 Brayden Strasen & Ryan Palmer
    http://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var players = [],
	serverz = [],
	track = 5,
	anit = 400,
	currentGame = "HaloOnline",
	currentType = "Slayer",
	currentSetting = "menu",
	currentAlbum = isset(localStorage.getItem('album'), "halo3"),
	currentServer,
	selectedserver,
	loopPlayers,
	servers,
	scale = 1,
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
	videoURL = "http://158.69.166.144/video/",
	online = true,
	last_back = "",
	last_menu = "",
	pings = [],
	previous = {},
	infoIP = "http://158.69.166.144:8081",
	totallyLoopingPlayers = setInterval(totalPlayersLoop,10000),
	settingsToLoad = [
		['gamemenu', 'game.menuurl'],
		['username', 'player.name'],
		['servername', 'server.name'],
		['centeredcrosshair', 'camera.crosshair'],
		['fov', 'camera.fov'],
		['starttimer', 'server.countdown'],
		['maxplayers', 'server.maxplayers'],
		['serverpass', 'server.password'],
		['rawinput', 'input.rawinput'],
		['saturation', 'graphics.saturation'],
		['gameversion', 'game.version'],
		['maplist', 'game.listmaps']
	],
	loadedSettings = false,
	mapList;

(function() {
	if (window.location.protocol == "https:") {
		alert("The server browser doesn't work over HTTPS, switch to HTTP if possible.");
	}
})();

function getServers(browser) {
	Controller.deselect();
	servers = [];
	Controller.servers = 0;
	Controller.selected = 0;
	for (var i = 0; i < serverz.servers.length; i++) {
		queryServer(serverz.servers[i], i, browser);
	}
}

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
	if(Menu.maps[filename]) {
		return Menu.maps[filename];
	} else {
		return "Edge";
	}
}

function addServer(i) {
	if (servers[i].map == "")
		return;
	++Controller.servers;
	var on = (!servers[i].variant) ? "" : "on";
	servers[i].location_flag = typeof servers[i].location_flag == 'undefined' ? "[" : servers[i].location_flag;
	servers[i].ping = servers[i].ping || 0;
	var sprint = (servers[i].sprintEnabled == 1) ? "<img class='sprint' src='img/sprint.svg'>" : " ";

	$('#browser').append("<div data-gp='serverbrowser-" + Controller.servers + "' class='server" + ((servers[i].password) ? " passworded" : "") + " ' id='server" + i + "' data-server=" + i + "><div class='thumb'><img src='img/maps/" + getMapName(servers[i].mapFile).toString().toUpperCase() + ".jpg'></div><div class='info'><span class='name'>" + ((servers[i].password) ? "[LOCKED] " : "") + servers[i].name + " (" + servers[i].host + ")  " + servers[i].location_flag + "<span id='ping-" + i + "'>"+servers[i].ping+"</span>ms]</span><span class='settings'>" + servers[i].variant + " " + on + " " + servers[i].map.replace("Bunkerworld", "Standoff") +sprint+"<span class='elversion'>" + servers[i].eldewritoVersion + "</span></span></div><div class='players'>" + servers[i].players.current + "/" + servers[i].players.max + "</div></div>");
	$('.server').hover(function() {
		Audio.click.currentTime = 0;
		Audio.click.play();
		Controller.select($(this).attr('data-gp'));
	});
	$('.server').unbind().click(function() {
		Lobby.join($(this).attr('data-server'));
	});
	filterServers();
	if (Controller.servers == 1) {
		Controller.select('serverbrowser-1');
	}
}

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
	$.getJSON("http://tracks.thefeeltra.in/update", function(data) {
		console.log(data);
	});
	var set, b, g, i, e;
	$.getJSON("http://music.thefeeltra.in/music.json", function(j) {
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
			Audio.click.currentTime = 0;
			Audio.click.play();
		});
		$('.music-select2 .selection').hover(function() {
			Audio.click.currentTime = 0;
			Audio.click.play();
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
}

function changeSetting(s, by) {
	Audio.click.currentTime = 0;
	Audio.click.play();
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
		browsing = 0;
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span class='numbers'><span id='joined'>0</span>/<span id='maxplayers'>0</span></span></td></tr>");
		if((typeof d.players !== 'undefined' && typeof d.players.current !== 'undefined' && d.players.current == d.players.max) || (typeof d.numPlayers !== 'undefined' && d.numPlayers == d.maxPlayers)) {
			dewAlert({
				title: "Server Full",
				content: 'This server is full, try joining a different one.',
				acceptText: "OK"
			});
			Audio.notification.currentTime = 0;
			Audio.notification.play();
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
		Audio.slide.currentTime = 0;
		Audio.slide.play();
}

function loadParty() {
	if(party !== previous.party) {
		$('#party').empty();
		$('#current-party').empty().append("<tr class='top' hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='info' colspan='2'>Current Party <span class='numbers'><span id='current-party-count'>"+party.length+"</span>/16</span></td></tr>");
		if(party.length > 0) {
			for(var i=0; i < party.length; i++) {
				$('#party').append("<div class='friend'>"+party[i].name+"</div>");
				var isDev = (developers.indexOf(party[i].guid) >= 0) ? "developer" : "";
				addPlayer('current-party', {
					name: party[i].name,
					guid: party[i].guid,
					colour: party[i].colour,
					rank: 0
				}, isDev);
			}
			$('.friend,#friend-add,#friend-remove').hover(function() {
				Audio.click.currentTime = 0;
				Audio.click.play();
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
			if (((!friends[o].contains(":0x") || friends[o].contains(":n")) && friends[o] == onlinePlayers[i].name) || (onlinePlayers[i].guid == friends[o].guid && onlinePlayers[i].name != friends[o].name)) {
				friends[o] = onlinePlayers[i].name + ":" + onlinePlayers[i].guid;
				localStorage.setItem("friends", JSON.stringify(friends));
			}
		}
	}
}

function getPlayerColour(guid) {
	if (guid == "000000")
		return "#BDBDBD";
	if (guid == puid)
		return colour;
	for (var i = 0; i < onlinePlayers.length; i++) {
		if (guid == onlinePlayers[i].guid) {
			return(onlinePlayers[i].colour === 'undefined' || onlinePlayers[i].colour.length < 1 || onlinePlayers[i].colour === null) ? "#000000" : onlinePlayers[i].colour;
		}
	}
	return "#000000";
}

function addPlayer(id, player, isDev, opacity) {
	$('<tr>', {
		'hex-color': player.colour,
		'data-color': hexToRgb(player.colour, 0.5),
		'style': 'background:' + hexToRgb(player.colour, 0.5) + ';' + (opacity ? 'opacity:' + opacity : null),
		html: $('<td>', {
			class: 'name ' + isDev,
			text: player.name
		})
	}).hover(function() {
		Audio.click.currentTime = 0;
		Audio.click.play();
	}).mouseover(function() {
		var n = $(this).attr('id'),
			col = $(this).attr('hex-color'),
			bright = brighter(col);
		$(this).css("background-color", hexToRgb(bright, 0.75));
	}).mouseout(function() {
		var n = $(this).attr('id'),
			col = $(this).attr('hex-color');
		$(this).css("background-color", hexToRgb(col, 0.5));
	}).append(
	$('<td>', {
		class: 'rank',
		html: $('<img>', {
			src: 'img/ranks/reach/' + player.rank + '.png'
		})
	})).appendTo('#'+id);
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
			var isDev = (developers.indexOf(friends[i].split(':')[1]) >= 0) ? "developer" : "";
			addPlayer('friends-on', {
				name: friends[i].split(':')[0],
				guid: friends[i].split(':')[1],
				colour: getPlayerColour(friends[i].split(':')[1]),
				rank: 0
			}, isDev);
		}
	}
	$('#friends-online').text(friends_online+" " + (friends_online == 1 ? "Friend" : "Friends") + " Online");
	$('#friends-on-count').text(friends_online);
	if(friends_online === 0) {$('#friends-on').empty();}
	$('#friends-on-total').text(friends.length);
	$('.friend,#friend-add,#friend-remove,#lobby-container table tr').hover(function() {
		Audio.click.currentTime = 0;
		Audio.click.play();
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
		Audio.slide.currentTime = 0;
		Audio.slide.play();
	});

	$('#party .friend, #current-party td.name').unbind().click(function(e) {
		if ($(this).text() != pname) {
			partysubmenu("show",$(this).text(),e);
			Audio.slide.currentTime = 0;
			Audio.slide.play();
		}
	});
}

function getPlayerName(UID) {
	for (var i = 0; i < onlinePlayers.length; i++) {
		if (onlinePlayers[i].guid == UID)
			return onlinePlayers[i].name;
	}
	return "";
}

function getPlayerUID(name) {
	for (var i = 0; i < onlinePlayers.length; i++) {
		if (onlinePlayers[i].name == name)
			return onlinePlayers[i].guid;
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
		if ((friend.contains(":0x") && (onlinePlayers[i].guid == friend.split(':')[1])) | onlinePlayers[i].name == friend || (typeof serverz.players[friend.contains(":0x") ? friend.split(':')[0] : friend] != 'undefined'))
			return true;
	}
	return false;
}

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

	Mousetrap.bind('a', function() {$(".control-A").trigger('click');});
	Mousetrap.bind('b', function() {$(".control-B").trigger('click');});
	Mousetrap.bind('x', function() {$(".control-X").trigger('click');});
	Mousetrap.bind('y', function() {$(".control-Y").trigger('click');});
	Mousetrap.bind('up', function() {Controller.backward();});
	Mousetrap.bind('down', function() {Controller.forward();});

	$('#main-menu').click(function() {
        Menu.change("main");
		$('#main').show();
        $('#main2').hide();
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
		Audio.slide.currentTime = 0;
		Audio.slide.play();
		addFriend($('#friend-input').val());
	});
	$('#click-menu li').click(function() {
		submenu($(this).attr('data-action'),$('#click-menu').attr('data-friend'));
	});
	$('#click-menu li').hover(function() {
		Audio.click.currentTime = 0;
		Audio.click.play();
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
		Controller.selected = b;
		Controller.select(Menu.selected + "-" + Controller.selected);
	});
	$('*[data-gp]').mouseout(function() {
		Controller.selected = 0;
		Controller.select(Menu.selected + "-" + Controller.selected);
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
	Controller.bind();
	Mousetrap.bind('f11', function() {
		setTimeout(function() {
			if (dewRconConnected)
				dewRcon.send('Game.SetMenuEnabled 0');
			else
				dew.hide();
		}, anit);
	});
	initialize();
	Audio.notification.currentTime = 0;
	Audio.notification.play();
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
		Audio.slide.currentTime = 0;
		Audio.slide.play();
	});
	$('#friends-close').click(function() {
		$('#friendslist').css('right','-250px');
		$('#friends-online').fadeIn(anit);
		Audio.slide.currentTime = 0;
		Audio.slide.play();
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
		var ip = prompt("Enter IP Address: ");
		Lobby.joinIP(ip);
	});
	$('#quit').click(function() {
		dewRcon.send('Game.SetMenuEnabled 0');
	});
	$('#clear').click(function() {
		clearFilters();
	});
	$('#version').click(function() {
		clearAllCookies();
	});
	var e = ((window.innerHeight - $('#menu').height()) / 2) - 40;
	Audio.connect.volume = settings.musicvolume.current * 0.01;
	$('#music')[0].volume = settings.musicvolume.current * 0.01;
	Audio.click.volume = settings.sfxvolume.current * 0.01;
	Audio.notification.volume = settings.sfxvolume.current * 0.01;
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
		Audio.click.currentTime = 0;
		Audio.click.play();
		$('.selection').removeClass('gp-on');
		$(this).addClass("gp-on");
		Controller.selected = $(this).attr('data-gp').split("-")[1];
		Controller.select(Menu.selected + "-" + Controller.selected);
		$('#description').text(Menu.description[$(this).attr('data-gp')]);
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
	$('#back-options').click(function() {
		changeMenuOptions($(this).attr('data-action'),1);
		Controller.selected = Controller.previous;
		Controller.select(Menu.selected + "-" + Controller.previous);
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
			Audio.click.currentTime = 0;
			Audio.click.play();
		});
		$('.server').click(function() {
			Lobby.join($(this).attr('data-server'));
		});
		filterServers();
	}
}

function totalPlayersLoop() {
	$.getJSON(infoIP+"/all", function(data) {
		serverz = data;
		for (var i=0; i<serverz.servers.length; i++) {
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

function joinServer(details) {
	var d = servers[details];
	if ((typeof d.players !== 'undefined' && typeof d.players.current !== 'undefined' && d.players.current != d.players.max) || (typeof d.numPlayers !== 'undefined' && d.numPlayers != d.maxPlayers)) {
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
		Audio.slide.currentTime = 0;
		Audio.slide.play();
	}
	$('#back').hide();
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
		Audio.notification.currentTime = 0;
		Audio.notification.play();
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
		Audio.notification.currentTime = 0;
		Audio.notification.play();
		return;
	}

	if (party.length > 1) {
		if ((typeof currentServer.players !== 'undefined' && (currentServer.players.current + party.length) == currentServer.players.max) || (typeof currentServer.numPlayers !== 'undefined' && (currentServer.numPlayers + party.length) == currentServer.maxPlayers)) {
			dewAlert({
				title: "Not Enough Slots",
				content: 'There are not enough slots for your party, try joining a different one.',
				acceptText: "OK"
			});
			Audio.notification.currentTime = 0;
			Audio.notification.play();
			return;
		}

		if (party[0].guid == puid) {
			for (var i = 0; i < party.length; i++ ) {
				if (party[i].guid == puid)
					continue;

				friendServer.send(JSON.stringify({
					type: 'connect',
					guid: party[i].guid,
					address: ip,
					password: password
				}));
			}
		}
	}
	Audio.beep.play();
	setTimeout(function() {
		Audio.beep.play();
	}, 1000);
	setTimeout(function() {
		Audio.beep.play();
	}, 2000);
	setTimeout(function() {
		Audio.beeep.play();
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
					Audio.notification.currentTime = 0;
					Audio.notification.play();

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
	Controller.previous = Controller.selected;
	Controller.selected = 1;
	Controller.select(currentMenu + "-" + Controller.selected);
	$('#back').attr('data-action', 'setting-settings');
	Audio.slide.currentTime = 0;
	Audio.slide.play();
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
	Controller.selected = 1;
	Controller.select(last_menu + "-" + Controller.selected);
	$('#back').attr('data-action', last_back);
	Audio.slide.currentTime = 0;
	Audio.slide.play();
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
	Audio.slide.currentTime = 0;
	Audio.slide.play();
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
	for(var i=0; i < Object.keys(Menu.maps).length; i++) {
		if(Menu.maps[Object.keys(Menu.maps)[i]] == name) {
			return Object.keys(Menu.maps)[i];
		}
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
	Audio.slide.currentTime = 0;
	Audio.slide.play();
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
	Controller.previous = Controller.selected;
	Controller.selected = 1;
	Controller.select(currentMenu + "-" + Controller.selected);
	$('#back').attr('data-action', 'setting-settings');
	Audio.slide.currentTime = 0;
	Audio.slide.play();
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
	Audio.notification.currentTime = 0;
	Audio.notification.play();
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
