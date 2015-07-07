/*
    (c) 2015 Brayden Strasen & Ryan Palmer
    https://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var players = [],
	joined = 0,
	track = 5,
	scale = 1,
	anit = 400,
	currentGame = "HaloOnline",
	currentType = "Slayer",
	currentSetting = "menu",
	selectedserver,
	loopPlayers,
	host = 1,
	forge = 0,
	servers,
	network = "offline",
	browsing = 0,
	sortMap,
	sortType,
	Halo3Index = 2,
	currentVersion;

function isset(val, other) {
	return (val !== undefined) ? val : other;
}

function randomNum(n) {
	return Math.floor(Math.random() * n);
}

function getServers() {
	servers = [];
	$.getJSON("http://192.99.124.162/list", function(data) {
		if (data.result.code !== 0) {
			alert("Error received from master: " + data.result.msg);
			return;
		}
		for (var i = 0; i < data.result.servers.length; i++) {
			var serverIP = data.result.servers[i];
			if (!serverIP.toString().contains("?"))
				queryServer(serverIP, i);
		}
	});
}

function queryServer(serverIP, i) {
	$.getJSON("http://" + serverIP, function(serverInfo) {
		if(typeof serverInfo.maxPlayers != "number" || typeof serverInfo.numPlayers != "number") {
			return false;
		}
		var startTime = (new Date()).getTime(),
			endTime;

		$.ajax({
			type: "GET",
			url: "http://" + serverIP + "/",
			async: false,
			success: function() {
				endTime = (new Date()).getTime();
			}
		});
		var isPassworded = serverInfo.passworded !== undefined;
		if (serverInfo.map !== "") {
			if (isPassworded) {
				servers[i] = {
					"ip": removeTags(serverIP),
					"name": "[PASSWORDED] " + removeTags(serverInfo.name),
					"gametype": removeTags(serverInfo.variant),
					"gameparent": removeTags(serverInfo.variantType),
					"map": removeTags(getMapName(serverInfo.mapFile)),
					"players": {
						"max": serverInfo.maxPlayers,
						"current": serverInfo.numPlayers
					},
					"password": true
				};
			} else {
				servers[i] = {
					"ip": removeTags(serverIP),
					"name": removeTags(serverInfo.name),
					"gametype": removeTags(serverInfo.variant),
					"gameparent": removeTags(serverInfo.variantType),
					"map": removeTags(getMapName(serverInfo.mapFile)),
					"players": {
						"max": serverInfo.maxPlayers,
						"current": serverInfo.numPlayers
					}
				};
			}
		}
		if (typeof servers[i] !== 'undefined') {
			ip = serverIP.substring(0, serverIP.indexOf(':'));
			var on = (servers[i].gametype === "") ? "" : "on";
			$('#browser').append("<div class='server' id='server" + i + "' data-server=" + i + "><div class='thumb'><img src='img/maps/" + servers[i].map.toString().toUpperCase() + ".png'></div><div class='info'><span class='name'>" + servers[i].name + " (" + serverInfo.hostPlayer + ")  [" + (endTime - startTime) + "ms]</span><span class='settings'>" + servers[i].gametype + " " + on + " " + servers[i].map + "</span></div><div class='players'>" + servers[i].players.current + "/" + servers[i].players.max + "</div></div>");
			$('.server').hover(function() {
				$('#click')[0].currentTime = 0;
				$('#click')[0].play();
			});
			$('.server').click(function() {
				selectedserver = $(this).attr('data-server');
				changeMenu("serverbrowser-custom", $(this).attr('data-server'));
			});
			filterServers();
		}
	});
}

var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

var tagOrComment = new RegExp(
    '<(?:'
    // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
    // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
    // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi');
function removeTags(html) {
	console.log("REMOVED TAGS");
  var oldHtml;
  do {
    oldHtml = html;
    html = html.replace(tagOrComment, '');
  } while (html !== oldHtml);
  return html.replace(/</g, '');
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
	}
}

String.prototype.capitalizeFirstLetter = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.contains = function(it) {
	return this.indexOf(it) != -1;
};

function promptPassword(i) {
	var password = prompt(servers[i].name + " has a password, enter the password to join", "");
	if (password !== null) {
		window.open("dorito:" + servers[i].ip + "/" + password);
	}
}

function addServer(ip, isPassworded, name, host, map, mapfile, gamemode, status, numplayers, maxplayers) {
	var servName = "<td><a href=\"dorito:" + ip + "\">" + name + " (" + host + ")</a></td>";
	if (isPassworded)
		servName = "<td><a href=\"#\" onclick=\"promptPassword('" + ip + "');\">[PASSWORDED] " + name + " (" + host + ")</a></td>";

	var servMap = "<td>" + map + " (" + mapfile + ")</td>";
	var servType = "<td>" + gamemode + "</td>";
	var servStatus = "<td>" + status + "</td>";
	var servPlayers = "<td>" + numplayers + "/" + maxplayers + "</td>";

	$('#serverlist tr:last').after("<tr>" + servName + servMap + servType + servStatus + servPlayers + "</tr>");
}

function initalize() {
	getTotalPlayers();
	totalPlayersLoop();
	if (window.location.protocol == "https:") {
		alert("The server browser doesn't work over HTTPS, switch to HTTP if possible.");
	}
	var set, b, g, i, e;
	for (i = 0; i < Object.keys(settings).length; i++) {
		set = Object.keys(settings)[i];
		var category = settings[set].category;
		if (settings[set].typeof == "select") {
			$('#settings-' + category).append("<div data-option='" + set + "' class='selection'><span class='label'>" + settings[set].name + "</span><span class='left'></span><span class='value'>...</span><span class='right'></span></div>");
		}
		if (settings[set].typeof == "input") {
			$('#settings-' + category).append("<div data-option='" + set + "' class='selection'><span class='label'>" + settings[set].name + "</span><span class='input'><input type='text' maxlength=40 /></span></div>");
		}
		if (settings[set].typeof == "color") {
			$('#settings-' + category).append("<div data-option='" + set + "' class='selection'><span class='label'>" + settings[set].name + "</span><span class='input'><input id='option-" + set + "'/></span></div>");
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
					console.log(color.toHexString());
				}
			});
		}
		settings[set].update();
	}
	for (i = 0; i < Object.keys(maps).length; i++) {
		b = Object.keys(maps)[i];
		$('#choosemap').children('.map-select').append("<div data-game='" + b + "' class='selection'><span class='label'>" + maps[b].name + "</span></div>");
		$('#choosemap').append("<div class='map-select2 animated' id='maps-" + b + "'></div>");
		$(".map-select2").mousewheel(function(event, delta) {
			this.scrollTop -= (delta * 5);
			event.preventDefault();
		});
		for (e = 1; e < Object.keys(maps[b]).length; e++) {
			g = Object.keys(maps[b])[e];
			$('#maps-' + b).append("<div data-map='" + g + "' class='selection'><span class='label'>" + g + "</span></div>");
		}
	}
	for (i = 0; i < Object.keys(gametypes).length; i++) {
		b = Object.keys(gametypes)[i];
		$('#choosetype').children('.type-select').append("<div data-maintype='" + b + "' class='selection'><span class='label'>" + b.toUpperCase() + "</span></div>");
		$('#choosetype').append("<div class='type-select2 animated' id='types-" + b.replace(/\s/g, "") + "'></div>");
		$(".type-select2").mousewheel(function(event, delta) {
			this.scrollTop -= (delta * 5);
			event.preventDefault();
		});
		for (e = 0; e < Object.keys(gametypes[b]).length; e++) {
			g = Object.keys(gametypes[b])[e];
			$('#types-' + b.replace(/\s/g, "")).append("<div data-type='" + g + "' class='selection'><span class='label'>" + g.toUpperCase() + "</span></div>");
		}
	}
}

function changeSetting(s, by) {
	$('#click')[0].currentTime = 0;
	$('#click')[0].play();
	var e = settings[s];
	if (e.typeof == "select") {
		if (by == 1) {
			if (e.current < e.max) {
				e.current += e.increment;
			} else {
				e.current = e.min;
			}
		} else if (by === 0) {
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
	$.cookie(s, e.current);
}

function toggleNetwork() {
	if (network == "offline") {
		network = "online";
		//callbacks.networkType(1);
	} else {
		network = "offline";
		//callbacks.networkType(2);
	}
	$('#network').text(network.toUpperCase());
	$('#click')[0].currentTime = 0;
	$('#click')[0].play();
}

$(document).ready(function() {
	initalize();
	getCurrentVersion();
	$('#refresh').click(function() {
		loadServers();
		filterServers();
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
	$('#music')[0].volume = settings.musicvolume.current;
	$('#click')[0].volume = settings.sfxvolume.current;
	$('#start').click(function() {
		var mode = $('#start').children('.label').text().toString().split(" ");
		if (mode[1] === "FORGE" || (mode[0] === "START" && mode[1] === "GAME"))
			startgame("127.0.0.1:11775", mode);
		else
			startgame(servers[selectedserver].ip, mode);
	});
	$('.selection').hover(function() {
		$('#click')[0].currentTime = 0;
		$('#click')[0].play();
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
	$('input').focusout(function() {
		var c = $(this).parent('.input').parent('.selection').attr('data-option'),
			val = $(this).val();
		changeSetting(c, val);
	});
	$("[data-action='menu']").click(function() {
		changeMenu($(this).attr('data-menu'));
	});
	$('#back').click(function() {
		changeMenu($(this).attr('data-action'));
	});
	$("#lobby-container").mousewheel(function(event, delta) {
		this.scrollTop -= (delta * 34);
		event.preventDefault();
	});
});

String.prototype.toTitleCase = function() {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

function acr(s) {
	var words, acronym, nextWord;
	words = s.split(' ');
	acronym = "";
	index = 0;
	while (index < words.length) {
		nextWord = words[index];
		acronym = acronym + nextWord.charAt(0);
		index = index + 1;
	}
	return acronym.toUpperCase();
}

function loadServers() {
	$('#refresh img').addClass('rotating');
	$('#browser').hide();
	setTimeout(function() {
		$('#refresh img').removeClass('rotating');
		$('#browser').fadeIn(anit);
	}, 5000);
	$('#browser').empty();
	getServers();
	$('.server').hover(function() {
		$('#click')[0].currentTime = 0;
		$('#click')[0].play();
	});
	$('.server').click(function() {
		changeMenu("serverbrowser-custom", $(this).attr('data-server'));
		selectedserver = $(this).attr('data-server');
	});
	filterServers();
}

function hexToRgb(hex, opacity) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + opacity + ")";
}

function brighter(color) {
	var colorhex = (color.split("#")[1]).match(/.{2}/g);
	for (var i = 0; i < 3; i++) {
		var e = parseInt(colorhex[i], 16);
		e += 30;
		colorhex[i] = ((e > 255) ? 255 : e).toString(16);
	}
	return "#" + colorhex[0] + colorhex[1] + colorhex[2];
}

function lobbyLoop(ip) {
	delay(function() {
		$.getJSON("http://" + ip, function(serverInfo) {
			players = serverInfo.players;
			$('#lobby').empty();
			$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>0</span></td></tr>");
			$('#joined').text(serverInfo.numPlayers);

			changeMap2(getMapName(serverInfo.mapFile));
			$('#subtitle').text(serverInfo.name + " : " + servers[selectedserver].ip);
			if (serverInfo.variant === "") {
				serverInfo.variant = "Slayer";
			}
			$('#gametype-display').text(serverInfo.variant.toUpperCase());
			if (serverInfo.variantType === "none")
				serverInfo.variantType = "slayer";
			$('#gametype-icon').css('background', "url('img/gametypes/" + serverInfo.variantType + ".png') no-repeat 0 0/cover");

			$('#maxplayers').text(serverInfo.maxPlayers);
			for (var i = 0; i < serverInfo.numPlayers; i++) {
				if (typeof players[i] !== 'undefined') {
					$('#lobby').append("<tr id='player" + i + "' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='name'>" + players[i].name + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
				}
			}
			$('#lobby tr').hover(function() {
				$('#click')[0].currentTime = 0;
				$('#click')[0].play();
			});
			$("#lobby tr").mouseover(function() {
				var n = $(this).attr('id'),
					hexes = (n == "user") ? "#000000" : "#000000",
					bright = brighter(hexes);
				$(this).css("background-color", hexToRgb(bright, 0.75));
			}).mouseout(function() {
				var n = $(this).attr('id');
				$(this).css("background-color", (n == "user") ? hexToRgb("#000000", 0.5) : hexToRgb("#000000", 0.5));
			});
			$('#lobby tr').click(function() {
				var e = $(this).children('.name').text(),
					n = $(this).attr('id'),
					nn = "user",
					hexes = (n == "user") ? "#000000" : "#000000",
					bright = brighter(hexes);
				changeMenu("custom-player", e);
				$('#lobby tr').each(function() {
					var color = $(this).attr('data-color');
					$(this).css('background', color);
				});
				$(this).css("background-color", hexToRgb(bright, 0.75));
			});

			if (loopPlayers)
				lobbyLoop(ip);
		});
	}, 3000);
}

function getTotalPlayers() {
	var totalPlayers = 0;
	$.getJSON("http://192.99.124.162/list", function(data) {
		for (var i = 0; i < data.result.servers.length; i++) {
			var serverIP = data.result.servers[i];
			if (!serverIP.toString().contains("?")) {
				$.getJSON("http://" + serverIP, function(serverInfo) {
					if(typeof serverInfo.maxPlayers != "number" || typeof serverInfo.numPlayers != "number") {
						return false;
					}
					totalPlayers += serverInfo.numPlayers;
					$('#players-online').text(totalPlayers + " Players Online");
				});
			}
		}
	});
}

function getCurrentVersion() {
	$.getJSON("http://eriq.co/eldewrito/update", function(data) {
		currentVersion = data.version.toString();
		$('#version').text('eldewrito ' + currentVersion);
	});
}

function totalPlayersLoop() {
	delay(function() {
		var totalPlayers = 0;
		$.getJSON("http://192.99.124.162/list", function(data) {
			for (var i = 0; i < data.result.servers.length; i++) {
				var serverIP = data.result.servers[i];
				if (!serverIP.toString().contains("?")) {
					$.getJSON("http://" + serverIP, function(serverInfo) {
						if(typeof serverInfo.maxPlayers != "number" || typeof serverInfo.numPlayers != "number") {
							return false;
						}
						totalPlayers += serverInfo.numPlayers;
						$('#players-online').text(totalPlayers + " Players Online");
					});
				}
			}
		});
		totalPlayersLoop();
	}, 30000);
}

function playersJoin(number, max, time, ip) {
	$.getJSON("http://" + ip, function(serverInfo) {
		console.log(ip);
		players = serverInfo.players;
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>0</span>/<span id='maxplayers'>0</span></td></tr>");
		$('#maxplayers').text(serverInfo.maxPlayers);
		$('#joined').text(serverInfo.numPlayers);
		for (var i = 0; i < serverInfo.numPlayers; i++) {
			if (players[i].name !== undefined)
				$('#lobby').append("<tr id='player" + i + "' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='name'>" + players[i].name + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
			$('#player' + i).css("display", "none");
			$('#player' + i).fadeIn(anit);
		}
		$('#lobby tr').hover(function() {
			$('#click')[0].currentTime = 0;
			$('#click')[0].play();
		});
		$("#lobby tr").mouseover(function() {
			var n = $(this).attr('id'),
				hexes = (n == "user") ? "#000000" : "#000000",
				bright = brighter(hexes);
			$(this).css("background-color", hexToRgb(bright, 0.75));
		}).mouseout(function() {
			var n = $(this).attr('id');
			$(this).css("background-color", (n == "user") ? hexToRgb("#000000", 0.5) : hexToRgb("#000000", 0.5));
		});
		$('#lobby tr').click(function() {
			var e = $(this).children('.name').text(),
				n = $(this).attr('id'),
				nn = "user",
				hexes = (n == "user") ? "#000000" : "#000000",
				bright = brighter(hexes);
			changeMenu("custom-player", e);
			$('#lobby tr').each(function() {
				var color = $(this).attr('data-color');
				$(this).css('background', color);
			});
			$(this).css("background-color", hexToRgb(bright, 0.75));
		});
	});
}

function changeMenu(menu, details) {
	var f;
	////callbacks.playerName("\"" + settings.username.current + "\"");
	if (menu == "main-custom") {
		if (settings.background.current == Halo3Index) {
			$('#bg').attr('src', 'video/H3 Multiplayer.webm');
		}
		host = 1;
		forge = 0;
		$('#title').text('CUSTOM GAME');
		$('#subtitle').text('');
		$('#network-toggle').hide();
		$('#type-selection').show();
		currentType = "Slayer";
		$('#gametype-icon').css({
			"background-image": "url('img/gametypes/" + currentType + ".png')"
		});
		$('#customgame').attr('data-from', 'main');
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px"
		});
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'custom-main');
		$('#customgame').css({
			"top": "0px"
		});
		$('#main').css({
			"top": "720px"
		});
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>16</span></td></tr>");
		$('#start').children('.label').text("START GAME");

	}
	if (menu == "main-forge") {
		if (settings.background.current == Halo3Index) {
			$('#bg').attr('src', 'video/H3 Forge.webm');
		}
		host = 1;
		forge = 1;
		$('#title').text('FORGE');
		$('#subtitle').text('');
		$('#network-toggle').show();
		$('#type-selection').hide();
		currentType = "Forge";
		$('#gametype-icon').css({
			"background-image": "url('img/gametypes/" + currentType + ".png')"
		});
		$('#customgame').attr('data-from', 'main');
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px"
		});
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'custom-main');
		$('#customgame').css({
			"top": "0px"
		});
		$('#main').css({
			"top": "720px"
		});
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>16</span></td></tr>");
		$('#start').children('.label').text("START FORGE");

	}
	if (menu == "custom-main") {
		if (settings.background.current == Halo3Index) {
			$('#bg').attr('src', 'video/Halo 3.webm');
		}
		$('#dewrito').css({
			"opacity": 0.95,
			"top": "240px",
			"-webkit-transition-timing-function": "400ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#customgame').css({
			"top": "-720px"
		});
		$('#main').css({
			"top": "0px"
		});
		$('#back').attr('data-action', 'main-main2');

	}
	if (menu == "serverbrowser-custom" && details) {
		host = 0;
		browsing = 0;
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>0</span></td></tr>");
		var d = servers[details];
		if (d.players.current != d.players.max) {
			changeMap2(d.map);
			$('#subtitle').text(d.name + " : " + d.ip);
			if (d.gametype === "") {
				d.gametype = "Slayer";
			}
			$('#gametype-display').text(d.gametype.toUpperCase());
			if (d.gameparent === "none")
				d.gameparent = "Slayer";
			$('#gametype-icon').css('background', "url('img/gametypes/" + d.gameparent.toString().replace("%20", " ") + ".png') no-repeat 0 0/cover");
			$('#serverbrowser').css({
				"top": "720px"
			});
			$('#customgame').css({
				"top": "0px"
			});
			$('#back').attr('data-action', 'custom-serverbrowser');
			$('#customgame').attr('data-from', 'serverbrowser');
			playersJoin(d.players.current, d.players.max, 20, d.ip);
			lobbyLoop(servers[selectedserver].ip);
			loopPlayers = true;

		}
		$('#start').children('.label').text("JOIN GAME");
		$('#title').text('CUSTOM GAME');
		$('#network-toggle').hide();
		$('#type-selection').show();
	}
	if (menu == "custom-serverbrowser") {
		browsing = 1;
		if (settings.background.current == Halo3Index) {
			$('#bg').attr('src', 'video/H3 Multiplayer.webm');
		}
		$('#customgame').css({
			"top": "-720px"
		});
		$('#serverbrowser').css({
			"top": "0px"
		});
		$('#back').attr('data-action', 'serverbrowser-main');
		$('#browser').empty();
		loadServers();
		loopPlayers = false;
	}
	if (menu == "main-serverbrowser") {
		browsing = 1;
		if (settings.background.current == Halo3Index) {
			$('#bg').attr('src', 'video/H3 Multiplayer.webm');
		}
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px"
		});
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'serverbrowser-main');
		$('#serverbrowser').css({
			"top": "0px"
		});
		$('#main').css({
			"top": "720px"
		});
		$('#browser').empty();
		loadServers();
		loopPlayers = false;
	}
	if (menu == "serverbrowser-main") {
		browsing = 0;
		if (settings.background.current == Halo3Index) {
			$('#bg').attr('src', 'video/Halo 3.webm');
		}
		$('#dewrito').css({
			"opacity": 0.95,
			"top": "240px",
			"-webkit-transition-timing-function": "400ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#serverbrowser').css({
			"top": "-720px"
		});
		$('#main').css({
			"top": "0px"
		});
		$('#back').attr('data-action', 'main-main2');

	}
	if (menu == "main2-main") {
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'main-main2');
		$('#main').css({
			"top": "0px"
		});
		$('#main2').css({
			"top": "720px"
		});

	}
	if (menu == "main2-credits") {
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'credits-main2');
		$('#credits').css({
			"top": "0px"
		});
		$('#main2').css({
			"top": "720px"
		});
		$('#dewrito').css({
			"top": "50px",
			"left": "265px",
			"-webkit-transition-timing-function": "200ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#bg-cover').css({
			"background": "rgba(0,0,0,0.5)"
		});
		$('#dewrito').css({
			'background': "url('img/Halo 3 CE.png') no-repeat 0 0/cover"
		});

	}
	if (menu == "credits-main2") {
		$('#back').fadeOut(anit);
		$('#credits').css({
			"top": "-720px"
		});
		$('#main2').css({
			"top": "0px"
		});
		$('#dewrito').css({
			"top": "240px",
			"left": "-10px",
			"-webkit-transition-timing-function": "200ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#bg-cover').css({
			"background": "rgba(0,0,0,0.25)"
		});
		var c = settings.logo.current;
		$('#dewrito').css({
			'background': "url('img/" + settings.logo.labels[c] + ".png') no-repeat 0 0/cover"
		});

	}
	if (menu == "main-main2") {
		$('#back').fadeOut(anit);
		$('#main').css({
			"top": "-720px"
		});
		$('#main2').css({
			"top": "0px"
		});

	}
	if (menu == "custom-options") {
		if (host === 1) {
			$('#customgame-options').show();
			$('#back').attr('data-action', 'options-custom');
			$('#customgame').fadeOut(anit);
			$('#options').fadeIn(anit);
			$('#dewrito').css('top', '400px');
			$('#dewrito').css({
				"opacity": 0.9,
				"top": "400px",
				"-webkit-transition-timing-function": "200ms",
				"-webkit-transition-delay": "200ms"
			});

		}
	}
	if (menu == "options-haloonline") {
		$('#back').attr('data-action', 'haloonline-options');
		$('#dewrito-options').hide();
		$('#haloonline').fadeIn(anit);
	}
	if (menu == "haloonline-options") {
		$('#back').attr('data-action', 'options-main');
		$('#haloonline').hide();
		$('#dewrito-options').fadeIn(anit);
	}
	if (menu == "serverbrowser-type") {
		$('#choosetype').show();
		$('#back').attr('data-action', 'options-serverbrowser');
		$('#serverbrowser').fadeOut(anit);
		$('#options').fadeIn(anit);
	}
	if (menu == "serverbrowser-map") {
		$('#choosemap').show();
		$('#back').attr('data-action', 'options-serverbrowser');
		$('#serverbrowser').fadeOut(anit);
		$('#options').fadeIn(anit);
	}
	if (menu == "options-serverbrowser") {
		$('.options-section').hide();
		$('#back').attr('data-action', 'serverbrowser-main');
		$('#serverbrowser').fadeIn(anit);
		$('#options').fadeOut(anit);
	}
	if (menu == "custom-map") {
		if (host === 1) {
			$('#choosemap').show();
			$('#back').attr('data-action', 'options-custom');
			$('#customgame').fadeOut(anit);
			$('#options').fadeIn(anit);
			$('#dewrito').css('top', '400px');
			$('#dewrito').css({
				"opacity": 0.9,
				"top": "400px",
				"-webkit-transition-timing-function": "200ms",
				"-webkit-transition-delay": "200ms"
			});

		}
	}
	if (menu == "custom-type") {
		if (host === 1 && forge === 0) {
			$('#choosetype').show();
			$('#back').attr('data-action', 'options-custom');
			$('#customgame').fadeOut(anit);
			$('#options').fadeIn(anit);
			$('#dewrito').css('top', '400px');
			$('#dewrito').css({
				"opacity": 0.9,
				"top": "400px",
				"-webkit-transition-timing-function": "200ms",
				"-webkit-transition-delay": "200ms"
			});

		}
	}
	if (menu == "options-custom") {
		$('.options-section').hide();
		f = $('#customgame').attr('data-from');
		$('#back').attr('data-action', 'custom-' + f);
		$('#customgame').fadeIn(anit);
		$('#options').fadeOut(anit);
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px",
			"-webkit-transition-timing-function": "200ms",
			"-webkit-transition-delay": "0ms"
		});

	}
	if (menu == "main-options") {
		$('#dewrito-options').show();
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'options-main');
		$('#main2').fadeOut(anit);
		$('#options').fadeIn(anit);
		$('#dewrito').css({
			"top": "400px"
		});
	}
	if (menu == "options-main") {
		$('.options-section').hide();
		$('#back').fadeOut(anit);
		$('#main2').fadeIn(anit);
		$('#options').fadeOut(anit);
		$('#dewrito').css({
			"top": "240px",
			"-webkit-transition-delay": "0ms"
		});

	}
	if (menu == "custom-player") {
		$('#customgame').css({
			"left": "-800px"
		});
		$('#playerinfo').css({
			"right": "100px"
		});
		$('#back').attr('data-action', 'player-custom');
		$('#playermodel').css('background-image', "url('img/players/" + details + ".png')");
		playerInfo(details);

	}
	if (menu == "player-custom") {
		$('#customgame').css({
			"left": "0px"
		});
		$('#playerinfo').css({
			"right": "-700px"
		});
		f = $('#customgame').attr('data-from');
		$('#back').attr('data-action', 'custom-' + f);

	}
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
}

var KDdata = [{
		value: 1,
		color: "#cf3e3e",
		highlight: "#ed5c5c",
		label: "Deaths"
	}, {
		value: 1,
		color: "#375799",
		highlight: "#5575b7",
		label: "Kills"
	}],
	ctx = $("#player-kd-chart")[0].getContext("2d"),
	KDchart = new Chart(ctx).Doughnut(KDdata, {
		segmentShowStroke: false,
		percentageInnerCutout: 75,
		animationEasing: "easeInQuad"
	});

function playerInfo(name) {
	if (name != "user") {
		$.getJSON("http://" + servers[selectedserver].ip, function(info) {
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

function startgame(ip, mode) {
	if (mode[0] === "JOIN") {
		if (servers[selectedserver].password !== undefined) {
			var password = prompt(servers[selectedserver].name + " has a password, enter the password to join", "");
			if (password !== null) {
				/*$('#beep')[0].play();
				$('#music')[0].pause();
				$('#black').fadeIn(3500).delay(5000).fadeOut(1000, function() {$('#music')[0].play();});
				delay(function(){
					window.open("dorito:" + servers[$(".server").data("server")].ip + "/" + password);
				}, 3500);*/
			}
		} else {
			/*$('#beep')[0].play();
			$('#music')[0].pause();
			$('#black').fadeIn(3500).delay(5000).fadeOut(1000, function() {$('#music')[0].play();});
			delay(function(){
				window.open("dorito:" + ip);
			}, 3500);*/
		}
	}
	$('#beep')[0].play();
	$('#music')[0].pause();
	$('#black').fadeIn(3500).delay(5000).fadeOut(1000, function() {
		$('#music')[0].play();
	});
	delay(function() {
		if (mode[0] === "JOIN") {
			//callbacks.connect(ip);
		} else if (mode[1] === "FORGE") {
			//callbacks.gameType(0, 0);
		} else if (mode[0] === "START" && mode[1] === "GAME") {
			//callbacks.gametype(0,0);
		}
		loopPlayers = true;
		lobbyLoop(ip);
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
			isType = content.match(typeFilter);
		if (isMap && isType) {
			$(this).show();
		}
	});
}

