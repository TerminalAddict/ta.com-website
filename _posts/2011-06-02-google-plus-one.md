---
comments: true
title: Google Plus one (+1) on WordPress Theme
categories:
  - php
---
Here's one for the web developers of the world. Google plus one went live today, so I chucked together a couple of simple functions, to include in your WordPress functions.php theme file.

{% highlight php %}

<?php
  
function ne_addGooglePLusOneHeader() {
	echo "\n";
} 

add_action("wp_head", "ne_addGooglePLusOneHeader");

function ne_show_googleplusone_button {
	// display Google plus one (+1) at the bottom of the_content()
	global $wp_query;
	//set the size of the button: small, medium, standard, tall
	// (more info here: http://code.google.com/apis/+1button/#script-parameters)
	$size = "medium";
	$postUrl = get_permalink($wp_query->post->ID);
	$plusOneButton = "<g:plusone size=\"$size\" count=\"true\" href=\"$postUrl\"></g:plusone>\n";
	return $content.$plusOneButton;
}

add_filter("the\_content", "ne_show_googleplusone_button");
  
{% endhighlight %}