var appName = "Lyrics";

var currentLyrics;
var autoScroll = true;
var timmingSupport;

DIALOG_HTML = "<div id='bt-wrapper'><p id='status'>...</p><div id='info'>    <div id='title'>        <label id='track'></label><br>        <i>            <label>by</label>            <label id='artist'></label>        </i>    </div>    <div id='lyrics'></div></div><div id='tools'>    <div>        <div id='bt_autoscroll' class='fab' title='Activate auto scroll'><img src='./images/bt_scroll.png'></div>    </div>    <div id='delay_panel'>        <div id='bt_delay' class='fab'><img src='./images/bt_delay.png'></div        ><div id='delay_controllers'>            <div id='bt_delay_bwd' class='fab' title='Remove 500 ms delay'>                <img src='./images/bt_delay_bwd.png'>            </div>            <label id='delay_label'></label>            <div id='bt_delay_fwd' class='fab' title='Add 500 ms delay'>                <img src='./images/bt_delay_fwd.png'>            </div>        </div>    </div>    <div id='search_panel'>        <div id='bt_search' class='fab' title='Wrong track? Fix it here.'><img src='./images/bt_search.png'></div        ><div id='search_fields'>          <input type='text' id='input_artist' name='Artist' placeholder='Artist' tabindex='-1'>            <input type='text' id='input_track' name='Track' placeholder='Track' tabindex='-1'>        </div>    </div>    <div>        <div id='bt_newwindow' class='fab' title='Open in new window'><img src='./images/window.png'></div>    </div></div></div>";
setTimeout(function() {

  drawer = $('#playlist-drawer-button')
  drawer.before('<button class="bt_lyrics_btn" id="bt-lyrics-go">Lyrics</button>')
  button = $('#bt-lyrics-go')

  dialog = $(DIALOG_HTML).appendTo('body').hide()
  button.click(function() {
    dialog.toggle();
  })
}, 500)

function onLyricsLoadStart() {
    $("#status").text("Lyrics Load Started");
    $("#status").show();
    $("#info").hide();
    document.title = appName;
    $("#tools").hide();
    displaySearchFields(false);
}

function onLyricsLoadFinished(lyrics) {
    currentLyrics = lyrics;

    $("#tools").show();
    $("#status").hide();
    $("#info").show();
    $("#artist").text(lyrics.artist);
    $("#track").text(lyrics.track);
    if (lyrics.timmed && lyrics.timmed.length > 0 && timmingSupport==true) {
        $("#delay_panel").show();
        $("#lyrics").empty();
        for (i in lyrics.timmed) {
            $("#lyrics").append("<p class=\"lyrics_line\">" + lyrics.timmed[i].text.trim() + "</p>");
        }
    } else {
        $("#delay_panel").hide();
        $("#bt_autoscroll").hide();
        $("#lyrics").text(lyrics.static);
    }

    document.title = lyrics.track + " - " + lyrics.artist + " (Lyrics)";
    $('html, body').animate({
        scrollTop: 0
    }, 100);
    scaleWindowToFit();
}

function scaleWindowToFit(){

    // Fix for too long lines
    if($("#lyrics").innerWidth()>700){
        $("#lyrics").addClass('break-line');
    } else {
        $("#lyrics").removeClass('break-line');
    }
}


function onLyricsLoadError(error) {
    $("#status").text(error);
    $("#tools").show();
    $("#status").show();
    $("#info").hide();
    $("#delay_panel").hide();
    $("#bt_autoscroll").hide();
    document.title = appName;
}

function onPositionChanged(position) {
    if (!currentLyrics || currentLyrics.timmed==undefined || currentLyrics.timmed.length < 1) {
        return;
    }
    $("#delay_label").text(parseFloat(position.delay).toFixed(1) + "s");
    for (var i = currentLyrics.timmed.length - 1; i >= 0; i--) {
        if ((currentLyrics.timmed[i].enter < position.position - position.delay) || i == 0) {
            $(".lyrics_line").removeClass("current");
            $(".lyrics_line:eq(" + i + ")").addClass("current");
            smoothScrool();
            break;
        }
    }
}


function smoothScrool() {
    if (autoScroll) {
        $('html, body').stop(true);
        $('html, body').animate({
            scrollTop: $(".current").offset().top - ($(window).height() / 3)
        }, 100);
    }
}



function turnOnAutoScroll() {
    $("#bt_autoscroll").hide();
    autoScroll = true;
    if ($(".current").length > 0)
        smoothScrool();
}



