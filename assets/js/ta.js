$(document).ready(function(){
     var lastScrollTop = 0;
     $(window).scroll(function () {
            if ($(this).scrollTop() > 50) {
                $('#back-to-top').fadeIn();
            } else {
                $('#back-to-top').fadeOut();
            }
            var st = $(this).scrollTop();
            var searchResult = $('.searchResults').is(":hidden");
            if (st > lastScrollTop) {
                if(searchResult=true) {
                    $('.searchBar').addClass('fadeOut');
                    $('.searchBar').removeClass('fadeIn');
                    $('#overlay').removeClass('overlayon');
                }
            } else {
                if($(this).scrollTop() < 50) {
                    $('.searchBar').addClass('fadeIn');
                    $('.searchBar').removeClass('fadeOut');
                }
            }
            lastScrollTop = st;
        });
        // scroll body to 0px on click
        $('#back-to-top').click(function () {
            $('#back-to-top').tooltip('hide');
            $('body,html').animate({
                scrollTop: 0
            }, 800);
            return false;
        });
        $('#back-to-top').mouseover(function() {
            $('#back-to-top').tooltip('show');
        });

     $.ajaxSetup({ cache: false });
     $('#query').keyup(function(){
        $('.searchResults').removeClass('hidden');
        $('.searchBar').css('height', '80%');
        $('#queryResult').html('');

        if($(this).scrollTop() < 50) {
          $('#overlay').addClass('overlayon');
          $('.searchBar').addClass('fadeIn');
          $('.searchBar').removeClass('fadeOut');
        }

        searchField = $('#query').val();
        expression = new RegExp(searchField, "i");
        $.getJSON('/assets/search.json', function(data) {
            $.each(data, function(key, value){
                if (value.url.search(expression) != -1 || value.content.search(expression) != -1 || value.title.search(expression) != -1) {
                    var n = value.content.search(expression)-50;
                    var excerpt = value.content.substring(n, n+300);
                    if(searchField!='') {
                        var highlight = excerpt.split(expression).join("<span class='shadow bg-primary text-white rounded px-1'>"+searchField+"<\/span>");
                        value.title = value.title.split(expression).join("<span class='shadow bg-primary text-white rounded px-1'>"+searchField+"<\/span>");
                    } else {
                        var highlight = excerpt;
                    }
                    $('#queryResult').append('<li class="list-group-item link-class"><img src="/assets/images/search.svg" alt="search" class="searchIcon" /><a class="pl-5" href="'+value.url+'">'+value.title+'<\/a><span class="text-muted"> ...'+highlight+'... <\/span><a href="'+value.url+'">read more &rArr;<\/a><\/li>');
                }
            });
        });
     });

     $("span.tag").each(function(){
        var rand_fsize = Math.floor(Math.random() * 4) + 1;
        var rand_color = Math.floor(Math.random() * 5) + 1;
        $(this).addClass('display-'+rand_fsize);
        $(this).addClass('color-'+rand_color);
     });
    $('a[target="_blank"]').each(function() {
        $(this).attr('rel', 'noreferrer noopener');
        $(this).attr('data-toggle', 'tooltip');
        $(this).attr('data-original-title', $(this).attr('href'));
    });
    var notFoundLink = $(location).attr('href');
    var newFoundLink = notFoundLink.replace('terminaladdict.com','www.loudas.com');
    $(".notfoundLink").html(newFoundLink);
    $(".notfoundLink").attr('href',newFoundLink);

    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

});

$(".ta_logo").mouseover(function(){
        $(this).tooltip('show');
});

$('a[data-mail]').on('click', function() {
        window.location = 'mailto:' + $(this).data('mail')+'@paulwillard.nz' + '?subject=Contact from website';
});

$('.searchResults .close').on('click', function(){
    $('.searchResults').addClass('hidden');
    $('.searchBar').css('height', 'auto');
    $('.searchBar').addClass('fadeOut');
    $('.searchBar').removeClass('fadeIn');
    $('#overlay').removeClass('overlayon');
    $('#query').val('');
})

$('img[rel="lightbox"]').on('click', function() {
    var url = $(this).attr('src').replace('thumbnails/','');
    $('#lightboxModalBody').html('<img src="' + url +'" alt="" class="w-100" \/>');
    $('#lightboxModal').modal('show');
});

$('#overlay').click(function() {
    $('.searchResults').addClass('hidden');
    $('.searchBar').css('height', 'auto');
    $('.searchBar').addClass('fadeOut');
    $('#overlay').removeClass('overlayon');
    $('#query').val('');
});


$("#query").click(function(e){
  event.preventDefault();
  if($('#query').parents('.fadeOut').length>0){
      $('#overlay').addClass('overlayon');
      $('.searchBar').addClass('fadeIn');
      $('.searchBar').removeClass('fadeOut');
  }
});

var verifyCaptcha = function(response) {
    if(response.length == 0) {
    } else {
    	var _el=$('#comment-form-submit');
        _el.removeAttr("disabled");
        _el.addClass('button-primary dark-blue-bg');
        _el.attr('aria-disabled', 'false');
        _el.attr('type', 'submit');
        $('#g-recaptcha-response').attr('name','fields[g-recaptcha-response]');
    }
};

