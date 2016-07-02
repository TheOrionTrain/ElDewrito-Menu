/*
    (c) 2016 Brayden Strasen & Ryan Palmer
    http://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var matchmakingServer,
    matchmakingServerConnected = false,
    snacking = 0,
    played = 0;

StartMatchmakingConnection = function() {
    matchmakingServer = new matchmakingServerHelper();
    matchmakingServer.matchmakingServerSocket.onopen = function() {
        matchmakingServer.send(JSON.stringify({
            type: "connection",
            message: " has connected.",
            player: player
        }));
        matchmakingServerConnected = true;
    };

    matchmakingServer.matchmakingServerSocket.onclose = function() {
        $.snackbar({
            content: 'Lost Connection to Matchmaking Server'
        });
        Audio.notification.currentTime = 0;
        Audio.notification.play();
        matchmakingServerConnected = false;
    };

    matchmakingServer.matchmakingServerSocket.onerror = function() {
        if (!snacking) {
            $.snackbar({
                content: 'Connection to Matchmaking Server failed, retrying.'
            });
            if (!played) {
                Audio.notification.currentTime = 0;
                Audio.notification.play();
                played = 1;
            }
            snacking = 1;
            setTimeout(function() {
                snacking = 0;
            }, 9000);
        }
        matchmakingServerConnected = false;
        if (!matchmakingServerConnected) {
            setTimeout(StartMatchmakingConnection, 1000);
        }
    };

    matchmakingServer.matchmakingServerSocket.onmessage = function(message) {
        try {
            var result = JSON.parse(JSON.stringify(eval('(' + message.data + ')')));
            switch (result.type) {
                case "disconnected":

                    break;
                case "updatesearch":
                    console.log(result);
                    $("#search").empty().append('<tr class="top"><td class="info" colspan="2">Searching... <span id="search-count">' + result.players.length + '/' + Setting.playlist.options[Setting.playlist.selected.toLowerCase()][Setting.playlist.current].maxPlayers + '</span></td></tr>');
                    var isDev = (developers.indexOf(puid) >= 0) ? "developer" : "";
                    addPlayer("search", player, isDev);
                    for (var i = 0; i < result.players.length; i++) {
                        var isDev2 = (developers.indexOf(result.players[i].guid) >= 0) ? "developer" : "";
                        if (result.players[i].guid != puid)
                            addPlayer("search", result.players[i], isDev2);
                    }
                    for (var i = 0; i < (Setting.playlist.options[Setting.playlist.selected.toLowerCase()][Setting.playlist.current].maxPlayers - result.players.length); i++) {
                        addPlayer("search", {
                            name: "Looking for player...",
                            guid: "000000",
                            colour: "#BDBDBD",
                            rank: 0
                        }, null, 0.6);
                    }
                    break;
                case "connect":
                    clearInterval(dot);
                    dewRcon.send('connect "' + result.server.ip + '"');
                    setTimeout(function() {
                        Menu.change("customgame");
                        $('#select-main').hide();
                        $("#select-title").text("MATCH FOUND");
                    }, 2000);
                    break;
                case "id":
                    player.id = result.id;
                    break;
                default:
                    console.log("Unhandled packet: " + result.type);
                    break;
            }
        } catch (e) {
            console.log(e);
            console.log(message.data);
        }

        if (typeof matchmakingServer.callback == 'function')
            matchmakingServer.callback(message.data);
        matchmakingServer.lastMessage = message.data;
    };
}

var dot;
var dotCount = 0;
var backwards = false;

function dots() {
    var dts = getDots();
    $("#select-main [data-option='SEARCHING FOR PLAYERS...']").text("SEARCHING FOR PLAYERS" + dts);
    if ($("#search tr:not(.top) .name:contains('Looking for player')").length <= 0)
        return;
    $("#search tr:not(.top) .name:contains('Looking for player')").text("Looking for player" + dts);
}

function getDots() {
    var dotdot = "";
    if (dotCount >= 3) {
        backwards = true;
    } else if (dotCount < 0) {
        backwards = false;
    }

    if (backwards)
        dotCount--;
    else
        dotCount++;

    for (var i = 0; i < dotCount; i++)
        dotdot += ".";

    return dotdot;
}

function startSearch(playlist) {
    console.log(playlist);
    $("#search").empty().append('<tr class="top"><td class="info" colspan="2">Searching... <span id="search-count">' + party.length + '/' + Setting.playlist.options[Setting.playlist.selected.toLowerCase()][Setting.playlist.current].maxPlayers + '</span></td></tr>');
    for (var i = 0; i < party.length; i++) {
        var isDev = (developers.indexOf(party[i].guid) >= 0) ? "developer" : "";
        addPlayer("search", {
            name: party[i].name,
            guid: party[i].guid,
            colour: party[i].colour,
            rank: party[i].rank,
        }, isDev);
    }
    for (var i = 0; i < (Setting.playlist.options[Setting.playlist.selected.toLowerCase()][Setting.playlist.current].maxPlayers - party.length); i++) {
        addPlayer("search", {
            name: "Looking for player",
            guid: "000000",
            colour: "#BDBDBD",
            rank: 0
        }, null, 0.6);
    }

    dot = setInterval(dots, 250);

    matchmakingServer.send(JSON.stringify({
        type: "search",
        playlist: playlist,
        players: party
    }));
}

matchmakingServerHelper = function() {
    window.WebSocket2 = window.WebSocket2 || window.MozWebSocket2;
    this.matchmakingServerSocket = new WebSocket('ws://182.239.214.210:55555/matchmakingServer', 'matchmakingServer');
    this.lastMessage = "";
    this.lastCommand = "";
    this.open = false;
    this.callback = {};
    this.send = function(command, cb) {
        this.callback = cb;
        this.matchmakingServerSocket.send(command);
        this.lastCommand = command;
    }
}
