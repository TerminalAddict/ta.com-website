$(document).ready(function(){
     var lastScrollTop = 0;
     $(window).scroll(function () {
            if ($(this).scrollTop() > 50) {
                $('#back-to-top').fadeIn();
            } else {
                $('#back-to-top').fadeOut();
            }
            var st = $(this).scrollTop();
            var searchResult = $('#queryResult li').first();
            if (st > lastScrollTop) {
                if(!searchResult.length) {
                    $('.searchBar').addClass('fadeOut');
                    $('.searchBar').removeClass('fadeIn');
                }
            } else {
                $('.searchBar').addClass('fadeIn');
                $('.searchBar').removeClass('fadeOut');
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
        $('#queryResult').html('');
        searchField = $('#query').val();
        expression = new RegExp(searchField, "i");
        $.getJSON('dist/search.json', function(data) {
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
                    $('#queryResult').append('<li class="list-group-item link-class"><img src="images/search.svg" alt="search" class="searchIcon" /><a class="pl-5" href="'+value.url+'">'+value.title+'<\/a><span class="text-muted"> ...'+highlight+'... <\/span><a href="'+value.url+'">read more &rArr;<\/a><\/li>');
                }
            });
        });
     });
     
     $("span.tag").each(function(){
        var rand_fsize = Math.floor(Math.random() * 4) + 1;
        $(this).addClass('display-'+rand_fsize);
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
    $('#query').val('');
})

$('img[rel="lightbox"]').on('click', function() {
    var url = $(this).attr('src').replace('thumbnails/','');
    $('#lightboxModalBody').html('<img src="' + url +'" alt="" class="w-100" \/>');
    $('#lightboxModal').modal('show');
});

// Static comments
(function ($) {
    var $comments = $('.js-comments');

    $('#comment-form').submit(function () {
        var form = this;

        $(form).addClass('disabled');
        $('#comment-form-submit').html('Posting ...');

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
            }
        });

        return false;
    });

    function showAlert(message) {
        $('.post__comments-form .js-notice').removeClass('hidden');
        $('.post__comments-form .js-notice-text').html(message);
    }
})(jQuery);
