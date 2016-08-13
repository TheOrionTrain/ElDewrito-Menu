var Browser = {
        status: 0,
        "get": function() {
            Controller.deselect();
            servers = [];
            Controller.servers = 0;
            Controller.selected = 0;
            for (var i = 0; i < serverz.servers.length; i++) {
                Browser.query(serverz.servers[i], i, browser);
            }
        },
        "query": function(serverInfo, i, browser) {
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
                "sprintEnabled": parseInt(serverInfo.sprintEnabled)
            };
            Browser.add(i);
        },
        "add": function(i) {
            if (servers[i].map == "")
                return;
            ++Controller.servers;
            var on = (!servers[i].variant) ? "" : "on";
            servers[i].location_flag = typeof servers[i].location_flag == 'undefined' ? "[" : servers[i].location_flag;
            servers[i].ping = servers[i].ping || 0;
            var sprint = (servers[i].sprintEnabled == 1) ? "<img class='sprint' src='img/sprint.svg'>" : " ";

            $('#browser').append("<div data-gp='serverbrowser-" + Controller.servers + "' class='server" + ((servers[i].password) ? " passworded" : "") + " ' id='server" + i + "' data-server=" + i + "><div class='thumb'><img src='img/maps/" + getMapName(servers[i].mapFile).toString().toUpperCase() + ".jpg'></div><div class='info'><span class='name'>" + ((servers[i].password) ? "[LOCKED] " : "") + servers[i].name + " (" + servers[i].host + ")  " + servers[i].location_flag + "<span id='ping-" + i + "'>" + servers[i].ping + "</span>ms]</span><span class='settings'>" + servers[i].variant + " " + on + " " + servers[i].map.replace("Bunkerworld", "Standoff") + sprint + "<span class='elversion'>" + servers[i].eldewritoVersion + "</span></span></div><div class='players'>" + servers[i].players.current + "/" + servers[i].players.max + "</div></div>");
            $('.server').hover(function() {
                Audio.click.currentTime = 0;
                Audio.click.play();
                Controller.select($(this).attr('data-gp'));
            });
            $('.server').unbind().click(function() {
                Lobby.join($(this).attr('data-server'));
            });
            Browser.filter();
            if (Controller.servers == 1) {
                Controller.select('serverbrowser-1');
            }
        },
        "filter": function() {
            $('.server').each(function() {
                $(this).hide();
                var content = $(this).text(),
                    mapFilter = new RegExp(Browser.filters.map, "i"),
                    typeFilter = new RegExp(Browser.filters.type, "i"),
                    isMap = content.match(mapFilter),
                    isType = content.match(typeFilter),
                    isFull,
                    isLocked,
                    isSprint;
                if (Browser.filters.full) {
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
                if (Browser.filters.locked) {
                    if ($(this).hasClass('passworded')) {
                        isLocked = true;
                    } else {
                        isLocked = false;
                    }
                } else {
                    isLocked = false;
                }
                if (Browser.filters.sprint) {
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
            if ($('#browser').is(':empty')) {
                $('#refresh').trigger('click');
            }
        },
        "load": function() {
            if (browsing === 1) {
                $('#refresh img').addClass('rotating');
                setTimeout(function() {
                    $('#refresh img').removeClass('rotating');
                }, 4000);
                $('#browser').empty();
                Browser.get();
                $('.server').hover(function() {
                    Audio.click.currentTime = 0;
                    Audio.click.play();
                });
                $('.server').click(function() {
                    Lobby.join($(this).attr('data-server'));
                });
                Browser.filter();
            }
        },
        "filters": {
            "clear": function() {
                Browser.filters.map = "";
                Browser.filters.type = "";
                Browser.filters.full = false;
                Browser.filters.locked = false;
                Browser.filters.sprint = false;
                $('.checkbox').removeClass('checked');
                $('#browser-map').text("Choose Map");
                $('#browser-gametype').text("Choose Gametype");
                $('#clear').fadeOut(anit);
                Browser.load();
                Browser.filter();
            },
            "map": "",
            "type": "",
            "full": false,
            "locked": false,
            "sprint": false,
        }
    },
    Leaderboard = {
        "load": function() {
            if (leading === 1) {
                $('#leaders').empty();
                $.getJSON("http://halostats.click/api/Leaderboard/25/1", function(data) {
                    Leaderboard.stats = data;
                    for (var i = 0; i < Leaderboard.stats.length; i++) {
                        Leaderboard.add(Leaderboard.stats[i]);
                    }
                });
            }
        },
        "add": function(lb) {
            $("<div>" + JSON.stringify(lb) + "</div>").hover(function() {
                Audio.click.currentTime = 0;
                Audio.click.play();
            }).appendTo('#leaders');
        }
    };