function displaySearchFields(display){
    $searchElm = $("#search_fields");
    if(display){
        $("#input_artist").attr('tabindex', 1);
        $("#input_track").attr('tabindex', 2);
        $searchElm.addClass("visible");
        $("#input_artist").focus();
    } else {
        $("#input_artist").attr('tabindex', -1);
        $("#input_track").attr('tabindex', -1);
        $searchElm.removeClass("visible");
        $("#input_artist").blur();
        $("#input_track").blur();
    }
}



/**
 * Event binding
 */
var visibilityTimeout;
var lastScrollMilis; // The autoscroll triggers the mousemove event, so we need a workaround
$(window).mousemove(function (event) {
    var container = $("#tools");
    if (!container.is(event.target) // if the target of the move isn't the container...
        && container.has(event.target).length === 0) // ... nor a descendant of the container
    {
        var currentTimeMilis = new Date().getTime();
        if (currentTimeMilis < lastScrollMilis + 50 &&
        !($("#search_fields").hasClass("visible"))) {
            $("#tools").removeClass("hide");
            clearTimeout(visibilityTimeout);
            visibilityTimeout = setTimeout(function () {
                $("#tools").addClass("hide");
            }, 3000);
        }
        lastScrollMilis = currentTimeMilis;
    }
});

$(document).keypress(function (e) {
    console.log(e.keyCode)
    switch (e.keyCode){
        case 13: // ENTER
            search($("#input_artist").val(), $("#input_track").val());
            displaySearchFields(false);
            break;
        case 43: // +
            delayUp();
            break;
        case 45: // -
            delayDown();
            break;
    }
});

$(window).bind('mousewheel DOMMouseScroll mousedown', function (event) {
    var container = $("#tools");
    if (!container.is(event.target) // if the target of the click isn't the container...
        && container.has(event.target).length === 0) // ... nor a descendant of the container
    {
        if(timmingSupport && currentLyrics.timmed.length > 1) {
            $('html, body').stop(true);
            autoScroll = false;
            $("#bt_autoscroll").show();
        }
    }
});



/**
 * Run when page finished loading
 */
$(document).ready(function () {
    if (docked) {
        $("#bt_newwindow").click(openWindow);
    } else {
        $("#bt_newwindow").hide();
    }
    turnOnAutoScroll();
    $("#bt_autoscroll").click(turnOnAutoScroll);
    $("#tools").mouseenter(function () {
        clearTimeout(visibilityTimeout);
    }).mouseleave(function () {
        $(window).mousemove();
    });
    $('#tools').bind('mousewheel', function (event) {
        event.preventDefault();
    });
    $('#delay_label').bind('mousewheel', function (event) {
        if (event.originalEvent.wheelDelta >= 0) {
            delayUp();
        }
        else {
            delayDown();
        }
    }).bind('dblclick', function () {
        setDelay(0);
        smoothScrool();
    });
    $('#bt_delay_fwd').mousedown(function () {
        delayUp();
        timeoutId = setTimeout(function () {
            intervalId = setInterval(function () {
                delayUp()
            }, 100);
        }, 500);
    }).bind('mouseup mouseleave', function () {
        if (typeof intervalId !== 'undefined')clearInterval(intervalId);
        if (typeof timeoutId !== 'undefined')clearTimeout(timeoutId);
    });
    $('#bt_delay_bwd').mousedown(function () {
        delayDown();
        timeoutId = setTimeout(function () {
            intervalId = setInterval(function () {
                delayDown()
            }, 100);
        }, 500);
    }).bind('mouseup mouseleave', function () {
        if (typeof intervalId !== 'undefined')clearInterval(intervalId);
        if (typeof timeoutId !== 'undefined')clearTimeout(timeoutId);
    });
    $(window).click(function(evt) {
        if(evt.target.id != "bt_search" &&
        evt.target.id != "input_artist" &&
        evt.target.id != "input_track"){
            displaySearchFields(false);
        }
    });

    $("#bt_search").click(function(evt){
      if($("#search_fields").hasClass("visible")){
            displaySearchFields(false);
        } else {
            displaySearchFields(true);
        }
        evt.stopPropagation();
    })
    $("#bt_delay").mouseenter(function(){
        $("#delay_controllers").addClass("visible")
    });
    $("#delay_panel").mouseleave(function(){
        $("#delay_controllers").removeClass("visible")
    });
    displaySearchFields(false);
});
