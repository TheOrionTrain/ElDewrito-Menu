/*
    (c) 2016 Brayden Strasen & Ryan Palmer
    http://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var players = [],
    serverz = [],
    anit = 400,
    currentAlbum = isset(localStorage.getItem('album'), "halo3"),
    currentServer,
    selectedserver,
    loopPlayers,
    servers,
    scale = 1,
    currentVersion,
    songs,
    thisSong,
    nextSong,
    songIndex,
    localBackground = isset(localStorage.getItem('localbackground'), 0),
    videoURL = "http://158.69.166.144/video/",
    online = true,
    pings = [],
    previous = {},
    infoIP = "http://158.69.166.144:8081",
    totallyLoopingPlayers = setInterval(totalPlayersLoop, 10000),
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
    mapList,
    friends = [],
    friends_online;

(function() {
    if (window.location.protocol == "https:") {
        alert("The server browser doesn't work over HTTPS, switch to HTTP if possible.");
    }
})();

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
            Audio.music.pause();
            $("video").each(function() {
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
        changeSong2(isset(localStorage.getItem('song'), "Mythic Menu Theme"));
    });
    for (i = 0; i < Object.keys(settings).length; i++) {
        var set = Object.keys(settings)[i],
            category = settings[set].category;
        ++catergories[category];
        settings[set].update();
    }
    $.getJSON("http://158.69.166.144/matchmaking/Standard.json", function(json) {
        Setting.playlist.options.standard = json;
        for (i = 0; i < Object.keys(json).length; i++) {
            var list1 = "",
                list2 = "",
                maps = Setting.playlist.options.standard[Object.keys(json)[i]].Maps,
                types = Setting.playlist.options.standard[Object.keys(json)[i]].Types;
            for (e = 0; e < maps.length; e++) {
                list1 += "<li>" + maps[e].displayName + "</li>";
            }
            for (g = 0; g < types.length; g++) {
                list2 += "<li>" + types[g].displayName + "</li>";
            }
            Setting.playlist.options.standard[Object.keys(json)[i]].description = "<ul><li class='label'>MAPS</li>" + list1 + "</ul><ul><li class='label'>GAMETYPES</li>" + list2 + "</ul>";
        }
    });
    $.getJSON("http://158.69.166.144/matchmaking/Social.json", function(json) {
        Setting.playlist.options.social = json;
        for (i = 0; i < Object.keys(json).length; i++) {
            var list1 = "",
                list2 = "",
                maps = Setting.playlist.options.social[Object.keys(json)[i]].Maps,
                types = Setting.playlist.options.social[Object.keys(json)[i]].Types;
            for (e = 0; e < maps.length; e++) {
                list1 += "<li>" + maps[e].displayName + "</li>";
            }
            for (g = 0; g < types.length; g++) {
                list2 += "<li>" + types[g].displayName + "</li>";
            }
            Setting.playlist.options.social[Object.keys(json)[i]].description = "<ul><li class='label'>MAPS</li>" + list1 + "</ul><ul><li class='label'>GAMETYPES</li>" + list2 + "</ul>";
        }
    });
}

function loadParty() {
    if (dewRconConnected) {
        $('#party').empty();
        $('#current-party').empty().append("<tr class='top' hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='info' colspan='2'>Current Party <span class='numbers'><span id='current-party-count'>" + party.length + "</span>/16</span></td></tr>");
        if (party.length > 0) {
            for (var i = 0; i < party.length; i++) {
                $('#party').append("<div class='friend'>" + party[i].name + "</div>");
                var isDev = (developers.indexOf(party[i].guid) >= 0) ? "developer" : "";
                addPlayer('current-party', {
                    name: party[i].name,
                    guid: party[i].guid,
                    colour: party[i].colour,
                    rank: party[i].rank,
                    status: "online"
                }, isDev);
            }
            $('.friend,#friend-add,#friend-remove').hover(function() {
                Audio.click.currentTime = 0;
                Audio.click.play();
            });
            $('#party .friend:first-of-type').attr('title', 'Party Leader');
        } else {
            $('#party').append("<div class='nofriends'>You're not partying :(</div>");
            $('#current-party').empty();
        }
    }
}

function updateFriends() {
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].guid.length == 0) {
            friends[i] = onlinePlayers.getFromName(friends[i].name);
            localStorage.setItem("friends", JSON.stringify(friends));
        } else if (onlinePlayers.isOnline(friends[i].guid)) {
            friends[i] = onlinePlayers.getFromGUID(friends[i].guid);
            localStorage.setItem("friends", JSON.stringify(friends));
        }
    }
}

function addPlayer(id, player, isDev, opacity) {
    if (player.status == "online") {
        var c = player.colour;
    } else {
        var c = "#000000";
    }
    $('<tr>', {
        'hex-color': c,
        'data-color': hexToRgb(c, 0.5),
        'data-status': player.status,
        'style': 'background:' + hexToRgb(c, 0.5) + ';' + (opacity ? 'opacity:' + opacity : ''),
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
        })).appendTo('#' + id);
}

function loadFriends() {
    $('#friends-on').empty().append("<tr class='top' hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='info' colspan='2'>Friends Online <div id='show-search'></div> <span class='numbers'><span id='friends-on-count'>0</span>/<span id='friends-on-total'>0</span></span></td></tr>");
    $('#show-search').click(function() {
        $('#friend-search').fadeIn(anit);
        $('#friend-search input').focus();
        Audio.slide.currentTime = 0;
        Audio.slide.play();
    });
    $('#hide-search').click(function() {
        $('#friend-search').fadeOut(anit);
        Audio.slide.currentTime = 0;
        Audio.slide.play();
    });
    friends_online = 0;
    friends = JSON.parse(localStorage.getItem("friends"));

    if (!friends || friends.length < 1) {
        friends = [];
        localStorage.setItem("friends", JSON.stringify(friends));
        $('#friends-online').text("0 Friends Online");
        $('#friends').append("<div class='nofriends'>You have no friends :(<br/>Add some below</div>");
        return false;
    }
    friends.sort(function(a, b) {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        return 0;
    });
    friends.sort(function(a, b) {
        if (onlinePlayers.isOnline(a.guid) > onlinePlayers.isOnline(b.guid)) return -1;
        if (onlinePlayers.isOnline(a.guid) < onlinePlayers.isOnline(b.guid)) return 1;
        return 0;
    });
    for (var i = 0; i < friends.length; i++) {
        var o = (onlinePlayers.isOnline(friends[i].guid)) ? "online" : "offline",
            isDev = (developers.indexOf(friends[i].guid) >= 0) ? "developer" : "";
        addPlayer('friends-on', {
            name: friends[i].name,
            guid: friends[i].guid,
            colour: friends[i].colour,
            rank: friends[i].rank,
            status: o
        }, isDev);
        if (o == "online") {
            friends_online++;
            $('#friends-on-count').text(friends_online);
            $('#friends-on-total').text(friends.length);
        }
    }
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
    $('#friends-on td.name').click(function(e) {
        if ($(this).hasClass("online") || $(this).hasClass("name")) {
            submenu("show", $(this).text(), 1, e);
        } else {
            submenu("show", $(this).text(), 0, e);
        }
        Audio.slide.currentTime = 0;
        Audio.slide.play();
    });
    $('#party .friend, #current-party td.name').unbind().click(function(e) {
        if ($(this).text() != pname) {
            partysubmenu("show", $(this).text(), e);
            Audio.slide.currentTime = 0;
            Audio.slide.play();
        }
    });
}

function addFriend(name) {
    if (name !== null || name !== "" || name !== undefined) {
        $('#friend-input').val("");
        if (friends.indexOf(name) == -1) {
            friends.push(onlinePlayers.getFromName(name));
            friends.sort(function(a, b) {
                if ((!a.guid.contains(":0x") ? a.name.toLowerCase() : a.name.toLowerCase()) < (!b.guid.contains ? b.toLowerCase() : b.name.toLowerCase())) return -1;
                if ((!a.guid.contains(":0x") ? a.name.toLowerCase() : a.name.toLowerCase()) > (!b.guid.contains ? b.toLowerCase() : b.name.toLowerCase())) return 1;
                return 0;
            });
            friends.sort(function(a, b) {
                if (onlinePlayers.isOnline(a.guid) > onlinePlayers.isOnline(b.guid)) return -1;
                if (onlinePlayers.isOnline(a.guid) < onlinePlayers.isOnline(b.guid)) return 1;
                return 0;
            });
        }
        localStorage.setItem("friends", JSON.stringify(friends));
        updateFriends();
        loadFriends();
        $('#friend-search').fadeOut(anit);
        Audio.notification.currentTime = 0;
        Audio.notification.play();
    }
}

function removeFriend(name) {
    if (name !== null || name !== "" || name !== undefined) {
        $('#friend-input').val("");
        friends.remove(friends.getFromName(name));
        friends.sort(function(a, b) {
            if ((!a.guid.contains(":0x") ? a.name.toLowerCase() : a.name.toLowerCase()) < (!b.guid.contains ? b.toLowerCase() : b.name.toLowerCase())) return -1;
            if ((!a.guid.contains(":0x") ? a.name.toLowerCase() : a.name.toLowerCase()) > (!b.guid.contains ? b.toLowerCase() : b.name.toLowerCase())) return 1;
            return 0;
        });
        friends.sort(function(a, b) {
            if (onlinePlayers.isOnline(a.guid) > onlinePlayers.isOnline(b.guid)) return -1;
            if (onlinePlayers.isOnline(a.guid) < onlinePlayers.isOnline(b.guid)) return 1;
            return 0;
        });
        localStorage.setItem("friends", JSON.stringify(friends));
        updateFriends();
        loadFriends();
    }
}

$(document).ready(function() {
    totalPlayersLoop();
    $(window).resize(function() {
        settings.resolution.update();
    });
    Chat.initialize();
    Mousetrap.bind('a', function() {
        $(".control-A").trigger('click');
    });
    Mousetrap.bind('b', function() {
        $(".control-B").trigger('click');
    });
    Mousetrap.bind('x', function() {
        $(".control-X").trigger('click');
    });
    Mousetrap.bind('y', function() {
        $(".control-Y").trigger('click');
    });
    Mousetrap.bind('up', function() {
        Controller.backward();
    });
    Mousetrap.bind('down', function() {
        Controller.forward();
    });
    $('#main-menu').click(function() {
        Menu.change("main");
        $('#main').show();
        $('#main2').hide();
    });
    $('#alert-yes').click(function() {
        var c = $('#alert').attr('data-callback');
        var d = $('#alert').attr('data-info');
        hideAlert(true, c, d);
    });
    $('#alert-no').click(function() {
        var c = $('#alert').attr('data-callback');
        hideAlert(false, c, false);
    });
    $('#friend-add').click(function() {
        Audio.slide.currentTime = 0;
        Audio.slide.play();
        addFriend($('#friend-search input').val());
        $('#friend-search input').val("");
    });
    $('#click-menu li').click(function() {
        submenu($(this).attr('data-action'), $('#click-menu').attr('data-friend'));
    });
    $('#click-menu li').hover(function() {
        Audio.click.currentTime = 0;
        Audio.click.play();
    });
    $('#click-menu-container').click(function() {
        $(this).hide();
    });
    $('*[data-gp]').mouseenter(function() {
        if ($(this).attr('data-setting')) {
            return false;
        }
        var a = $(this).attr('data-gp').split("-"),
            b = parseInt(a[a.length - 1]);
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
                if (c) {
                    window.location = "http://scooterpsu.github.io/";
                    dewRcon.send('game.menuurl "http://scooterpsu.github.io/"');
                }
            }
        });
    });
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
    Mousetrap.bind(['t', 'y'], function(e) {
        if ($.inArray(Menu.selected, ["customgame", "forge"]) >= 0)
            dew.show("chat", {
                'captureInput': true,
                'teamChat': e.keyCode == 121
            });
    });
    initialize();
    Audio.music.play();
    Audio.music.addEventListener('ended', function() {
        if (settings.shufflemusic.current === 1) {
            changeSong2(nextSong);
        } else {
            changeSong2(thisSong);
        }
    });
    $('#browser-full').click(function() {
        if (Browser.filters.full) {
            Browser.filters.full = false;
            $(this).children('.checkbox').toggleClass('checked');
        } else {
            Browser.filters.full = true;
            $(this).children('.checkbox').toggleClass('checked');
        }
        Browser.filter();
    });
    $('#browser-locked').click(function() {
        if (Browser.filters.locked) {
            Browser.filters.locked = false;
            $(this).children('.checkbox').toggleClass('checked');
        } else {
            Browser.filters.locked = true;
            $(this).children('.checkbox').toggleClass('checked');
        }
        Browser.filter();
    });
    $('#browser-sprint').click(function() {
        if (Browser.filters.sprint) {
            Browser.filters.sprint = false;
            $(this).children('.checkbox').toggleClass('checked');
        } else {
            Browser.filters.sprint = true;
            $(this).children('.checkbox').toggleClass('checked');
        }
        Browser.filter();
    });
    $('#refresh').click(function() {
        Browser.load();
        Browser.filter();
    });
    $('#direct-connect').click(function() {
        var ip = prompt("Enter IP Address: ");
        Lobby.joinIP(ip);
    });
    $('#quit').click(function() {
        dewRcon.send('Game.SetMenuEnabled 0');
    });
    $('#clear').click(function() {
        Browser.filters.clear();
    });
    $('#version').click(function() {
        clearAllCookies();
    });
    var e = ((window.innerHeight - $('#menu').height()) / 2) - 40;
    Audio.connect.volume = settings.musicvolume.current * 0.01;
    Audio.music.volume = settings.musicvolume.current * 0.01;
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
});

function totalPlayersLoop() {
    $.getJSON(infoIP + "/all", function(data) {
        serverz = data;
        console.log("SERVED");
        for (var i = 0; i < serverz.servers.length; i++) {
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
                        $('#ping-' + i).text(ping);
                    }
                });
            })(i);
        }
        $('#players-online').text(serverz.count);
        loadParty();
        if (!friendServerConnected)
            loadFriends();
    }).fail(function(d) {
        console.log(infoIP + " is currently down.");
        infoIP = (infoIP == "http://158.69.166.144:8081" ? "http://servers.thefeeltra.in" : "http://158.69.166.144:8081");
        console.log("Switched to " + infoIP + ".");
        totalPlayersLoop();
    });
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

    if ((typeof currentServer.players !== 'undefined' && typeof currentServer.players.current !== 'undefined' && currentServer.players.current == currentServer.players.max) || (typeof currentServer.numPlayers !== 'undefined' && currentServer.numPlayers == currentServer.maxPlayers)) {
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
            for (var i = 0; i < party.length; i++) {
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
    Audio.music.pause();
    $('#black').fadeIn(3000);
    delay(function() {
        if (mode[0] === "JOIN") {
            //$('#hoImage').css('background-image','url(./img/' + settings.logo.labels[settings.logo.current] + '.png)');
            dewRcon.send('connect ' + ip + ' ' + password, function(ret) {
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
                $('#loadingMapName').text(currentServer.map.toString().toUpperCase().replace("BUNKERWORLD", "STANDOFF")); //lazy
                $('#loadingMapImage').css('background-image', 'url(./img/loading/maps/' + getMapName(currentServer.mapFile.toString()).replace(/ /g, "").toLowerCase() + '.jpg)');
                $('#loadingGametypeImage').css('background-image', 'url(./img/gametypes/' + currentServer.variantType.toString().capitalizeFirstLetter() + '.png)');
                $('#mapOverlay').css('background-image', 'url(./img/loading/maps/' + currentServer.map.toString().replace(/ /g, "").toLowerCase() + '-overlay.png)');
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
            $('#loadingMapImage').css('background-image', 'url(./img/loading/maps/' + currentServer.map.toString().replace(/ /g, "").toLowerCase() + '.jpg)');
            $('#loadingGametypeImage').css('background-image', 'url(./img/gametypes/' + currentServer.variantType.toString().capitalizeFirstLetter() + '.png)');
            $('#mapOverlay').css('background-image', 'url(./img/loading/maps/' + currentServer.map.toString().replace(/ /g, "").toLowerCase() + '-overlay.png)');
            $('#loading').show();
            $('#back').hide();
            dewRcon.send('game.forceload ' + getMapFile($('#currentmap').text().toString().toLowerCase()) + ' 5')
        } else if (mode[0] === "START" && mode[1] === "GAME") {
            dewRcon.send('start');
        }
    }, 3700);
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
    Audio.music.src = directory + currentAlbum + "/" + song + '.ogg';
    Audio.music.play();
    localStorage.setItem('song', song);
    localStorage.setItem('album', currentAlbum);
    Audio.notification.currentTime = 0;
    Audio.notification.play();
}
