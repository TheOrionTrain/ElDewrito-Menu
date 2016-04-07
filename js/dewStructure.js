var Menu = {
    "main" : {
        "position" : "top",
        "back" : "main2",
        "playerlist" : 1,
        "friendslist" : 1
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
            $('#lobby').empty();
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
            $('#friends-on').stop().fadeIn(anit);
        }
    },
    "forge" : {
        "position" : "top",
        "video" : ["forge"],
        "back" : "main",
        "playerlist" : 1
    },
    "description" : {
        "main-1" : "Take your party to view the current multiplayer servers online that are available to join.",
        "main-2" : "Take your party online and into the frenetic action of live combat, objective-based missions, and dangerous military exercises.",
        "main-3" : "Take your party to combat and objective-based missions that you select and design. Your rules, your maps, your game.",
        "main-4" : "Take your party to collaborate in real time to edit and play variations of your favorite maps, from the subtle to the insane.",
        "main-5" : "Change how the game or menu plays or looks. You can customize everything from music, to the background, to the appearance of the server browser.",
        "main-6" : "View the team of people who worked hard to build and take this menu to where it is today.",
    }
};
