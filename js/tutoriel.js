(function($){
    $.fn.extend({
        center: function () {
            return this.each(function() {
                var top = ($(window).height() - $(this).outerHeight()) / 2;
                var left = ($(window).width() - $(this).outerWidth()) / 2;
                $(this).css({position:'absolute', margin:0, top: (top > 0 ? top : 0)+'px', left: (left > 0 ? left : 0)+'px'});
            });
        }
    });
})(jQuery);

var etape = 0;

function write_in_textarea(textarea, msg, i){
    $(textarea).val(msg.substr(0,i));
    if (i < msg.length){
        setTimeout(function(){write_in_textarea(textarea, msg, ++i)},100);
    }
    else {
        tutoriel(++etape);
    }
}

function show_msg(selector, msg, duration){
    $(selector).append("<span id='tutoriel_msg1'>"+msg+"</span>");
    $("#tutoriel_msg1").center();
    $("#tutoriel_msg1").animate({opacity: '1'}, duration, 'linear', function(){
        $("#tutoriel_msg1").animate({opacity: '0'}, duration / 2, 'linear', function(){$(this).remove(); tutoriel(++etape);});
    });
}

function tutoriel(etape_tuto){
    if (etape_tuto == 0){
        window.location.replace('#canvas');
        show_msg("#tutoriel_filter", "Tutoriel - Unitalk", 2000);
    }
    else if (etape_tuto == 1){
        show_msg("#tutoriel_filter", "Comment ça marche ?", 2000);
    }
    else if (etape_tuto == 2){
        show_msg("#tutoriel_filter", "Choisissez votre microphone ou écrivez directement dans le champ dédié", 4000);
    }
    else if (etape_tuto == 3){
        $('#tutoriel_filter').hide();
        window.location.replace('#api-content')
        $("#input_zone").css('z-index', '2');
        setTimeout(function(){write_in_textarea("#result-field", "J'ai mal à la tête", 0);}, 1000);
    }
    else if (etape_tuto == 4){
        setTimeout(function(){
            window.location.replace('#canvas')
            $("#input_zone").css('z-index', '0');
            launchText();
            $("#renderCanvas").css('z-index', '2');
            tutoriel(++etape);
        }, 1000);
    }
    else if (etape_tuto == 5){
        setTimeout(function(){
            $('#tutoriel_filter').show();
            $("#renderCanvas").css('z-index', '0');
            show_msg("#tutoriel_filter", "C'est tout", 2000);
            $("result-field").html('');
        }, 4000);
    }
    else if (etape_tuto == 6){
        $('#tutoriel_filter').remove();
    }
}

$( document ).ready(function() {
    $(document).keyup(function(e) {
         if (e.keyCode == 27) { // escape keycode 27
            $('#tutoriel_filter').remove();
            etape = 6;
        }
    });
});