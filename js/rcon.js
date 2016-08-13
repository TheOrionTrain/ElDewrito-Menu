/*
    (c) 2016 Brayden Strasen & Ryan Palmer
    http://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var dewRcon,
    dewRconConnected = false,
    snacking = 0,
    played = 0,
    port = 11776,
    hook = false,
    fails = 0;
jQuery(function() {
    try {
        dewRcon = new dewHook();
        dew.on("pong", function(event) {});

        dew.on("show", function(event) {
            $('#music')[0].play();
            $("video").each(function() {
                console.log($(this).attr('id'));
                $(this)[0].play();
            });

            totallyLoopingPlayers = setInterval(totalPlayersLoop, 10000);
        });

        dew.on("hide", function(event) {
            $('#music')[0].pause();
            $("video").each(function() {
                console.log($(this).attr('id'));
                $(this)[0].pause();
            });
            clearInterval(totallyLoopingPlayers);
        });

        dew.on("VoteCountsUpdated", function(event) {
            event.data.forEach(function(entry, i) {
                $('#select-voting .selection[data-option="' + entry.OptionIndex + '"] .votes').text(entry.Count);
            });
        });

        dew.on("Winner", function(event) {
            clearInterval(Lobby.voting.timeleft);
            setTimeout(function() {
                dew.hide();
            }, 4000);
        });

        dew.on("VotingOptionsUpdated", function(event) {
            if (Lobby.voting.status != 1 && Menu.selected == "customgame")
                Lobby.voting.start();
            clearInterval(Lobby.voting.timeleft);
            if (JSON.stringify(Lobby.voting.previous) != JSON.stringify(event.data)) {
                $('#select-voting').empty();
                event.data.votingOptions.forEach(function(entry, i) {
                    if (entry.mapname == "Revote")
                        $('#select-voting').append("<div data-option='" + entry.index + "' class='selection' data-gp='voting-" + entry.index + "'><div class='info' style='width:320px;vertical-align:middle;padding:0 0 0 0;font-size:30px;'>NONE OF THE ABOVE</div><div class='votes'>0</div><div class='square'></div></div>");
                    else if (entry.mapname != '')
                        $('#select-voting').append("<div data-option='" + entry.index + "' class='selection' data-gp='voting-" + entry.index + "'><div class='thumb'><img src='img/maps/" + getMapName(entry.image).toString().toUpperCase() + ".jpg'></div><div class='info'>" + entry.mapname + "<br/>" + entry.typename + "</div><div class='votes'>0</div><div class='square'></div></div>");
                });
                $('#select-voting .selection').hover(function() {
                    Audio.click.currentTime = 0;
                    Audio.click.play();
                    $('.selection').removeClass('gp-on');
                    $(this).addClass("gp-on");
                    Controller.selected = $(this).attr('data-gp').split("-")[1];
                    Controller.select("voting-" + Controller.selected);
                }).click(function() {
                    var v = parseInt($(this).attr('data-option'));
                    console.log(v);
                    Audio.slide.currentTime = 0;
                    Audio.slide.play();
                    Lobby.voting.send(v);
                });
                Lobby.voting.previous = event.data;
            }
            Lobby.voting.seconds_left = event.data.timeRemaining;
            Lobby.voting.timeleft = setInterval(function() {
                $('#description').text("Voting round ends in: " + secondsToHms(--Lobby.voting.seconds_left));

                if (Lobby.voting.seconds_left <= 0) {
                    $('#description').text("Voting round ends in: 0:00");
                    clearInterval(Lobby.voting.timeleft);
                }
            }, 1000);
        });

        dew.on("serverconnect", function(event) {
            console.log(event);
        });

        hook = true;
        Settings.load(0);
    } catch (err) {
        console.log(err);
        if (getURLParameter('offline') !== "1") {
            StartRconConnection();
        }
    }
});
StartRconConnection = function() {
    dewRcon = new dewRconHelper();
    dewRcon.dewWebSocket.onopen = function() {
        Audio.notification.currentTime = 0;
        Audio.notification.play();
        dewRconConnected = true;
        Settings.load(0);
        console.log("rcon");
    };
    dewRcon.dewWebSocket.onerror = function() {
        fails++;
        if (!snacking) {
            $.snackbar({
                content: 'Not connected. Is the game running?'
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
        dewRconConnected = false;
        if (!dewRconConnected && fails < 5) {
            setTimeout(StartRconConnection, 1000);
        } else if (fails >= 5) {
            $.snackbar({
                content: 'Unable to connect to the game. Switched to offline mode.'
            });
            Audio.notification.currentTime = 0;
            Audio.notification.play();
        }
    };
    dewRcon.dewWebSocket.onmessage = function(message) {
        if (typeof dewRcon.callback == 'function')
            dewRcon.callback(message.data);
        dewRcon.lastMessage = message.data;
    };
}

dewRconHelper = function() {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    this.dewWebSocket = new WebSocket('ws://127.0.0.1:' + port);
    this.lastMessage = "";
    this.lastCommand = "";
    this.open = false;
    this.callback = {};
    this.send = function(command, cb) {
        this.callback = cb;
        this.dewWebSocket.send(command);
        this.lastCommand = command;
    }
}

dewHook = function() {
    this.callback = {};
    this.send = function(command, cb) {
        this.callback = cb;
        dew.command(command, {}).then(function(ret) {
            if (typeof dewRcon.callback == 'function')
                dewRcon.callback(ret);
        });
    }
}
