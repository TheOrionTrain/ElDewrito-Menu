
    /*
        (c) 2015 Brayden Strasen
        https://creativecommons.org/licenses/by-nc-sa/4.0/
    */

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
      loadMaps();
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
      $('#start-button').click(function() { changeMenu("main-custom"); });
      $('#main2-button').click(function() { changeMenu("main2-main"); });
      $('#options-button').click(function() { changeMenu("main-options"); });
      $('#back').click(function() { changeMenu($(this).attr('data-action')); });
      $('#open-options-menu').click(function() { changeMenu("custom-options"); });
      $('#open-map-menu').click(function() { changeMenu("custom-map"); });
  });

  var players = [], joined = 0, track = 5, scale = 1, anit = 400;

  function loadMaps() {
      var b,g,i,e;
      for(i=0; i < Object.keys(maps).length; i++) {
          b = Object.keys(maps)[i];
          console.log(b);
          for(e=0; e < Object.keys(maps[b]).length; e++) {
              g = Object.keys(maps[b])[e];
              $('#maps-'+b).append("<div data-map='"+g+"' class='selection'><span class='label'>"+g+"</span></div>");
              console.log(g);
          }
      }
  }

  function changeMenu(menu,details) {
      if(menu == "main-custom") {
          $('#dewrito').css({"opacity":0, "top":"920px"});
          $('#back').fadeIn(anit);
          $('#back').attr('data-action','custom-main');
          $('#customgame').css({"top":"0px"});
          $('#main').css({"top":"720px"});
          if(joined === 0) {
              $.getJSON( "players.json", function( data ) {
                  players = data;
                  for(var i=0; i<players.length; i++) {
                      $('#lobby').append("<tr id='player"+i+"' class='"+players[i].color+"'><td class='name'>"+players[i].name+"</td><td class='rank'><img src='ranks/"+players[i].rank+".png'</td></tr>");
                      $('#player'+i).css("display","none");
                      $('#player'+i).delay(Math.floor(Math.random()*15000)).fadeIn(anit,callback);
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
      }
      if(menu == "custom-main") {
          $('#dewrito').css({"opacity":0.95, "top":"240px","-webkit-transition-timing-function":"400ms","-webkit-transition-delay":"0ms"});
          $('#customgame').css({"top":"-720px"});
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
          $('#back').attr('data-action','custom-main');
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
          $('#back').attr('data-action','custom-main');
      }
      $('#slide')[0].currentTime = 0;
      $('#slide')[0].play();
  }

  function startgame() {
      $('#beep')[0].play();
      $('#music')[0].pause();
      $('#black').fadeIn(3500).delay(5000).fadeOut(1000, function() {$('#music')[0].play();});
  }

  var currentGame = "HaloOnline";

  function changeMap1(game) {
      $('.map-select .selection').removeClass('selected');
      $("[data-game='"+game+"']").addClass('selected');
      $('.map-select').css({"left":"100px"});
      $('#maps-'+currentGame).hide().css({"left":"310px", "opacity":0});
      $('#maps-'+game).css('display', 'block');
      $('#maps-'+game).animate({"left":"360px", "opacity":1},anit/4);
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
