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
    Halo3Index = 6,
    currentVersion,
    usingGamepad = false,
    currentMenu = "main2";

function isset(val, other) {
    return (val !== undefined) ? val : other;
}

function randomNum(n) {
    return Math.floor(Math.random() * n);
}

(function() {
    var e = (window.innerHeight - 80) / 2;
    $('.pace .pace-progress:after').css('top', e);
})();

var masterServers = [];

function getMasterServers(cb) {
    $.getJSON("https://raw.githubusercontent.com/ElDewrito/ElDorito/master/dewrito.json", function(data) {
        $.each(data.masterServers, function(key, val) {
            console.log("Trying master server: " + val['list']);
            $.ajax({
                url: val['list'],
                dataType: 'json',
                jsonp: false,
                success: function(data) {
                    if (data.result['msg'] == "OK") {
                        console.log("Master server " + val['list'] + " is online and OK");
                        masterServers.push(val);
                        if (masterServers.length == 1) {
                            cb();
                        }
                    }
                }
            });
        });
    });
}

function getServers() {
    servers = [];
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
		}
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
			ping = endTime-startTime;
		}
	});
    $.getJSON("http://" + serverIP, function(serverInfo) {
        if (typeof serverInfo.maxPlayers != "number" || typeof serverInfo.numPlayers != "number" || serverInfo.numPlayers > 16 || serverInfo.maxPlayers > 16) {
            return false;
        }
		var isPassworded = serverInfo.passworded !== undefined;
        if (serverInfo.map) {
            if (isPassworded) {
                servers[i] = {
                    "ip": sanitizeString(serverIP),
                    "host": sanitizeString(serverInfo.hostPlayer),
                    "name": "[PASSWORDED] " + sanitizeString(serverInfo.name),
                    "gametype": sanitizeString(serverInfo.variant),
                    "gameparent": sanitizeString(serverInfo.variantType),
                    "map": sanitizeString(getMapName(serverInfo.mapFile)),
					"file": sanitizeString(serverInfo.mapFile),
					"ping": ping,
                    "players": {
                        "max": parseInt(serverInfo.maxPlayers),
                        "current": parseInt(serverInfo.numPlayers)
                    },
                    "password": true
                };
            } else {
                servers[i] = {
                    "ip": sanitizeString(serverIP),
                    "host": sanitizeString(serverInfo.hostPlayer),
                    "name": sanitizeString(serverInfo.name),
                    "gametype": sanitizeString(serverInfo.variant),
                    "gameparent": sanitizeString(serverInfo.variantType),
                    "map": sanitizeString(getMapName(serverInfo.mapFile)),
					"file": sanitizeString(serverInfo.mapFile),
					"ping": ping,
                    "players": {
                        "max": parseInt(serverInfo.maxPlayers),
                        "current": parseInt(serverInfo.numPlayers)
                    }
                };
            }
        }
        if (typeof servers[i] !== 'undefined') {
            //Fuck off ImplodeExplode, I do what I want
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

function sanitizeString(str) {
    return String(str).replace(/(<([^>]+)>)/ig, "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
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

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.contains = function(it) {
    return this.indexOf(it) != -1;
};

function promptPassword(i) {
    var password = prompt(servers[i].name + " has a password, enter the password to join", "");
    if (password !== null) {
       // window.open("dorito:" + servers[i].ip + "/" + password);
        dewRcon.send('connect ' + servers[i].ip + ' ' + password);
    }
}


function addServer(i, geoloc) {
    var location_flag = "";

    i = parseInt(i);

    if (!geoloc) {
        geoloc = {};
        geoloc.country_code = "";
    } else {
        location_flag = "<img src='img/flags/" + geoloc.country_code + ".png' alt='"+ geoloc.country + "' class='flag'/>";
    }

    var on = (!servers[i].gametype) ? "" : "on";
    $('#browser').append("<div class='server' id='server" + i + "' data-server=" + i + "><div class='thumb'><img src='img/maps/" + servers[i].map.toString().toUpperCase() + ".png'></div><div class='info'><span class='name'>" + servers[i].name + " (" + servers[i].host + ")  " + location_flag + " " + servers[i].ping + "ms</span><span class='settings'>" + servers[i].gametype + " " + on + " " + servers[i].map + "</span></div><div class='players'>" + servers[i].players.current + "/" + servers[i].players.max + "</div></div>");
    $('.server').hover(function() {
        $('#click')[0].currentTime = 0;
        $('#click')[0].play();
    });
    $('.server').click(function() {
        selectedserver = $(this).attr('data-server');
        changeMenu("serverbrowser-custom", selectedserver);
    });
    filterServers();
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
    gamepadBind();
    Mousetrap.bind('f11', function() {
        setTimeout(function() {
            dewRcon.send('game.togglemenu');
        },anit);
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
        changeMenu($(this).attr('data-action'),'back');
        if(usingGamepad) {
            gp_on = p_gp_on;
            gamepadSelect(currentMenu+"-"+p_gp_on);
        }
    });
    $("#lobby-container").mousewheel(function(event, delta) {
        this.scrollTop -= (delta * 34);
        event.preventDefault();
    });
    $.srSmoothscroll({
        step: 55,
        speed: 400,
        ease: 'linear',
        target: $('.server'),
        container: $('#browser')
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
            if (typeof serverInfo.maxPlayers != "number" || typeof serverInfo.numPlayers != "number" || serverInfo.numPlayers > 16 || serverInfo.maxPlayers > 16) {
                return false;
            }
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
		var pass = promt("Enter Password: ");
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
        console.log(ip);
        players = serverInfo.players;
        $('#lobby').empty();
        $('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>0</span>/<span id='maxplayers'>0</span></td></tr>");
        $('#maxplayers').text(serverInfo.maxPlayers);
        $('#joined').text(serverInfo.numPlayers);
        for (var i = 0; i < serverInfo.numPlayers; i++) {
          	if (players[i].name !== undefined) {
            	$('#lobby').append("<tr id='player" + i + "' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='name'>" + players[i].name + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
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
        $('#network-toggle').attr('data-gp','customgame-x').hide();
        $('#type-selection').attr('data-gp','customgame-1').show();
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
        $('#network-toggle').attr('data-gp','customgame-1').show();
        $('#type-selection').attr('data-gp','customgame-x').hide();
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
            "top": "50px",
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
    $('#slide')[0].currentTime = 0;
    $('#slide')[0].play();
    if(usingGamepad && details != 'back') {
        p_gp_on = gp_on;
        gp_on = 1;
        gamepadSelect(currentMenu+"-"+gp_on);
    }
    console.log(currentMenu);
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
							dewRcon.send('connect ' + servers[i].ip + ' ' + password);
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
            dewRcon.send('connect ' + ip);
						//showloadingscreen
        } else if (mode[1] === "FORGE") {

        } else if (mode[0] === "START" && mode[1] === "GAME") {
						dewRcon.send('start');
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

function getMapFile(name)
{
		if (typeof name != 'undefined') {
		    switch (name.toString().toLowerCase())
		    {
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
		console.log(type);
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

function clearAllCookies() {
    for (var i = 0; i < Object.keys(settings).length; i++) {
        var set = Object.keys(settings)[i];
        $.removeCookie(set);
    }
    alert("All cookies reset.");
}

function popup(message) {
    $('#popup').text(message);
    $('#popup').fadeIn(anit);
    setTimeout(function() {
        $('#popup').fadeOut(anit);
    },8000);
}
