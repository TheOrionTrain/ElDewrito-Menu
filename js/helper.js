/*
    (c) 2016 Brayden Strasen & Ryan Palmer
    http://creativecommons.org/licenses/by-nc-sa/4.0/
*/
function isset(val, other) {
    return (val !== undefined && val !== null && val !== "") ? val : other;
}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
}

function randomNum(n) {
    return Math.floor(Math.random() * n);
}

function sanitizeString(str) {
    return String(str).replace(/(<([^>]+)>)/ig, "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.contains = function(it) {
    return this.indexOf(it) != -1;
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

Array.prototype.remove = function(value) {
    var index = this.indexOf(value);
    if (index > -1) {
        this.splice(index, 1);
    }
}

Array.prototype.getFromGUID = function(guid) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].guid == guid)
            return this[i];
    }
    return {
        name: "",
        guid: "",
        id: null,
        colour: "",
        rank: 0
    };
}

Array.prototype.getFromName = function(name) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].name == name)
            return this[i];
    }
    return {
        name: name,
        guid: "",
        id: null,
        colour: "",
        rank: 0
    };
}

Array.prototype.isOnline = function(guid) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].guid == guid)
            return true;
    }
    return false;
}

$.fn.pressEnter = function(fn) {
    return this.each(function() {
        $(this).bind('enterPress', fn);
        $(this).keyup(function(e) {
            if (e.keyCode == 13) {
                $(this).trigger("enterPress");
            }
        })
    });
};

jQuery.fn.scrollTo = function(elem, speed) {
    $(this).animate({
        scrollTop: $(this).scrollTop() - $(this).offset().top + $(elem).offset().top - 150
    }, speed == undefined ? 100 : speed);
    return this;
};

String.prototype.toTitleCase = function() {
    return this.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

function acr(s) {
    var words, acronym, nextWord;
    words = s.split(' ');
    acronym = "";
    index = 0;
    while (index < words.length) {
        nextWord = words[index];
        acronym = acronym + nextWord.charAt(0);
        index = index + 1;
    }
    return acronym.toUpperCase();
}

function hexToRgb(hex, opacity) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + opacity + ")";
}

function brighter(color) {
    var colorhex = (color.split("#")[1]).match(/.{2}/g);
    for (var i = 0; i < 3; i++) {
        var e = parseInt(colorhex[i], 16);
        e += 30;
        colorhex[i] = ((e > 255) ? 255 : e).toString(16);
    }
    return "#" + colorhex[0] + colorhex[1] + colorhex[2];
}

function clearAllCookies() {
    for (var i = 0; i < Object.keys(settings).length; i++) {
        var set = Object.keys(settings)[i];
        localStorage.removeItem(set);
    }
    localStorage.removeItem('song');
    localStorage.removeItem('album');
    alert("All cookies reset.");
    window.location.reload();
}


function checkFileExists(f) {
    $.ajax({
        url: f,
        type: 'HEAD',
        error: function() {
            return false;
        },
        success: function() {
            return true;
        }
    });
}

function getMapName(filename) {
    if (Menu.maps[filename]) {
        return Menu.maps[filename];
    } else {
        return "Edge";
    }
}

function getPlayerColour(guid) {
    if (guid == "000000")
        return "#BDBDBD";
    if (guid == puid)
        return colour;
    for (var i = 0; i < onlinePlayers.length; i++) {
        if (guid == onlinePlayers[i].guid) {
            return (onlinePlayers[i].colour === 'undefined' || onlinePlayers[i].colour.length < 1 || onlinePlayers[i].colour === null) ? "#000000" : onlinePlayers[i].colour;
        }
    }
    return "#000000";
}

function getPlayerName(UID) {
    for (var i = 0; i < onlinePlayers.length; i++) {
        if (onlinePlayers[i].guid == UID)
            return onlinePlayers[i].name;
    }
    return "";
}

function getPlayerUID(name) {
    for (var i = 0; i < onlinePlayers.length; i++) {
        if (onlinePlayers[i].name == name)
            return onlinePlayers[i].guid;
    }
    return "";
}

function getPlayerNameFromFriends(UID) {
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].guid == UID)
            return friends[i].name;
    }
    return "";
}

function getPlayerUIDFromFriends(name) {
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].guid.contains(":0x") && friends[i].name == name)
            return friends[i].guid;
    }
    return "";
}

function isOnlineServer(friend) {
    return typeof serverz.players[friend.contains(":0x") ? friend.split(':')[0] : friend] != 'undefined';
}

function isOnline(friend) {
    for (var i = 0; i < onlinePlayers.length; i++) {
        if ((friend.contains(":0x") && (onlinePlayers[i].guid == friend.split(':')[1])) | onlinePlayers[i].name == friend || (typeof serverz.players[friend.contains(":0x") ? friend.split(':')[0] : friend] != 'undefined'))
            return true;
    }
    return false;
}

function hasMap(map) {
    if (mapList[0].length == 0) {
        return true;
    } else if ($.inArray(map, mapList[0]) > -1) {
        return true;
    } else {
        return false;
    }
}

