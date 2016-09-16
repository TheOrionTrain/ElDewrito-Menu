/*
    (c) 2016 Brayden Strasen & Ryan Palmer
    http://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var players = [],
    serverz = [],
    user = "", //Temporary Fix
    anit = 400,
    servers,
    online = true,
    totallyLoopingPlayers = setInterval(totalPlayersLoop, 10000),
    mapList,
    friends = [],
    friends_online,
    Aud = Audio;

(function() {
    if (window.location.protocol == "https:") {
        alert("The server browser doesn't work over HTTPS, switch to HTTP if possible.");
    }
})();

function initialize() {
    $.getJSON("http://tracks.thefeeltra.in/update", function(data) {
        console.log(data);
    });
    var set, b, g, i, e;
    $.getJSON("http://music.thefeeltra.in/music.json", function(j) {
        Music.list = j;
        Music.change(isset(localStorage.getItem('song'), "Mythic Menu Theme"));
        Music.song.volume = Settings.menu.musicvolume.current;
        Music.song.play();
        Music.song.addEventListener('ended', function() {
            if (settings.shufflemusic.current === 1) {
                Music.change(Music.next);
            } else {
                Music.change(Music.name);
            }
        });
    });
    Settings.menu.background.choices = Object.keys(backgrounds);
    for (i = 0; i < Object.keys(settings).length; i++) {
        var set = Object.keys(settings)[i],
            category = settings[set].category;
        ++catergories[category];
        settings[set].update();
    }
    $.getJSON("http://orion.thefeeltra.in/matchmaking/Standard.json", function(json) {
        Options.playlist.options.standard = json;
        for (i = 0; i < Object.keys(json).length; i++) {
            var list1 = "",
                list2 = "",
                maps = Options.playlist.options.standard[Object.keys(json)[i]].Maps,
                types = Options.playlist.options.standard[Object.keys(json)[i]].Types;
            for (e = 0; e < maps.length; e++) {
                list1 += "<li>" + maps[e].displayName + "</li>";
            }
            for (g = 0; g < types.length; g++) {
                list2 += "<li>" + types[g].displayName + "</li>";
            }
            Options.playlist.options.standard[Object.keys(json)[i]].description = "<ul><li class='label'>MAPS</li>" + list1 + "</ul><ul><li class='label'>GAMETYPES</li>" + list2 + "</ul>";
        }
    });
    $.getJSON("http://orion.thefeeltra.in/matchmaking/Social.json", function(json) {
        Options.playlist.options.social = json;
        for (i = 0; i < Object.keys(json).length; i++) {
            var list1 = "",
                list2 = "",
                maps = Options.playlist.options.social[Object.keys(json)[i]].Maps,
                types = Options.playlist.options.social[Object.keys(json)[i]].Types;
            for (e = 0; e < maps.length; e++) {
                list1 += "<li>" + maps[e].displayName + "</li>";
            }
            for (g = 0; g < types.length; g++) {
                list2 += "<li>" + types[g].displayName + "</li>";
            }
            Options.playlist.options.social[Object.keys(json)[i]].description = "<ul><li class='label'>MAPS</li>" + list1 + "</ul><ul><li class='label'>GAMETYPES</li>" + list2 + "</ul>";
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
                Audio.play("click");
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
        Audio.play("click");
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
        Audio.play("slide");
    });
    $('#hide-search').click(function() {
        $('#friend-search').fadeOut(anit);
        Audio.play("slide");
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
        Audio.play("click");
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
        Audio.play("slide");
    });
    $('#party .friend, #current-party td.name').unbind().click(function(e) {
        if ($(this).text() != pname) {
            partysubmenu("show", $(this).text(), e);
            Audio.play("slide");
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
        Audio.play("notification");
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
    Settings.load(0);
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
        Audio.play("slide");
        addFriend($('#friend-search input').val());
        $('#friend-search input').val("");
    });
    $('#click-menu li').click(function() {
        submenu($(this).attr('data-action'), $('#click-menu').attr('data-friend'));
    });
    $('#click-menu li').hover(function() {
        Audio.play("click");
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
    Music.song.volume = settings.musicvolume.current * 0.01;
    Audio.click.volume = settings.sfxvolume.current * 0.01;
    Audio.notification.volume = settings.sfxvolume.current * 0.01;
    $('#start').click(function() {
        var mode = $('#start').children('.label').text().toString().split(" ");
        if (mode[1] === "FORGE" || (mode[0] === "START" && mode[1] === "GAME"))
            startgame("127.0.0.1:11775", mode, "");
        else
            startgame(Lobby.address, mode, "");
    });
    Mousetrap.bind('enter up up down down left right left right b a enter', function() {
        settings.background.current = 9001;
        settings.background.update();
    });
    $('.selection').hover(function() {
        Audio.play("click");
        $('.selection').removeClass('gp-on');
        $(this).addClass("gp-on");
        Controller.selected = $(this).attr('data-gp').split("-")[1];
        Controller.select(Menu.selected + "-" + Controller.selected);
        $('#description').text(Menu.description[$(this).attr('data-gp')]);
    });
});

function totalPlayersLoop() {
    $.getJSON(Menu.domain + "/all", function(data) {
        serverz = data;
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
        console.log(Menu.domain + " is currently down.");
        Menu.domain = (Menu.domain == "http://orion.thefeeltra.in:8081" ? "http://servers.thefeeltra.in" : "http://orion.thefeeltra.in:8081");
        console.log("Switched to " + Menu.domain + ".");
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
        Audio.play("notification");
        return;
    }
    if (!hasMap(Lobby.mapFile)) {
        var map = getMapName(Lobby.mapFile);
        dewAlert({
            title: "Missing Map",
            content: "You don't have " + ((map == "Edge" && Lobby.mapFile != "s3d_edge") ? Lobby.map : map) + ". Try finding it at <a href='https://www.reddit.com/r/HaloOnline/'>https://www.reddit.com/r/HaloOnline/</a>",
            acceptText: "OK"
        });
        return;
    }
    var password = pass;
    if (mode[0] === "JOIN" && pass == "")
        password = Lobby.password == true ? prompt(Lobby.name + " has a password, enter the password to join", "") : "";

    if ((typeof Lobby.players !== 'undefined' && typeof Lobby.players.current !== 'undefined' && Lobby.players.current == Lobby.players.max) || (typeof Lobby.numPlayers !== 'undefined' && Lobby.numPlayers == Lobby.maxPlayers)) {
        dewAlert({
            title: "Server Full",
            content: 'This server is full, try joining a different one.',
            acceptText: "OK"
        });
        Audio.play("notification");
        return;
    }

    if (party.length > 1) {
        if ((typeof Lobby.players !== 'undefined' && (Lobby.players.current + party.length) == Lobby.players.max) || (typeof Lobby.numPlayers !== 'undefined' && (Lobby.numPlayers + party.length) == Lobby.maxPlayers)) {
            dewAlert({
                title: "Not Enough Slots",
                content: 'There are not enough slots for your party, try joining a different one.',
                acceptText: "OK"
            });
            Audio.play("notification");
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
    Audio.play("beep");
    setTimeout(function() {
        Audio.play("beep");
    }, 1000);
    setTimeout(function() {
        Audio.play("beep");
    }, 2000);
    setTimeout(function() {
        Audio.play("beeep");
    }, 3000);
    Music.song.pause();
    $('#black').fadeIn(3000);
    delay(function() {
        if (mode[0] === "JOIN") {
            dewRcon.send('connect ' + ip + ' ' + password, function(ret) {
                if (!ret.contains("Attempting")) {
                    $.snackbar({
                        content: ret
                    });

                    $('#black').hide();
                    backButton.appendTo('body');
                    $.snackbar({
                        content: 'Failed to connect to server.'
                    });
                    Audio.play("notification");
                    return;
                }
            });
            if (Lobby.status != "InLobby") {
                setTimeout(function() {
                    dewRcon.send('Game.SetMenuEnabled 0');
                }, 10000);
            } else {
                dewRcon.send('Game.SetMenuEnabled 0');
            }
        } else if (mode[1] === "FORGE") {
            dewRcon.send('game.forceload ' + getMapFile($('#currentmap').text().toString().toLowerCase()) + ' 5')
        } else if (mode[0] === "START" && mode[1] === "GAME") {
            dewRcon.send('start');
        }
    }, 3700);
}
