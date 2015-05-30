
    /*
        (c) 2015 Brayden Strasen
        https://creativecommons.org/licenses/by-nc-sa/4.0/
    */

    var players = [],
        joined = 0,
        track = 5,
        scale = 1,
        anit = 400,
        currentGame = "HaloOnline";

    function initalize() {
        var set,b,g,i,e;
        for(i=0; i < Object.keys(settings).length; i++) {
            set = Object.keys(settings)[i];
            $('#dewrito-options').children('.options-select').append("<div data-option='"+set+"' class='selection'><span class='label'>"+settings[set].name+"</span><span class='left'></span><span class='value'>"+settings[set].default+"</span><span class='right'></span></div>");
        }
        for(i=0; i < Object.keys(maps).length; i++) {
            b = Object.keys(maps)[i];
            $('#choosemap').children('.map-select').append("<div data-game='"+b+"' class='selection'><span class='label'>"+maps[b].name+"</span></div>");
            $('#choosemap').append("<div class='map-select2 animated' id='maps-"+b+"'></div>");
            for(e=1; e < Object.keys(maps[b]).length; e++) {
                g = Object.keys(maps[b])[e];
                $('#maps-'+b).append("<div data-map='"+g+"' class='selection'><span class='label'>"+g+"</span></div>");
            }
        }
    }

    function changeSetting(s,by) {
        $('#click')[0].currentTime = 0;
        $('#click')[0].play();
        var e = settings[s];
        if(by == 1) {
            if(e.current < e.max) {e.current+=e.increment;}
            else {e.current=e.min;}
        }
        else if(by === 0) {
            if(e.current > e.min) {e.current-=e.increment;}
            else {e.current=e.max;}
        }
        settings[s] = e;
        e.update();
    }

    $(document).ready(function() {
        initalize();
        var e = ((window.innerHeight-$('#menu').height())/2)-40;
        $('#menu').css('margin-top',e+'px');
        $('#music')[0].volume = settings.musicvolume.current;
        $('#click')[0].volume = settings.sfxvolume.current;
        $('#start').click(function() {startgame();});
        $('.selection').hover(function() {
            $('#click')[0].currentTime = 0;
            $('#click')[0].play();
        });
        $('.map-select .selection').click(function() {changeMap1($(this).attr('data-game'));});
        $('.map-select2 .selection').click(function() {
            changeMap2($(this).attr('data-map'),0);
            changeMenu("options-custom");
        });
        $('.map-select2 .selection').hover(function() {changeMap2($(this).attr('data-map'));});
        $('.right').click(function() {
            var c = $(this).parent('.selection').attr('data-option');
            changeSetting(c,1);
        });
        $('.left').click(function() {
            var c = $(this).parent('.selection').attr('data-option');
            changeSetting(c,0);
        });
        $("[data-action='menu']").click(function() {changeMenu($(this).attr('data-menu'));});
        $('#back').click(function() { changeMenu($(this).attr('data-action')); });
    });

    String.prototype.toTitleCase = function() {return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});};

    function acr(s){
        var words, acronym, nextWord;
        words = s.split(' ');
        acronym= "";
        index = 0;
        while (index<words.length) {
            nextWord = words[index];
            acronym = acronym + nextWord.charAt(0);
            index = index + 1;
        }
        return acronym.toUpperCase();
    }

    function loadServers() {
        $('#browser').empty();
        $.getJSON( "servers.json", function(data) {
            servers = data;
            for(var i=0; i<servers.length; i++) {
                var p = (servers[i].map.toLowerCase()).toTitleCase();
                console.log(servers[i].gametype);
                if(servers[i].gametype.length > 12) {servers[i].gametype = acr(servers[i].gametype);}
                $('#browser').append("<div class='server' id='server"+i+"' data-server="+i+"><div class='thumb'><img src='img/maps/"+servers[i].map+".png'></div><div class='info'><span class='name'>"+servers[i].name+"</span><span class='settings'>"+servers[i].gametype+" on "+p+"</span></div><div class='players'>"+servers[i].players.current+"/"+servers[i].players.max+"</div></div>");
                $('#server'+i).css("display","none");
                $('#server'+i).delay(Math.floor(Math.random()*1000)+anit).fadeIn(anit);
            }
            $('.server').hover(function() {
                $('#click')[0].currentTime = 0;
                $('#click')[0].play();
            });
            $('.server').click(function() {changeMenu("serverbrowser-custom",$(this).attr('data-server'));});
        });
    }

    function playersJoin(number,max,time) {
        joined = 1;
        $('#lobby').empty();
        $('#lobby').append("<tr class='top'><td colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>0</span></td></tr>");
        $('#maxplayers').text(max);
        $.getJSON( "players.json", function( data ) {
            players = data;
            for(var i=0; i<number+1; i++) {
                $('#lobby').append("<tr id='player"+i+"' class='"+players[i].color+"'><td class='name'>"+players[i].name+"</td><td class='rank'><img src='img/ranks/"+players[i].rank+".png'</td></tr>");
                if(i > 0) {
                    $('#player'+i).css("display","none");
                    $('#player'+i).delay(Math.floor(Math.random()*time)).fadeIn(anit,callback);
                }
            }
            function callback() {joined++; $('#joined').text(joined);}
            $('#lobby tr').hover(function() {
                $('#click')[0].currentTime = 0;
                $('#click')[0].play();
            });
            $('#lobby tr').click(function() {
                var e = $(this).children('.name').text();
                changeMenu("custom-player",e);
            });
        });
    }

    function changeMenu(menu,details) {
        var f;
        if(menu == "main-custom") {
            $('#customgame').attr('data-from','main');
            $('#dewrito').css({"opacity":0, "top":"920px"});
            $('#back').fadeIn(anit);
            $('#back').attr('data-action','custom-main');
            $('#customgame').css({"top":"0px"});
            $('#main').css({"top":"720px"});
            playersJoin(15,16,10000);
        }
        if(menu == "custom-main") {
            $('#dewrito').css({"opacity":0.95, "top":"240px","-webkit-transition-timing-function":"400ms","-webkit-transition-delay":"0ms"});
            $('#customgame').css({"top":"-720px"});
            $('#main').css({"top":"0px"});
            $('#back').attr('data-action','main-main2');
        }
        if(menu == "serverbrowser-custom" && details) {
            var d;
            $.getJSON("servers.json", function(json){
                d = json[details];
                changeMap2(d.map);
                $('#subtitle').text(d.name);
                $('#gametype-display').text(d.gametype);
                $('#gametype-icon').css('background',"url('img/gametypes/"+d.gametype+".png') no-repeat 0 0/cover");
                $('#serverbrowser').css({"top":"720px"});
                $('#customgame').css({"top":"0px"});
                $('#back').attr('data-action','custom-serverbrowser');
                $('#customgame').attr('data-from','serverbrowser');
                playersJoin(d.players.current,d.players.max,3000);
            });
        }
        if(menu == "custom-serverbrowser") {
            $('#customgame').css({"top":"-720px"});
            $('#serverbrowser').css({"top":"0px"});
            $('#back').attr('data-action','serverbrowser-main');
            $('#browser').empty();
            loadServers();
        }
        if(menu == "main-serverbrowser") {
            $('#dewrito').css({"opacity":0, "top":"920px"});
            $('#back').fadeIn(anit);
            $('#back').attr('data-action','serverbrowser-main');
            $('#serverbrowser').css({"top":"0px"});
            $('#main').css({"top":"720px"});
            $('#browser').empty();
            loadServers();
        }
        if(menu == "serverbrowser-main") {
            $('#dewrito').css({"opacity":0.95, "top":"240px","-webkit-transition-timing-function":"400ms","-webkit-transition-delay":"0ms"});
            $('#serverbrowser').css({"top":"-720px"});
            $('#main').css({"top":"0px"});
            $('#back').attr('data-action','main-main2');
        }
        if(menu == "main2-main") {
            $('#back').fadeIn(anit);
            $('#back').attr('data-action','main-main2');
            $('#main').css({"top":"0px"});
            $('#main2').css({"top":"720px"});
        }
        if(menu == "main-main2") {
            $('#back').fadeOut(anit);
            $('#main').css({"top":"-720px"});
            $('#main2').css({"top":"0px"});
        }
        if(menu == "custom-options") {
            $('#customgame-options').show();
            $('#back').attr('data-action','options-custom');
            $('#customgame').fadeOut(anit);
            $('#options').fadeIn(anit);
            $('#dewrito').css('top','400px');
            $('#dewrito').css({"opacity":0.9,"top":"400px","-webkit-transition-timing-function":"200ms","-webkit-transition-delay":"200ms"});
        }
        if(menu == "custom-map") {
            $('#choosemap').show();
            $('#back').attr('data-action','options-custom');
            $('#customgame').fadeOut(anit);
            $('#options').fadeIn(anit);
            $('#dewrito').css('top','400px');
            $('#dewrito').css({"opacity":0.9,"top":"400px","-webkit-transition-timing-function":"200ms","-webkit-transition-delay":"200ms"});
        }
        if(menu == "options-custom") {
            $('.options-section').hide();
            f = $('#customgame').attr('data-from');
            $('#back').attr('data-action','custom-'+f);
            $('#customgame').fadeIn(anit);
            $('#options').fadeOut(anit);
            $('#dewrito').css({"opacity":0,"top":"920px","-webkit-transition-timing-function":"200ms","-webkit-transition-delay":"0ms"});
        }
        if(menu == "main-options") {
            $('#dewrito-options').show();
            $('#back').fadeIn(anit);
            $('#back').attr('data-action','options-main');
            $('#main2').fadeOut(anit);
            $('#options').fadeIn(anit);
            $('#dewrito').css({"top":"400px"});
        }
        if(menu == "options-main") {
            $('.options-section').hide();
            $('#back').fadeOut(anit);
            $('#main2').fadeIn(anit);
            $('#options').fadeOut(anit);
            $('#dewrito').css({"top":"240px"});
        }
        if(menu == "custom-player" && details) {
            $('#customgame').css({"left" : "-800px"});
            $('#playerinfo').css({"right" : "100px"});
            $('#back').attr('data-action','player-custom');
            $('#playermodel').css('background-image',"url('img/players/"+details+".png')");
        }
        if(menu == "player-custom") {
            $('#customgame').css({"left" : "0px"});
            $('#playerinfo').css({"right" : "-700px"});
            f = $('#customgame').attr('data-from');
            $('#back').attr('data-action','custom-'+f);
        }
        $('#slide')[0].currentTime = 0;
        $('#slide')[0].play();
    }

    function startgame() {
        $('#beep')[0].play();
        $('#music')[0].pause();
        $('#black').fadeIn(3500).delay(5000).fadeOut(1000, function() {$('#music')[0].play();});
    }

    function changeMap1(game) {
        $('.map-select .selection').removeClass('selected');
        $("[data-game='"+game+"']").addClass('selected');
        $('.map-select').css({"left":"100px"});
        $('#maps-'+currentGame).hide().css({"left":"310px", "opacity":0});
        $('#maps-'+game).css('display', 'block');
        $('#maps-'+game).animate({"left":"360px", "opacity":1},anit/8);
        currentGame = game;
        $('#slide')[0].currentTime = 0;
        $('#slide')[0].play();
    }

    function changeMap2(map) {
        $('#map-thumb').css({"background-image":"url('img/maps/"+map+".png')"});
        $('#map-thumb-options').css({"background-image":"url('img/maps/"+map+".png')"});
        $('#currentmap').text(map);
        $('#map-name-options').text(map);
        $('#map-info-options').text(maps[currentGame][map]);
        $('.map-select2 .selection').removeClass('selected');
        $("[data-map='"+map+"']").addClass('selected');
  }
