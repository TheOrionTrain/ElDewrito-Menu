var DewMenu = {
    "change" : function(m) {
        var ch = DewMenu.pages[m];
        $('#select-title').text(ch.title);
        $('#select-previous').text(ch.previous);
        $('#lobby-container > table').hide();
        for(var i=0;i<ch.lists.length;i++) {
            $('#'+ch.lists[i]).show();
        }
        if(ch.lists.length > 0) {
            $('#lobby-container').removeClass().addClass('showing');
        } else {
            $('#lobby-container').removeClass().addClass('hidden');
        }
        if(ch.logo) {
    		$('#dewrito').removeClass().addClass("animated "+ch.logo);
    	} else {
    		$('#dewrito').removeClass().addClass("animated hidden");
    	}
        $('#select-main').empty();
        for(var i=0;i<Object.keys(ch.options).length;i++) {
            var da = ch.options[Object.keys(ch.options)[i]];
            $('#select-main').append("<div class='selection' data-gp='"+m+"-"+(i+1)+"'>"+Object.keys(ch.options)[i]+"</div>");
        }
        $('#controls').empty();
        for(var i=0;i<Object.keys(ch.controls).length;i++) {
            var co = ch.controls[Object.keys(ch.controls)[i]];
            $('#controls').append("<div class='control-"+Object.keys(ch.controls)[i]+"'>"+co.label+"</div>");
        }
        gamepadSelect(m+"-1");
        DewMenu.selected = m;
        $('#select-main .selection').hover(function() {
			$('#click')[0].currentTime = 0;
			$('#click')[0].play();
            $('.selection').removeClass('gp-on');
    		$(this).addClass("gp-on");
    		gp_on = $(this).attr('data-gp').split("-")[1];
    		gamepadSelect(DewMenu.selected + "-" + gp_on);
            $('#description').text(DewMenu.pages[DewMenu.selected].options[Object.keys(DewMenu.pages[DewMenu.selected].options)[parseInt(gp_on)-1]].description)
		});
    },
    "previous" : function() {
        console.log("previous");
    },
    "pages" : {
        "main" : {
            "title" : "MAIN MENU",
            "previous" : " ",
            "thumbnail": 0,
            "lists" : [
                "current-party",
                "friends-on"
            ],
            "options": {
                "BROWSE SERVERS" : {
                    "description" : "Take your party to view the current multiplayer servers online that are available to join.",
                    "action" : function() {DewMenu.change("serverbrowser")}
                },
                "MATCHMAKING" : {
                    "description" : "Take your party online and into the frenetic action of live combat, objective-based missions, and dangerous military exercises.",
                    "action" : function() {DewMenu.change("matchmaking")}
                },
                "CUSTOM GAMES" : {
                    "description" : "Take your party to combat and objective-based missions that you select and design. Your rules, your maps, your game.",
                    "action" : function() {DewMenu.change("customgame")}
                },
                "FORGE" : {
                     "description" : "Take your party to collaborate in real time to edit and play variations of your favorite maps, from the subtle to the insane.",
                     "action" : function() {DewMenu.change("forge")}
                },
                "SETTINGS" : {
                    "description" : "Change how the game or menu plays or looks. You can customize everything from music, to the background, to the appearance of the server browser.",
                    "action" : function() {DewMenu.change("settings")}
                },
                "CREDITS" : {
                    "description" : "View the team of people who worked hard to build and take this menu to where it is today.",
                    "action" : function() {DewMenu.change("credits")}
                }
            },
            "controls" : {
                "A" : {
                    "label" : "Select",
                    "action" : function() {
                        $('.gp-on').trigger('click');
                    }
                },
                "B" : {
                    "label" : "Back",
                    "action" : function(){DewMenu.previous()}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        gamepadSelect("lobby-1");
                    }
                }
            }
        }
    },
    "selected" : "main"
};