function clearFilters() {
	sortMap = "";
	sortType = "";
	$('#browser-map').text("Choose Map...");
	$('#browser-gametype').text("Choose Gametype...");
	$('#clear').fadeOut(anit);
	loadServers();
	filterServers();
}

function changeSettingsMenu(setting) {
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
	currentSetting = setting;
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

function changeMap2(map, click) {
	$('#map-thumb').css({
		"background-image": "url('img/maps/" + map.toString().toUpperCase() + ".png')"
	});
	$('#map-thumb-options').css({
		"background-image": "url('img/maps/" + map.toString().toUpperCase() + ".png')"
	});
	$('#currentmap').text(map);
	$('#map-name-options').text(map);
	$('#map-info-options').text(maps[currentGame][map]);
	$('.map-select2 .selection').removeClass('selected');
	$("[data-map='" + map + "']").addClass('selected');
	//callbacks.map(getMapId($('#currentmap').text()));
	if (browsing === 1 && click === true) {
		$('#browser-map').text(map.toTitleCase());
		changeMenu("options-serverbrowser");
		sortMap = map;
		$('#clear').show();
		filterServers();
	} else if (click === true) {
		changeMenu("options-custom");
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

function changeType2(type, click) {
	if (currentType.contains(" ")) {
		var reg = currentType.match(/\b(\w)/g);
		var acronym = reg.join('');
		$('#gametype-icon').css({
			"background-image": "url('img/gametypes/" + acronym + ".png')"
		});
		$('#type-icon-options').css({
			"background-image": "url('img/gametypes/" + acronym + ".png')"
		});
	} else {
		$('#gametype-icon').css({
			"background-image": "url('img/gametypes/" + currentType + ".png')"
		});
		$('#type-icon-options').css({
			"background-image": "url('img/gametypes/" + currentType + ".png')"
		});
	}
	$('#gametype-display').text(type.toUpperCase());
	$('#type-name-options').text(type.toUpperCase());
	$('#type-info-options').text(gametypes[currentType][type]);
	$('.type-select2 .selection').removeClass('selected');
	$("[data-type='" + type + "']").addClass('selected');
	if (browsing === 1 && click === true) {
		$('#browser-gametype').text(type.toTitleCase());
		changeMenu("options-serverbrowser");
		sortType = type;
		$('#clear').show();
		filterServers();
	} else if (click === true) {
		changeMenu("options-custom");
	}
}

function clearAllCookies() {
	for (var i = 0; i < Object.keys(settings).length; i++) {
		var set = Object.keys(settings)[i];
		$.removeCookie(set);
	}
	alert("All cookies reset.");
}
