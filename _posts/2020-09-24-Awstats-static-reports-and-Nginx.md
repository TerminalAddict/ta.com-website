---
layout: post
author: paul
comments: true
categories: [bash, networking]
icon: bash.svg
slug: Awstats-static-reports-and-Nginx
---
So, I run a few websites 😉 and most of those websites (including this one) I have Google Analytics installed.  
But server logs *can* provide different information. So I'm going to setup graphing and tracking my server access logs.  


So my steps are going to be:
1. Install [Awstats](https://awstats.sourceforge.io/){: target="_blank"}, along with some prerequisites for CPAN, and creating a password file.
2. Install [CPAN The Comprehensive Perl Archive Network](https://www.cpan.org/){: target="_blank" }, along with the GeoIP plugin.
3. Write a bash script to create, update, and graph, some results (as well as a wee PHP script to make life easier).
4. Profit!

## Prerequisites
I'm not going to talk you through setting up a Linux server, or Nginx, PHP-FPM (Fastcgi).  

I will assume that you have a running server.  
Your linux server can be any flavour you like, I prefer [Debian](https://www.debian.org/){: target="_blank"} and [Ubuntu](https://ubuntu.com/){: target="_blank"} distros, and I prefer [aptitude](https://wiki.debian.org/Aptitude){: target="_blank"} as a package manager; you can use whatever you like 🤗.

### Assumptions
* I'll assume we store the Awstats DB in /var/lib/awstats.  
* I'll assume we store the static reports in /var/cache/awstats.  

## Installing the packages
Here we go:   
```sudo aptitude install awstats libgeoip-dev build-essential openssl```  

### Installing the GeoIP plugin
So first we need to setup CPAN:  
{% highlight bash %}
$ sudo cpan
Loading internal logger. Log::Log4perl recommended for better logging

cpan shell -- CPAN exploration and modules installation (v2.28)
Enter 'h' for help.

cpan[1]>  
{% endhighlight %}

Now, while in the CPAN shell, let's install some stuff.  
Firstly, CPAN itself, and then the GeoIP plugin.  
```cpan[1]> make install```  
```cpan[1]> install Bundle::CPAN```  

That'll get you up and running ready to install from cpan.  
Now let's install the GeoIP plugin:  
```cpan[1]> install Geo::IP```  

## Setting up Nginx
So, a few prerequisites are needed for Nginx to behave properly.  
Firstly, make sure you have PHP running using fastcgi (I'm not showing you how to do this in this doc).   

Next, let's make sure logging is separate for each website:  
In my ```server {``` block I have the following lines for logging:  
{% highlight bash %}
server_name terminaladdict.com;
access_log /var/log/nginx/terminaladdict.com-access.log;
error_log /var/log/nginx/terminaladdict.com-error.log;
{% endhighlight %}

I'm going to add some config to my server block specifically for awstats:  
{% highlight bash %}
location ^~ /awstats {
	alias /var/cache/awstats/terminaladdict.com;
	location ~ \.php$ {
		fastcgi_split_path_info ^(.+\.php)(/.+)$;
		fastcgi_pass unix:/var/run/php/php7.3-fpm.sock;
		fastcgi_param SCRIPT_FILENAME $request_filename;
		include fastcgi_params;
	}
	auth_basic "Website Statistics";
	auth_basic_user_file /var/lib/awstats/.htpasswd;
}
location ^~ /awstats-icon {
	alias /usr/share/awstats/icon/;
}
{% endhighlight %}

Now reload nginx ```systemctl reload nginx.service```  

### Password protect our stats
Let's not go public with our stats 😆   
In the Nginx config above I provided for password protection, so let's create that .htpasswd file:   
{% highlight bash %}
printf "Hi_my_name_is:`openssl passwd -apr1`\n" >> /var/lib/awstats/.htpasswd
Password: *********
Verifying - Password: *********
{% endhighlight %}

## Setting up Awstats
Right, so for whatever reason, awstats installs a cron job that doesn't seem to work.   
So let's turn it off:   
```echo "" > /etc/cron.d/awstats```   
phew 😆

Now let's create an awstats config for our website.   
Awstats expects the config to be named "awstats.website.ext.conf".  
Something like:
* awstats.terminaladdict.com.conf
* awstats.example.co.nz.conf
* awstats.subdomain.example.org.nz.conf

I'm creating a config for terminaladdict.com, so here we have it:  
{% highlight bash %}
LogFile="/var/log/nginx/terminaladdict.com-access.log"
SiteDomain="terminaladdict.com"
HostAliases="www.terminaladdict.com"
DirIcons="/awstats-icon"
DirData="/var/lib/awstats"
DNSLookup = 1
LoadPlugin="geoip GEOIP_STANDARD /usr/share/GeoIP/GeoIP.dat"
{% endhighlight %}

> <br />
> Here's a warning !
> If your website is super busy, probably disable DNSLookup, by setting it to 0
> <br />
> DNSLooup = 1 will slow things down **A LOT**


## The bash script
While I was setting this up I read many articles about configuring nginx to using cgi-bin.php with fastcgi.  
For me, it just didn't work, and I got bored trying to figure out why it didn't work!   

So I wrote my own little bash script to update awstats db, generate static reports, and build an index.php for some of the directories, just for ease of use.  

Here is my script:  
{% highlight bash %}
#!/bin/bash

AWSTATS=/usr/lib/cgi-bin/awstats.pl
DIR=/var/cache/awstats
YEAR=`date +%Y`
MONTH=`date +%m`
PHPFILE="
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>
    <title>Awstats</title>
    <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'>
    <meta name='description' content='Awstats for websites hosted on Net Enterprises Ltd' />
</head>
<body>

<div class='container-fluid pt-5'>
    <div class='container'>
        <div class='row'>
            <div class='col-md-12'>
                <h3>Stuff found in this directory</h3>
                <ul class='list-unstyled'>
<?php
\$dir = '.';
\$files = scandir(\$dir);
\$excludes = Array('.', '..', 'index.php');

foreach(\$files as \$file) {
    if(!in_array(\$file, \$excludes)) {
        echo '                  <li class=\'p-3\'><a data-toggle=\'tooltip\' data-original-title=\''.\$file.'\' data-placement=\'bottom\' href=\''.\$file.'\' class=\'btn btn-primary btn-lg\'>'.\$file.'</a></li>' . PHP_EOL;
    }
}
?>
                </ul>
            </div>
        </div>
    </div>
</div>
<script src='https://code.jquery.com/jquery-3.5.1.slim.min.js'></script>
<script src='https://unpkg.com/@popperjs/core@2'></script>
<script src='https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'></script>
</body>
</html>
";

for c in `/bin/ls -1 /etc/awstats/awstats.*.conf 2>/dev/null | /bin/sed 's/^\/etc\/awstats\/awstats\.\(.*\)\.conf/\1/'` `[ -f /etc/awstats/awstats.conf ]`
do
    mkdir -p $DIR/$c/$YEAR/$MONTH/
    for d in $DIR $DIR/$c $DIR/$c/$YEAR
    do
        echo "$PHPFILE" > $d/index.php
    done
    $AWSTATS -config=$c -update

    # report for the year
    $AWSTATS -config=$c -output -month=all -staticlinks > $DIR/$c/$YEAR/awstats.yearly.report.$c.html
    ln -sf $DIR/$c/$YEAR/awstats.yearly.report.$c.html $DIR/$c/$YEAR/1-start-here.html

    # report the for the current month
    $AWSTATS -config=$c -output -staticlinks  > $DIR/$c/$YEAR/$MONTH/awstats.$c.html
    ln -sf $DIR/$c/$YEAR/$MONTH/awstats.$c.html $DIR/$c/$YEAR/$MONTH/index.html

    for stat in alldomains allhosts lasthosts unknownip alllogins lastlogins allrobots lastrobots urldetail urlentry urlexit browserdetail osdetail unknownbrowser unknownos refererse refererpages keyphrases keywords errors404 downloads
    do
        $AWSTATS -config=$c -output=$stat -month=all -staticlinks > $DIR/$c/$YEAR/awstats.$c.$stat.html
        $AWSTATS -config=$c -output=$stat -staticlinks > $DIR/$c/$YEAR/$MONTH/awstats.$c.$stat.html
    done
done
{% endhighlight %}

What the script does is: 
1. Set up some vairable, including a variable named PHPFILE, that creates a PHP file for some directories.
2. in a for loop, for each awstats.{websitename}.conf do
  * make a directory if needed (mkdir -p)
  * a new for loop, that creates a PHP file in the root directory, and the $YEAR directory
  * Updates the stats ```$AWSTATS -config=$c -update```
  * create some soft links for ease of use
  * a nested for loop that creates reports for the year, and the month
  * 1). ```$AWSTATS -config=$c -output=$stat -month=all -staticlinks > $DIR/$c/$YEAR/awstats.$c.$stat.html``` 
  * 2). ```$AWSTATS -config=$c -output=$stat -staticlinks > $DIR/$c/$YEAR/$MONTH/awstats.$c.$stat.html```
3. profit!

And here is the result:
* [The PHP file that the script creates](/assets/php/awstats.index.php){: target="_blank"}
* [The Awstats Yearly report](/assets/php/awstats.yearly.ternminaladdict.com.html){: target="_blank"}
* [The Awstats Monthly report](/assets/php/awstats.monthly.ternminaladdict.com.html){: target="_blank"}

## Automating
And of course, chuck it in cron so it updates regularly.   
I run mine at 17 minutes passed the hour, because - well I dunno - 17 seemed like a fun number to use 🤪.   
I stored the script in /usr/local/bin and called it awstats.update_and_build.sh   
{% highlight bash %}
# awstats
17 *    * * *   root    /usr/local/bin/awstats.update_and_build.sh > /dev/null 2>&1
{% endhighlight %}

Happy stats collecting !