var delay = (function() {
    var timer = 0;
    return function(callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();

function getGame(game) {
    switch (game) {
        case "haloce":
            return "Halo Combat Evolved";
        case "hcea":
            return "Halo Anniversary";
        case "halo2":
            return "Halo 2";
        case "h2a":
            return "Halo 2 Anniversary";
        case "halo3":
            return "Halo 3";
        case "odst":
            return "Halo 3 ODST";
        case "reach":
            return "Halo Reach";
        case "online":
            return "Halo Online";
        case "halo5":
            return "Halo 5";
    }
}

function getMapFile(name) {
    for (var i = 0; i < Object.keys(Menu.maps).length; i++) {
        if (Menu.maps[Object.keys(Menu.maps)[i]] == name) {
            return Object.keys(Menu.maps)[i];
        }
    }
}

function getMapId(map) {
    switch (map.toString().toLowerCase()) {
        case "diamondback":
            return 0;
        case "edge":
            return 1;
        case "icebox":
            return 3;
        case "reactor":
            return 4;
        case "valhalla":
            return 5;
    }
}

var current_callback;

function dewAlert(options) {
    var defaults = {
        title: "Alert",
        content: "This is an alert",
        info: "",
        acceptText: "Accept",
        cancelText: "Cancel",
        cancel: 0,
        callback: false
    };
    $.each(defaults, function(index, value) {
        if (options && options[index]) {
            defaults[index] = options[index];
        }
    });
    $('#alert-title').text(defaults.title);
    $('#alert-content').html(defaults.content);
    $('#alert-yes').text(defaults.acceptText);
    $('#alert-no').text(defaults.cancelText);
    current_callback = defaults.callback;
    $('#alert').attr('data-info', defaults.info);
    if (defaults.cancel) {
        $('#alert-no').show();
    } else {
        $('#alert-no').hide();
    }
    $('#alert-container').fadeIn(anit);
    $('#alert').css('top', '200px');
    Audio.play("notification");
}

function hideAlert(clicked, callback, info) {
    if (current_callback != false) {
        current_callback(clicked, info);
    }
    $('#alert').css('top', '-300px');
    $('#alert-container').fadeOut(anit);
    $('#slide')[0].play();
}

function submenu(action, friend, isOnline, o) {
    if (action == "cancel") {
        $('#click-menu-container').hide();
    }
    if (action == "show") {
        console.log(o.pageX / Menu.scale);
        if (isOnlineServer(friend)) {
            $('#click-menu li.onlineserver').show();
            $('#click-menu li.online').hide();
        } else if (isOnline) {
            $('#click-menu li.online').show();
            $('#click-menu li.onlineserver').hide();
        } else {
            $('#click-menu li.online').hide();
            $('#click-menu li.onlineserver').hide();
        }
        $('#click-menu').css({
            "left": o.pageX / Menu.scale + "px",
            "top": o.pageY / Menu.scale + "px"
        }).attr("data-friend", friend);
        $('#click-menu-container').show();
    } else if (action == "join") {
        jumpToServer(serverz.players[friend].address);
        $('#click-menu-container').hide();
    } else if (action == "message") {
        if (!Chat.isOpen(friend.contains(":0x") ? friend.split(':')[0] : friend))
            Chat.createTab(friend.contains(":0x") ? friend.split(':')[0] : friend);
        Chat.showBox();
    } else if (action == "invite") {
        if (getPlayerUIDFromFriends(friend) == "" && getPlayerUID(friend) == "")
            return;

        friendServer.send(JSON.stringify({
            type: "partyinvite",
            player: pname,
            senderguid: puid,
            guid: getPlayerUIDFromFriends(friend) == "" ? getPlayerUID(friend) : getPlayerUIDFromFriends(friend)
        }));
        $('#click-menu-container').hide();
    } else if (action == "remove") {
        removeFriend(friend);
        $('#click-menu-container').hide();
    }
}

function partysubmenu(action, friend, o) {
    if (action == "cancel") {
        $('#click-menu-container').hide();
    }
    if (action == "show") {
        console.log(o.pageX / Menu.scale);
        if (getPlayerUIDFromFriends(friend) == "") {
            $('#party-click-menu li.notfriend').show();
        } else {
            $('#party-click-menu li.notfriend').hide();
        }
        $('#party-click-menu').css({
            "left": o.pageX / Menu.scale + "px",
            "top": o.pageY / Menu.scale + "px"
        }).attr("data-friend", friend);
        $('#click-menu-container').show();
    } else if (action == "kick") {
        friendServer.send(JSON.stringify({
            type: "kick",
            player: friend,
            guid: getPlayerUID(friend)
        }));
        $('#click-menu-container').hide();
    } else if (action == "message") {
        if (!Chat.isOpen(friend.contains(":0x") ? friend.split(':')[0] : friend))
            Chat.createTab(friend.contains(":0x") ? friend.split(':')[0] : friend);
        Chat.showBox();
    } else if (action == "add") {
        addFriend(friend + ":" + getPlayerUID(friend));
        $('#click-menu-container').hide();
    }
}
