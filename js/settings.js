var settings = {
    "musictrack" : {
        "current" : 6,
        "min" : 0,
        "max" : 7,
        "default" : 6,
        "labels" : [
            "Halo Reach",
            "Halo Reach Beta",
            "Halo Combat Evolved",
            "Halo 2",
            "Halo 2 Guitar",
            "Halo 3",
            "Halo 3 Mythic",
            "Halo 3 ODST"
        ],
        "increment" : 1,
        "update" : function() {
            var c = settings.musictrack.current;
            $('#music').attr('src','audio/'+settings.musictrack.labels[c]+'.ogg');
            $("[data-option='musictrack']").children('.value').text(settings.musictrack.labels[c]);
        }
    },
    "resolution" : {
        "current" : 0.5,
        "min" : 0,
        "max" : 1.5,
        "default" : 0.5,
        "labels" : [
            "640x360",
            "1280x720",
            "1920x1080",
            "2560x1440"
        ],
        "increment" : 0.5,
        "update" : function() {
            var c = settings.resolution.current;
            $('#menu').css('-webkit-transform','scale('+(0.5+c)+')');
            $("[data-option='resolution']").children('.value').text(settings.resolution.labels[c/0.5]);
        }
    },
    "background" : {
        "current" : 0,
        "min" : 0,
        "max" : 1,
        "default" : 0,
        "labels" : [
            "Halo Reach",
            "Crash"
        ],
        "increment" : 1,
        "update" : function() {
            var c = settings.background.current;
            $('#bg').attr('src','video/'+settings.background.labels[c]+'.mp4');
            $("[data-option='background']").children('.value').text(settings.background.labels[c]);
        }
    },
    "musicvolume" : {
        "current" : 0.25,
        "min" : 0,
        "max" : 1,
        "default" : 0.25,
        "increment" : 0.05,
        "update" : function() {
            var c = settings.musicvolume.current;
            $('#music')[0].volume = c;
            $("[data-option='musicvolume']").children('.value').text(Math.round(c*100));
        }
    },
    "sfxvolume" : {
        "current" : 0.05,
        "min" : 0,
        "max" : 1,
        "default" : 0.05,
        "increment" : 0.05,
        "update" : function() {
            var c = settings.sfxvolume.current;
            $('#click')[0].volume = c;
            $('#slide')[0].volume = c;
            $("[data-option='sfxvolume']").children('.value').text(Math.round(c*100));
        }
    }
},

maps = {
    "HaloOnline" : {
        "DIAMONDBACK" : "Hot winds blow over what should be a dead moon. A reminder of the power the Forerunners once wielded. 6-16 players.",
        "EDGE" : "The remote frontier world of Parition has provided this ancient databank with the safety of seclusion. 6-16 players.",
        "GUARDIAN" : "Millennia of tending has produced trees as ancient as the Forerunner structures they have grown around. 2-6 players",
        "ICEBOX" : "Though they dominate on the open terrain, many Scarabs have fallen victim to the narrow streets of Earth's cities. 4-10 players.",
        "REACTOR" : "Being constructed just prior to the Invasion, its builders had to evacuate before it was completed. 6-16 players.",
        "RIVERWORLD" : "The crew of V-398 barely survived their unplanned landing in this gorge... this curious gorge. 6-16 players."
    },
    "HaloReach" : {
        "ANCHOR 9" : "Map description goes here. 1-16 players.",
        "BATTLE CANYON" : "Map description goes here. 1-16 players.",
        "BOARDWALK" : "Map description goes here. 1-16 players.",
        "BONEYARD" : "Map description goes here. 1-16 players.",
        "BREAKNECK" : "Map description goes here. 1-16 players.",
        "BREAKPOINT" : "Map description goes here. 1-16 players.",
        "CONDEMNED" : "Map description goes here. 1-16 players.",
        "COUNTDOWN" : "Map description goes here. 1-16 players.",
        "HIGH NOON" : "Map description goes here. 1-16 players.",
        "HIGHLANDS" : "Map description goes here. 1-16 players.",
        "PENANCE" : "Map description goes here. 1-16 players.",
        "POWERHOUSE" : "Map description goes here. 1-16 players.",
        "REFLECTION" : "Map description goes here. 1-16 players.",
        "RIDGELINE" : "Map description goes here. 1-16 players.",
        "SOLITARY" : "Map description goes here. 1-16 players.",
        "SPIRE" : "Map description goes here. 1-16 players.",
        "SWORD BASE" : "Map description goes here. 1-16 players.",
        "TEMPEST" : "Map description goes here. 1-16 players.",
        "ZEALOT" : "Map description goes here. 1-16 players."
    }
};
