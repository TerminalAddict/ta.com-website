---
comments: true
title: Disable the new admin bar in wordpress
categories:
  - php
icon: php.svg
---
Yep a geeky thing .. today word press updated to version 3.1

It comes with a new "admin bar" that can upset older themes, however disabling it is not that hard (if you know your way around wordpress coding)


in your themes folder there is a file called functions.php

add this to the end of the file:

{% highlight php %}

<?php 

function loudas_hide_admin_bar_settings() { 

}

function loudas_disable_admin_bar() { 
	add_filter( 'show_admin_bar', '__return_false' ); 
	add_action( 'admin_print_scripts-profile.php','loudas_hide_admin_bar_settings' ); 
} 
add_action( 'init', 'loudas_disable_admin_bar' , 9 ); 

?>
  
{% endhighlight %}
