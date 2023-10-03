---
layout: post
author: paul
comments: true
categories: [javascript, development]
icon: js.svg
title: A modal popup window in Wiki.JS
slug: wiki-js-modal-window
---
I use [Wiki.JS](https://js.wiki/){: target="_blank"} for both work and personal reasons (yes I'm one of those nerds who has a personal wiki for info about his life 😝).  

One of the pain points has been inserting images.  
By default Wiki.JS emededs images as full sized.  
Now, yes, I know I could write markdown to alter the size, but what I really miss from my own documenting days, is having all images open in a modal window when clicked.  

Enter ... [jQuery](https://jquery.com/){: target="_blank"}, and [Bootstrap](https://getbootstrap.com/){: target="_blank"}.  

And, yes I also know that Wiki.JS uses [Material Design](https://m3.material.io/){: target=_blank}.  

I opted to use Bootstrap 4.6.2, as I have local libraries all over my web spaces ([terminaladdict.com](https://terminaladdict.com) uses 4.6.2 for instance).  

## Include the jQuery and Bootstrap libraries 
First we need to include the jQuery and Bootstrap libraries.  
In wikijs->administration->theme  
there is a section labelled "Head HTML injection".  
add this:  
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" integrity="sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct" crossorigin="anonymous"></script>
```

## Add HTML for the modal window
In wikijs->administration->theme  
In the section labelled "Body HTML injection".
add this:
```html
<!-- lightbox Modal -->
        <div class="container-fluid d-print-none">
          <div class="container">
              <div class="row">
                <div class="col-md-8">
                  <div class="modal fade" id="lightboxModal" tabindex="-1" role="dialog" aria-labelledby="ModalSearchLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg" style="max-width: 80% !important" role="document">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title hidden" id="ModalSearchLabel">Larger Image ...</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </div>
                        <div class="modal-body" id="lightboxModalBody">
                            <!-- content here -->
                        </div>
                        <div class="modal-footer">
                          <button type="button" class="btn btn-primary" id="lightboxModalURLButton">Open in new Window/Tab</button>
                          <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
<!-- end lightbox Modal -->
```

and the javascript in the same place below the modal HTML:
```javascript

<script>
window.onload = function () {
    $('img.thumbnail').each(function(){
        var currWidth = this.width;
        var currHeight = this.height;
        $(this).attr('height', currHeight);
        $(this).attr('width', currWidth);
    });
    $('.contents img').not('.emoji').each(function() {
	    $(this).attr('width', '250');
        $(this).attr('rel', 'lightbox');
    });

    $('img[rel="lightbox"]').on('click', function() {
        var url = $(this).attr('src');
        $('#lightboxModalBody').html('<img src="' + url +'" alt="" class="w-100" \/>');
        $('#lightboxModalURLButton').attr('onclick','window.open(\'' + url + '\', \'_blank\')');
        $('#lightboxModal').modal('show');
    });
};
</script>
```

You'll notice I use a window.onload function.  
This is required because of how Wiki.JS delivers content.  
We need to wait for the window to complete loading before we tamper with DOM elements.

## Add the image in to your document
> Note: To be fair, I have only tested this with the markdown editor

```markdown
![1880868579.jpg](/personal/1880868579.jpg)
```

## Result
Now when the page loads, it creates a Bootstrap styled modal window, then uses JS to resize the image, and make it clickable.  

## My opinion
Well, obviously I'm a jQuery and Bootstrap guy.  
I'd love to hear how this could be done with the included libraries already found in Wiki.js  

Hit me up with a comment 👇🏻

