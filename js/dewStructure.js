var Menu = {
    "main" : {
        "position" : "top",
        "back" : "main2",
        "playerlist" : 1
    },
    "main2" : {
        "position" : "center",
        "logo" : "main"
    },
    "credits" : {
        "position" : "top",
        "video" : ["firefight"],
        "back" : "main",
        "logo" : "credits"
    },
    "serverbrowser" : {
        "position" : "top",
        "video" : ["matchmaking","multiplayer"],
        "back" : "main",
        "onchange" : function() {
    		browsing = 1;
    		$('#browser').empty();
    		setTimeout(loadServers, 1000);
    		loopPlayers = false;
    	}
    },
    "options" : {
        "position" : "center",
        "logo" : "options",
        "onchange" : function(m) {
            $('#back').hide();
            if(m) {
                $('.options-section').hide();
                $('#'+m).show();
                if(Menu.options.menus[m]) {
                    $('#back').fadeIn(anit);
            		$('#back').attr('data-action', "options,"+Menu.options.menus[m]+",fade");
                }
            }
        },
        "menus" : {
            "dewrito-options" : "main2",
            "matchmaking" : "main",
            "choosemap" : "serverbrowser",
            "choosetype" : "serverbrowser"
        }
    },
    "customgame" : {
        "position" : "top",
        "video" : ["custom_games","multiplayer"],
        "back" : "main",
        "playerlist" : 1,
        "onchange" : function(f) {
            if(f == "serverbrowser") {
                Menu.customgame.video = Menu.serverbrowser.video;
            } else {
                Menu.customgame.video = ["custom_games","multiplayer"];
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
            $('#lobby').empty();
    		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span class='numbers'><span id='joined'>0</span>/<span id='maxplayers'>0</span></span></td></tr>");
    		$('#start').children('.label').text("START GAME");
    		playersJoin(1, 2, 20, "127.0.0.1:11775");
        }
    },
    "forge" : {
        "position" : "top",
        "video" : ["forge"],
        "back" : "main",
        "playerlist" : 1
    }
};
