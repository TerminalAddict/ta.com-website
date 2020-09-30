---
layout: post
author: paul
comments: true
categories: [php, networking]
icon: php.svg
slug: cctv-streaming-to-a-website
---
So I run a CCTV system based on the excellent open source [Zoneminder](https://zoneminder.com/){: target="_blank"}, running on a pretty entry level ex-lease PC I bought from [PBTech](https://www.pbtech.co.nz/category/computers/exleased/desktop-pcs){: target="_blank"}.

What I want to do is embed one of the cameras into a web site.

So my steps are going to be:
1. Setup a Zoneminder user for public access.
2. Write a small PHP proxy script.
3. Profit!

## Prerequisites
I'm not going to talk you through setting up a [Debian](https://www.debian.org/){: target="_blank"} server.  
Nor am I going to talk you through setting up a [Zoneminder](https://zoneminder.com/){: target="_blank"} server on a [Debian](https://www.debian.org/){: target="_blank"} server.  

I will assume that you have these things running.  
I'll also assume that you have the [Zoneminder](https://zoneminder.com/){: target="_blank"} console running from a virtual sub directory in [Apache](https://httpd.apache.org/){: target="_blank"} (in my case /zm/ ).  

But just in case, here's a quick reminder of the [Apache](https://httpd.apache.org/){: target="_blank"} config:

{% highlight bash %}
# Remember to enable cgi mod (i.e. "a2enmod cgi").
ScriptAlias /zm/cgi-bin "/usr/lib/zoneminder/cgi-bin"
<Directory "/usr/lib/zoneminder/cgi-bin">
    Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch
    AllowOverride All
    Require all granted
</Directory>


# Order matters. This alias must come first.
Alias /zm/cache /var/cache/zoneminder/cache
<Directory /var/cache/zoneminder/cache>
    Options -Indexes +FollowSymLinks
    AllowOverride None
    <IfModule mod_authz_core.c>
        # Apache 2.4
        Require all granted
    </IfModule>
    <IfModule !mod_authz_core.c>
        # Apache 2.2
        Order deny,allow
        Allow from all
    </IfModule>
</Directory>

Alias /zm /usr/share/zoneminder/www
<Directory /usr/share/zoneminder/www>
  Options -Indexes +FollowSymLinks
  <IfModule mod_dir.c>
    DirectoryIndex index.php
  </IfModule>
</Directory>

# For better visibility, the following directives have been migrated from the
# default .htaccess files included with the CakePHP project.
# Parameters not set here are inherited from the parent directive above.
<Directory "/usr/share/zoneminder/www/api">
   RewriteEngine on
   RewriteRule ^$ app/webroot/ [L]
   RewriteRule (.*) app/webroot/$1 [L]
   RewriteBase /zm/api
</Directory>

<Directory "/usr/share/zoneminder/www/api/app">
   RewriteEngine on
   RewriteRule ^$ webroot/ [L]
   RewriteRule (.*) webroot/$1 [L]
   RewriteBase /zm/api
</Directory>

<Directory "/usr/share/zoneminder/www/api/app/webroot">
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
    RewriteBase /zm/api
</Directory>
{% endhighlight %}

## Zoneminder read only user
Right, let's start with a [Zoneminder](https://zoneminder.com/){: target="_blank"} "read only" user.  

In your [Zoneminder](https://zoneminder.com/){: target="_blank"} console, head to Options->User, and smash that "ADD NEW USER" button.

Pretty straight forward:
1. Username = YOURPUBLICUSER
2. Password = YOURPUBLICPASS
  * Confirm Password = YOURPUBLICPASS
3. Language
4. Enabled = yes
5. Stream = View
6. Events = None
7. Control = None
8. Monitors = View
9. Groups = None
10. System = None
11. Max bandwidth = whatever you like
12. Restricted monitors = Select the Cameras you want available publicly.
13. API Enabled = No 


Save that bad boy.  
That's step 1 done 😊

## A PHP Proxy script

So at this point you could just jam an image in any web site, using a specially crafted URL:  
```http://YOUR-ZONEMINDER-CCTV-URL/zm/cgi-bin/nph-zms?monitor=1&user=YOURPUBLICUSER&pass=YOURPUBLICPASS```  

But, that kinda exposes, well, everything ! Your CCTV url, your readonly user and pass. I dunno, it just doesn't seem right to me 🤣  
So, I'm going to craft a small PHP proxy script which will hide this info from public view.  

{% highlight php %}
<?php
// storing this here just for future reference
$streamurl =  "http://YOUR-ZONEMINDER-CCTV-URL/zm/cgi-bin/nph-zms?monitor=5&user=YOURPUBLICUSER&pass=YOURPUBLICPASS";

$host = "YOUR-ZONEMINDER-CCTV-URL";
$zmMonitor = "1";
$zmUser = "YOURPUBLICUSER";
$zmPass = "YOURPUBLICPASS";
$requestURI = "/zm/cgi-bin/nph-zms";

$getARGS = $requestURI."?monitor=".$zmMonitor."&user=".$zmUser."&pass=".$zmPass;

set_time_limit(0);
$fp = fsockopen ($host, 80, $errno, $errstr, 30);
if (!$fp) {
    echo "$errstr ($errno)<br>\n";
} else {
    fputs ($fp, "GET ".$getARGS." HTTP/1.0\r\n\r\n");
    while ($str = trim(fgets($fp, 4096)))
       header($str);
    fpassthru($fp);
    fclose($fp);
}
?>
{% endhighlight %}

That's it; save that PHP script as .. I dunno .. zoneminder_stream.php ?

## Embed in HTML
Here's the fun bit .. simple HTML !  
```<img src="/path/to/zoneminder_stream.php" alt="my stream" />```


and here is the working result:  

{% include thumbnail.html img="zoneminder_stream.png" %}

*note: this is a screenshot of my working camera