(function ($) {
    var $comments = $('.js-comments');

    $('#comment-form').submit(function () {
        var form = this;

        $(form).addClass('disabled');
        $('#comment-form-submit').html('Posting ...');
        $('#comment-form-submit').attr('disabled', true);

        $.ajax({
            type: $(this).attr('method'),
            url: $(this).attr('action'),
            data: $(this).serialize(),
            contentType: 'application/x-www-form-urlencoded',
            success: function (data) {
                $('#comment-form-submit').html('Submitted');
                $('.post__comments-form .js-notice').removeClass('bg-danger').addClass('bg-success');
                $('#comment-form fieldset').each(function(){$(this).addClass('hidden')});
                showAlert('<strong>Thanks for your comment!</strong> It will show on the site once it has been approved.');
            },
            error: function (err) {
                console.log(err);
                $('#comment-form-submit').html('Submit Comment');
                $('.post__comments-form .js-notice').removeClass('bg-success').addClass('bg-danger');
                showAlert('<strong>Sorry, there was an error with your submission.</strong> Please make sure all required fields have been completed and try again.');
                $(form).removeClass('disabled');
                $('#comment-form-submit').attr('disabled', false);
            }
        });

        return false;
    });

    function showAlert(message) {
        $('.post__comments-form .js-notice').removeClass('hidden');
        $('.post__comments-form .js-notice-text').html(message);
    }
})(jQuery);

var svg = '<svg width="200" height="200" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' +
' viewBox="0 0 50 55" style="enable-background:new 0 0 50 50;" xml:space="preserve">' +
'<style type="text/css">' +
'  .st0{fill:#FDDA3E;}' +
'  .st1{fill:#FFFFFF;}' +
'  .bounce{' +
'    transform-origin: center center;' +
'    animation-name: bounce;' +
'    animation-duration: 720ms;' +
'    animation-timing-function: cubic-bezier(.25,.72,.15,1.17);' +
'    animation-iteration-count: infinite;' +
'  }' +
'  @keyframes bounce {' +
'    0%, 50%, 100% {' +
'      transform:' +
'        rotate3d(0, 0, 0, 0deg)' +
'        translate3d(0, 5px, 0);' +
'    }' +
'    20% {' +
'      transform:' +
'        rotate3d(0, 0, 1, 4deg)' +
'        translate3d(0, 0, 0);' +
'    }' +
'    70% {' +
'      transform:' +
'        rotate3d(0, 0, 1, -4deg)' +
'        translate3d(0, 0, 0);' +
'    }' +
'  }' +
'</style>' +
'<g class="bounce">' +
'  <circle class="st0" cx="25" cy="25" r="25"/>' +
'  <polygon points="44.5,21 3.9,21 3.9,24.3 5.7,24.3 5.7,25.9 7.1,25.9 7.1,27.4 8.8,27.4 8.8,29 20.2,29 20.2,27.4 21.8,27.4' +
'        21.8,25.9 23.4,25.9 23.4,24.3 26.7,24.3 26.7,25.9 28.2,25.9 28.2,27.4 29.8,27.4 29.8,29 41.2,29 41.2,27.4 42.8,27.4' +
'        42.8,25.9 44.5,25.9 44.5,24.3 44.5,24.2 46.1,24.2 46.1,22.6 46.1,21"/>' +
'  <rect x="7.1" y="22.5" class="st1" width="1.6" height="1.6"/>' +
'  <rect x="10.5" y="22.5" class="st1" width="1.6" height="1.6"/>' +
'  <rect x="8.8" y="24.2" class="st1" width="1.6" height="1.6"/>' +
'  <rect x="12.1" y="24.2" class="st1" width="1.6" height="1.6"/>' +
'  <rect x="10.5" y="25.8" class="st1" width="1.6" height="1.6"/>' +
'  <rect x="13.8" y="25.8" class="st1" width="1.6" height="1.6"/>' +
'  <rect x="28.2" y="22.5" class="st1" width="1.6" height="1.6"/>' +
'  <rect x="31.5" y="22.5" class="st1" width="1.6" height="1.6"/>' +
'  <rect x="29.8" y="24.2" class="st1" width="1.6" height="1.6"/>' +
'  <rect x="33.1" y="24.2" class="st1" width="1.6" height="1.6"/>' +
'  <rect x="31.5" y="25.8" class="st1" width="1.6" height="1.6"/>' +
'  <rect x="34.8" y="25.8" class="st1" width="1.6" height="1.6"/>' +
'</g>' +
'</svg>';

var svgDataUrl = "data:image/svg+xml;base64," + btoa(svg);
console.log('%c ', "background-image: url(" + svgDataUrl + "); padding-bottom: 100px; padding-left: 100px; margin: 20px; background-size: contain; background-position: center center; background-repeat: no-repeat;");

var curyear = new Date().getFullYear();
console.log("%cAll code is copyright © Paul Willard " + curyear, "font: 2em sans-serif; color: yellow; background-color: red;");
console.log("%cAuthor: Paul Willard <paul@paulwillard.nz>", "font: 1.5em sans-serif; color: yellow; background-color: red;");
