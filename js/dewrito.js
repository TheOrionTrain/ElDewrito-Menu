/*
    (c) 2015 Brayden Strasen & Ryan Palmer
    https://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var players = [],
    masterServers = [],
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
	Halo3Index = 6,
	currentVersion,
	usingGamepad = false,
	currentMenu = "main2",
    debug = false;

(function() {
	var e = (window.innerHeight - 80) / 2;
	$('.pace .pace-progress:after').css('top', e);

    var d = getURLParameter('debug');
    if (d !== undefined && d == "1") {
        console.log("debug yes");
    }

})();

function debugLog(val) {
    if (!debug) return;

    console.log(val);
}

function getMasterServers(cb) {
	$.getJSON("https://raw.githubusercontent.com/ElDewrito/ElDorito/master/dewrito.json", function(data) {
		$.each(data.masterServers, function(key, val) {
			debugLog("Trying master server: " + val['list']);
			$.ajax({
				url: val['list'],
				dataType: 'json',
				jsonp: false,
				success: function(data) {
					if (data.result['msg'] == "OK") {
						debugLog("Master server " + val['list'] + " is online and OK");
						masterServers.push(val);
						if (masterServers.length == 1) {
							cb();
						}
					}
				},
                error: function() {
                    console.error("Issue connecting to master server: " + val['list']);
                }
			});
		});
	});
}

function getServers() {
	if (usingGamepad) {
		gamepadDeselect();
	}
	servers = [];
	gp_servers = 0;
	gp_on = 0;
	var totalIps = [];
	var ffs = 0;
	for (var l = 0; l < masterServers.length; l++) {
		$.getJSON(masterServers[l].list, function(data) {
			if (data.result.code !== 0) {
				alert("Error received from master: " + data.result.msg);
				return;
			}

			for (var i = 0; i < data.result.servers.length; i++) {
				var serverIP = data.result.servers[i];
				if ($.inArray(serverIP, totalIps) === -1) {
					totalIps.push(serverIP);
					queryServer(serverIP, ffs);
					ffs++;
				}
			}
		});
	};
}

function queryServer(serverIP, i) {
	var startTime = Date.now(),
		endTime,
		ping;
	$.ajax({
		type: "GET",
		url: "http://" + serverIP + "/",
		async: true,
		success: function() {
			endTime = Date.now();
			ping = Math.round((endTime - startTime)/1.60); //Aproximate ping, may change from 1.75 later
		}
	});
	$.getJSON("http://" + serverIP, function(serverInfo) {
		if (typeof serverInfo.maxPlayers != "number" || typeof serverInfo.numPlayers != "number" || serverInfo.numPlayers > 16 || serverInfo.maxPlayers > 16) {
			return false;
		}
		var isPassworded = serverInfo.passworded !== undefined;
		if (serverInfo.map) {
			servers[i] = {
				"ip": sanitizeString(serverIP),
				"host": sanitizeString(serverInfo.hostPlayer),
				"name": sanitizeString(serverInfo.name),
				"gametype": sanitizeString(serverInfo.variant),
				"gameparent": sanitizeString(serverInfo.variantType),
				"map": sanitizeString(getMapName(serverInfo.mapFile)),
				"file": sanitizeString(serverInfo.mapFile),
				"status": sanitizeString(serverInfo.status),
                "version": sanitizeString(serverInfo.eldewritoVersion),
				"ping": ping,
				"players": {
					"max": parseInt(serverInfo.maxPlayers),
					"current": parseInt(serverInfo.numPlayers)
				},
				"password": isPassworded
			};
		}
		if (typeof servers[i] !== 'undefined') {
			ip = serverIP.substring(0, serverIP.indexOf(':'));
			$.ajax({
				url: 'http://www.telize.com/geoip/' + serverIP.split(':')[0],
				dataType: 'json',
				timeout: 3000,
				success: function(geoloc) {
					addServer(i, geoloc);
				},
				error: function() {
					addServer(i, null);
				}
			});
		}
	});
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
		case "mainmenu":
			return "Edge";
	}
}

function promptPassword(i) {
	var password = prompt(servers[i].name + " has a password, enter the password to join", "");
	if (password !== null) {
		// window.open("dorito:" + servers[i].ip + "/" + password);
		dewRcon.send('connect ' + servers[i].ip + ' ' + password);
	}
}

var gp_servers = 0;


function addServer(i, geoloc) {
	var location_flag = "";
	i = parseInt(i);
	if (!geoloc) {
		geoloc = {};
		geoloc.country_code = "";
		location_flag = "[";
	} else {
		location_flag = "[<img src='img/flags/" + geoloc.country_code.toLowerCase() + ".png' title='" + geoloc.country + "' alt='" + geoloc.country + "' class='flag'/> ";
	}
	++gp_servers;
	var on = (!servers[i].gametype) ? "" : "on";
	$('#browser').append("<div data-gp='serverbrowser-" + gp_servers + "' class='server" + ((servers[i].password) ? " passworded" : "") + " ' id='server" + i + "' data-server=" + i + "><div class='thumb'><img src='img/maps/" + servers[i].map.toString().toUpperCase() + ".png'></div><div class='info'><span class='name'>" + ((servers[i].password) ? "[LOCKED] " : "") + servers[i].name + " (" + servers[i].status + ")  " + location_flag + servers[i].ping + "ms]</span><span class='settings'>" + servers[i].gametype + " " + on + " " + servers[i].map + " <span class='elversion'>" + servers[i].version + "</span></span></div><div class='players'>" + servers[i].players.current + "/" + servers[i].players.max + "</div></div>");
	$('.server').hover(function() {
		$('#click')[0].currentTime = 0;
		$('#click')[0].play();
	});
	$('.server').click(function() {
		selectedserver = $(this).attr('data-server');
		changeMenu("serverbrowser-custom", selectedserver);
	});
	filterServers();
	if (usingGamepad && gp_servers == 1) {
		gamepadSelect('serverbrowser-1');
	}
}

function initalize() {
	if (window.location.protocol == "https:") {
		alert("The server browser doesn't work over HTTPS, switch to HTTP if possible.");
	}
	var set, b, g, i, e;
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

	var CSSfile = getURLParameter('css');
	if (CSSfile) {

		$('#style').attr('href', 'css/'+CSSfile+'.css');
        menuConvert(CSSfile)
	}
	gamepadBind();
	Mousetrap.bind('f11', function() {
		setTimeout(function() {
			dewRcon.send('game.togglemenu');
		}, anit);
	});
	initalize();
	getMasterServers(function() {
		getTotalPlayers();
		totalPlayersLoop();
		getCurrentVersion();
	});
	$('#refresh').click(function() {
		loadServers();
		filterServers();
	});
	$('#direct-connect').click(function() {
		directConnect();
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
    $('#connectgamepad')[0].volume = settings.musicvolume.current;
	$('#music')[0].volume = settings.musicvolume.current;
	$('#click')[0].volume = settings.sfxvolume.current;
	$('#start').click(function() {
		var mode = $('#start').children('.label').text().toString().split(" ");
		if (mode[1] === "FORGE" || (mode[0] === "START" && mode[1] === "GAME"))
			startgame("127.0.0.1:11775", mode);
		else
			startgame(servers[selectedserver].ip, mode);
	});
    Mousetrap.bind('up up down down left right left right b a', function() {
        window.location = "http://heyyeyaaeyaaaeyaeyaa.com/";
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
		changeMenu($(this).attr('data-action'), 'back');
		if (usingGamepad) {
			gp_on = p_gp_on;
			gamepadSelect(currentMenu + "-" + p_gp_on);
		}
	});
});


function loadServers() {
	if (browsing === 1) {
		$('#refresh img').addClass('rotating');
		setTimeout(function() {
			$('#refresh img').removeClass('rotating');
		}, 4000);
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
}

function lobbyLoop(ip) {
	delay(function() {
		$.getJSON("http://" + ip, function(serverInfo) {
      console.log('loop');
			players = serverInfo.players;
			var teamGame = false;
			var colour = "#000000";
			for (var i = 0; i < serverInfo.numPlayers; i++) {
				if (typeof players[i] != 'undefined') {
					if (parseInt(players[i].team) > 1)
						teamGame = false;
					else
						teamGame = true;
				}
			}

			$('#gametype-display').text(serverInfo.variant.toUpperCase());
			if (serverInfo.variantType === "none")
				serverInfo.variantType = "slayer";
			$('#gametype-icon').css('background', "url('img/gametypes/" + (serverInfo.variantType === "ctf" || serverInfo.variantType === "koth") ? serverInfo.variantType : serverInfo.variantType.toString().capitalizeFirstLetter + ".png') no-repeat 0 0/cover");

			players.sort(function(a, b){return a.team-b.team});
			$('#lobby').empty();
			$('#lobby').append("<tr class='top' hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='info' colspan='2'>Current Lobby <span id='joined'>0</span>/<span id='maxplayers'>0</span></td></tr>");
			$('#maxplayers').text(serverInfo.maxPlayers);
			$('#joined').text(serverInfo.numPlayers);

			changeMap2(getMapName(serverInfo.mapFile));
			$('#subtitle').text(serverInfo.name + " : " + servers[selectedserver].ip);

			if (typeof serverInfo.passworded != 'undefined')
				return;
			for (var i = 0; i < serverInfo.numPlayers; i++) {
				if (typeof players[i] != 'undefined' && players[i].name != "") {
					if (teamGame)
						colour = (parseInt(players[i].team) === 0) ? "#c02020" : "#214EC0";
					$('#lobby').append("<tr id='player" + i + "' team='" + players[i].team + "' hex-colour= '" + colour + "' data-color='" + hexToRgb(colour, 0.5) + "' style='background:" + hexToRgb(colour, 0.5) + ";'><td class='name'>" + players[i].name + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
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
	var totalIps = [];
	var totalPlayers = 0,
		totalServers = 0;
	for (var l = 0; l < masterServers.length; l++) {
		$.getJSON(masterServers[l].list, function(data) {
			if (data.result.code !== 0) {
				alert("Error received from master: " + data.result.msg);
				return;
			}
			for (var i = 0; i < data.result.servers.length; i++) {
				var serverIP = data.result.servers[i];
				if ($.inArray(serverIP, totalIps) === -1) {
					totalIps.push(serverIP);
					if (!serverIP.toString().contains("?")) {
						$.getJSON("http://" + serverIP, function(serverInfo) {
							if (typeof serverInfo.maxPlayers != "number" || typeof serverInfo.numPlayers != "number" || serverInfo.numPlayers > 16 || serverInfo.maxPlayers > 16) {
								return false;
							}
							totalPlayers += serverInfo.numPlayers;
							++totalServers;
							$('#players-online').text(totalPlayers + " Players on " + totalServers + " Servers");
						});
					}
				}
			}
		});
	}
}

function directConnect() {
	var ip = prompt("Enter IP Address: ");
	var pass = prompt("Enter Password: ");
	//connect function here
	dewRcon.send('connect ' + ip + ' ' + pass);
}

function getCurrentVersion() {
	$.getJSON("http://eriq.co/eldewrito/update", function(data) {
		currentVersion = data.version.toString();
		$('#version').text('eldewrito ' + currentVersion);
	});
}

function totalPlayersLoop() {
	delay(function() {
		var totalIps = [];
		var totalPlayers = 0,
			totalServers = 0;
		for (var l = 0; l < masterServers.length; l++) {
			$.getJSON(masterServers[l].list, function(data) {
				if (data.result.code !== 0) {
					alert("Error received from master: " + data.result.msg);
					return;
				}
				for (var i = 0; i < data.result.servers.length; i++) {
					var serverIP = data.result.servers[i];
					if ($.inArray(serverIP, totalIps) === -1) {
						totalIps.push(serverIP);
						if (!serverIP.toString().contains("?")) {
							$.getJSON("http://" + serverIP, function(serverInfo) {
								if (typeof serverInfo.maxPlayers != "number" || typeof serverInfo.numPlayers != "number" || serverInfo.numPlayers > 16 || serverInfo.maxPlayers > 16) {
									return false;
								}
								totalPlayers += serverInfo.numPlayers;
								++totalServers;
								$('#players-online').text(totalPlayers + " Players on " + totalServers + " Servers");
							});
						}
					}
				}
			});
		}
		totalPlayersLoop();
	}, 30000);
}

function playersJoin(number, max, time, ip) {
	$.getJSON("http://" + ip, function(serverInfo) {
		debugLog(ip);
		players = serverInfo.players;
		var teamGame = false;
		var colour = "#000000";
		for (var i = 0; i < serverInfo.numPlayers; i++) {
			if (typeof players[i] != 'undefined') {
				if (parseInt(players[i].team) > 1)
					teamGame = false;
				else
					teamGame = true;
			}
		}
		players.sort(function(a, b){return a.team-b.team});
		$('#lobby').empty();
		$('#lobby').append("<tr class='top' hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='info' colspan='2'>Current Lobby <span id='joined'>0</span>/<span id='maxplayers'>0</span></td></tr>");
		$('#maxplayers').text(serverInfo.maxPlayers);
		$('#joined').text(serverInfo.numPlayers);
		if (typeof serverInfo.passworded != 'undefined')
			return;
		for (var i = 0; i < serverInfo.numPlayers; i++) {
			if (typeof players[i] != 'undefined' && players[i].name != "") {
				if (teamGame)
					colour = (parseInt(players[i].team) === 0) ? "#c02020" : "#214EC0";
				$('#lobby').append("<tr id='player" + i + "' team='" + players[i].team + "' hex-colour= '" + colour + "' data-color='" + hexToRgb(colour, 0.5) + "' style='background:" + hexToRgb(colour, 0.5) + ";'><td class='name'>" + players[i].name + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
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
	var f, changes = menu.split("-"), f = changes[0], t = changes[1];
    console.log("From " + f + " to " + t);
	if (menu == "main-custom") {
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-multiplayer').fadeIn(anit);
			$('#bg-multiplayer')[0].play();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-custom_games').fadeIn(anit);
			$('#bg-custom_games')[0].play();
			$('#bg-cover').css('background', 'rgba(0,0,0,0)');
		}
		host = 1;
		forge = 0;
		$('#title').text('CUSTOM GAME');
		$('#subtitle').text('');
		$('#network-toggle').attr('data-gp', 'customgame-x').hide();
		$('#type-selection').attr('data-gp', 'customgame-1').show();
		currentType = "Slayer";
		if (currentType == "Ctf")
			currentType = "ctf";
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
		playersJoin(1, 2, 20, "127.0.0.1:11775");
		currentMenu = "customgame";
	}
	if (menu == "main-forge") {
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-forge').fadeIn(anit);
			$('#bg-forge')[0].play();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-forge').fadeIn(anit);
			$('#bg-forge')[0].play();
			$('#bg-cover').css('background', 'rgba(0,0,0,0)');
		}
		host = 1;
		forge = 1;
		$('#title').text('FORGE');
		$('#subtitle').text('');
		$('#network-toggle').attr('data-gp', 'customgame-1').show();
		$('#type-selection').attr('data-gp', 'customgame-x').hide();
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
		currentMenu = "customgame";
	}
	if (menu == "custom-main") {
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeIn(anit);
			$('#bg1')[0].play();
			$('#bg-forge').fadeOut(anit);
			$('#bg-forge')[0].pause();
			$('#bg-multiplayer').fadeOut(anit);
			$('#bg-multiplayer')[0].pause();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeIn(anit);
			$('#bg1')[0].play();
			$('#bg-forge').fadeOut(anit);
			$('#bg-forge')[0].pause();
			$('#bg-custom_games').fadeOut(anit);
			$('#bg-custom_games')[0].pause();
			$('#bg-cover').css('background', 'rgba(0,0,0,0.25)');
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
		currentMenu = "main";
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
			$('#gametype-icon').css('background', "url('img/gametypes/" + (d.gameparent === "ctf" || d.gameparent === "koth") ? d.gameparent : d.gameparent.toString().capitalizeFirstLetter + ".png') no-repeat 0 0/cover");
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
		currentMenu = "customgame";
	}
	if (menu == "custom-serverbrowser") {
		browsing = 1;
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-multiplayer').fadeIn(anit);
			$('#bg-multiplayer')[0].play();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-matchmaking').fadeIn(anit);
			$('#bg-matchmaking')[0].play();
		}
		$('#customgame').css({
			"top": "-720px"
		});
		$('#serverbrowser').css({
			"top": "0px"
		});
		$('#back').attr('data-action', 'serverbrowser-main');
		$('#browser').empty();
		setTimeout(loadServers, 1000);
		loopPlayers = false;
		currentMenu = "serverbrowser";
	}
	if (menu == "main-serverbrowser") {
		browsing = 1;
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-multiplayer').fadeIn(anit);
			$('#bg-multiplayer')[0].play();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-matchmaking').fadeIn(anit);
			$('#bg-matchmaking')[0].play();
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
		setTimeout(loadServers, 1000);
		loopPlayers = false;
		currentMenu = "serverbrowser";
	}
	if (menu == "serverbrowser-main") {
		browsing = 0;
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeIn(anit);
			$('#bg1')[0].play();
			$('#bg-multiplayer').fadeOut(anit);
			$('#bg-multiplayer')[0].pause();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeIn(anit);
			$('#bg1')[0].play();
			$('#bg-matchmaking').fadeOut(anit);
			$('#bg-matchmaking')[0].pause();
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
		currentMenu = "main";
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
		currentMenu = "main";
	}
	if (menu == "main2-credits") {
		if (settings.background.current === 0) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-firefight').fadeIn(anit);
			$('#bg-firefight')[0].play();
		}
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'credits-main2');
		$('#credits').css({
			"top": "0px"
		});
		$('#main2').css({
			"top": "720px"
		});
		$('#dewrito').css({
			"top": "-30px",
			"left": "265px",
			"-webkit-transition-timing-function": "200ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#dewrito').css({
			'background': "url('img/Halo 3 CE.png') no-repeat 0 0/cover"
		});
		currentMenu = "credits";
	}
	if (menu == "credits-main2") {
		if (settings.background.current === 0) {
			$('#bg1').fadeIn(anit);
			$('#bg1')[0].play();
			$('#bg-firefight').fadeOut(anit);
			$('#bg-firefight')[0].pause();
		}
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
		currentMenu = "main2";
	}
	if (menu == "main-main2") {
		$('#back').fadeOut(anit);
		$('#main').css({
			"top": "-720px"
		});
		$('#main2').css({
			"top": "0px"
		});
		currentMenu = "main2";
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
			currentMenu = "customgame-options";
		}
	}
	if (menu == "options-haloonline") {
		$('#back').attr('data-action', 'haloonline-options');
		$('#dewrito-options').hide();
		$('#haloonline').fadeIn(anit);
		currentMenu = "haloonline";
	}
	if (menu == "haloonline-options") {
		$('#back').attr('data-action', 'options-main');
		$('#haloonline').hide();
		$('#dewrito-options').fadeIn(anit);
		currentMenu = "dewrito-options";
	}
	if (menu == "serverbrowser-type") {
		$('#choosetype').show();
		$('#back').attr('data-action', 'options-serverbrowser');
		$('#serverbrowser').fadeOut(anit);
		$('#options').fadeIn(anit);
		currentMenu = "choosetype";
	}
	if (menu == "serverbrowser-map") {
		$('#choosemap').show();
		$('#back').attr('data-action', 'options-serverbrowser');
		$('#serverbrowser').fadeOut(anit);
		$('#options').fadeIn(anit);
		currentMenu = "choosemap";
	}
	if (menu == "options-serverbrowser") {
		$('.options-section').hide();
		$('#back').attr('data-action', 'serverbrowser-main');
		$('#serverbrowser').fadeIn(anit);
		$('#options').fadeOut(anit);
		currentMenu = "serverbrowser";
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
			currentMenu = "choosemap";
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
			currentMenu = "choosetype";
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
		currentMenu = "customgame";
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
		currentMenu = "dewrito-options";
	}
	if (menu == "options-main") {
		$('.options-section').hide();
		$('#back').fadeOut(anit);
		$('#main2').fadeIn(anit);
		$('#options').fadeOut(anit);
		$('#dewrito').css({
			"top": "240px",
			"-webkit-transition-delay": "0ms",
			"transition-delay": "0ms",
			"-moz-transition-delay": "0ms"
		});
		currentMenu = "main2";
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
		currentMenu = "playerinfo";
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
		currentMenu = "customgame";
	}
	if (menu == "setting-settings") {
		changeSettingsBack();
	}
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
	if (usingGamepad && details != 'back') {
		p_gp_on = gp_on;
		gp_on = 1;
		gamepadSelect(currentMenu + "-" + gp_on);
	}
	debugLog(currentMenu);
}

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
    loopPlayers = false;
	var password;
	if (mode[0] === "JOIN")
		password = servers[selectedserver].password == true ? prompt(servers[selectedserver].name + " has a password, enter the password to join", "") : "";
	$('#beep')[0].play();
    setTimeout(function() {
        $('#beep')[0].play();
    },1000);
    setTimeout(function() {
        $('#beep')[0].play();
    },2000);
    setTimeout(function() {
        $('#beeep')[0].play();
    },3000);
	$('#music')[0].pause();
	$('#black').fadeIn(3000);
	delay(function() {
		if (mode[0] === "JOIN") {
			dewRcon.send('connect ' + ip + ' ' + password);
			//$('#hoImage').css('background-image','url(./img/' + settings.logo.labels[settings.logo.current] + '.png)');
			if (servers[selectedserver].status != "InLobby") {
				$('#loadingMapName').text(servers[selectedserver].map.toString().toUpperCase());
				$('#loadingMapImage').css('background-image','url(./img/loading/maps/' + servers[selectedserver].map.toString().toLowerCase() + '.png)');
				$('#loadingGametypeImage').css('background-image','url(./img/gametypes/' + servers[selectedserver].gameparent.toString().capitalizeFirstLetter() + '.png)');
				$('#mapOverlay').css('background-image','url(./img/loading/maps/' + servers[selectedserver].map.toString().toLowerCase() + '-overlay.png)');
				$('#loading').show();
				$('#back').remove();
			} else {
				dewRcon.send('game.togglemenu');
			}
		} else if (mode[1] === "FORGE") {

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
		}
		return "";
	}
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
	if ($('#start').children('.label').text() != "JOIN GAME")
		dewRcon.send('map ' + getMapFile($('#currentmap').text()));
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
	dewRcon.send('gametype ' + type.toString().toLowerCase().replace(" ", "_"));
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


function popup(message) {
	$('#popup').text(message);
	$('#popup').fadeIn(anit);
	setTimeout(function() {
		$('#popup').fadeOut(anit);
	}, 8000);
}
