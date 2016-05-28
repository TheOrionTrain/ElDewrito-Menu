/*
    (c) 2016 Brayden Strasen & Ryan Palmer
    http://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var dewRcon,
    dewRconConnected = false,
    snacking = 0,
    played = 0,
    port = 11776,
    hook = false;
jQuery(function() {
    try {
        dewRcon = new dewHook();
        dew.on("pong", function(event) {
            // event.data.address contains the IPv4 address
            // event.data.latency contains the latency in milliseconds
        });

        dew.on("show", function(event) {
            // This code will be run when your screen is shown.
            // Use event.data to access any data passed to your screen.

            $('#music')[0].play();
            $("video").each(function() {
                console.log($(this).attr('id'));
                $(this)[0].play();
            });

            totallyLoopingPlayers = setInterval(totalPlayersLoop, 10000);
        });

        dew.on("hide", function(event) {
            // This code will be run when your screen is hidden.

            $('#music')[0].pause();
            $("video").each(function() {
                console.log($(this).attr('id'));
                $(this)[0].pause();
            });

            loopPlayers = false;
            clearInterval(totallyLoopingPlayers);
        });

        hook = true;
        loadSettings(0);
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
        //loadSettings(Object.keys(settings).length);
        loadSettings(0);
        console.log("rcon");
    };
    dewRcon.dewWebSocket.onerror = function() {
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
        if (!dewRconConnected) {
            setTimeout(StartRconConnection, 1000);
        }
    };
    dewRcon.dewWebSocket.onmessage = function(message) {
        //console.log(message.data);
        if (typeof dewRcon.callback == 'function')
            dewRcon.callback(message.data);
        dewRcon.lastMessage = message.data;
        //console.log(dewRcon.lastMessage);
    };
}

dewRconHelper = function() {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    this.dewWebSocket = new WebSocket('ws://127.0.0.1:' + port, 'dew-rcon');
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
