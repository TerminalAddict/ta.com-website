---
layout: post
author: paul
comments: true
categories: [bash, networking]
icon: bash.svg
slug: graphing-speeedtest-results
---
I can be described as a network engineer, sometimes, and sometimes a system admin. As such, keeping track of how customers internet is working is reasonably important.  
Most customers use [Speeedtest.net](https://www.speedtest.net/){: target="_blank"} as a way of testing their internet connection, so I figured I would clobber together a script that keeps a bit of history, and make some pretty graphs 😅.


So my steps are going to be:
1. Install [rrdtool](https://oss.oetiker.ch/rrdtool/doc/index.en.html){: target="_blank"}, [Gawk](https://www.gnu.org/software/gawk/manual/gawk.html){: target="_blank"}, and [grep](https://www.gnu.org/software/grep/){: target="_blank"}
2. Install [Ookla speedtest cli](https://www.speedtest.net/apps/cli){: target="_blank"}.
2. Write a bash script to create, update, and graph, some results
3. Profit!

## Prerequisites
I'm not going to talk you through setting up a Linux server.  

I will assume that you have a running server.  
Your linux server can be any flavour you like, I prefer [Debian](https://www.debian.org/){: target="_blank"} and [Ubuntu](https://ubuntu.com/){: target="_blank"} distros, and I prefer [aptitude](https://wiki.debian.org/Aptitude){: target="_blank"} as a package manager; you can use whatever you like 🤗.

I'm also not going to talk you through setting up a web server .. sort that out yourself 😜.

You NEED **unlimited** data on your internet!!!!  
Let me say that again .. **YOU NEED UNLIMITED DATA ON YOUR INTERNET !!!**  
> This script will thrash your internet usage!  

## Installing the packages, and setting up directories
Right, let's start with installing [rrdtool](https://oss.oetiker.ch/rrdtool/doc/index.en.html){: target="_blank"}, [Gawk](https://www.gnu.org/software/gawk/manual/gawk.html){: target="_blank"}, and [grep](https://www.gnu.org/software/grep/){: target="_blank"}   
```sudo aptitude install rrdtool gawk grep```  

That's pretty easy !

### Install Ookla Speedtest cli
So you can head over to the [Ookla Speedtest cli](https://www.speedtest.net/apps/cli){: target="_blank"} website and download the appropriate package. In my case it's the Linux x86_64 package, which is at version 1.0.0.  
```wget https://bintray.com/ookla/download/download_file?file_path=ookla-speedtest-1.0.0-x86_64-linux.tgz -O /tmp/speedtest.tgz```  

Now let's unpack it:  
```tar xvfz /tmp/speedtest.tgz -C /tmp```  

And put it in a usable spot on the OS:  
```sudo mv /tmp/speedtest /usr/local/bin/speedtest```

### Running Speedtest cli
The first time you run speedtest you will be asked to agree to a license:  

{% highlight bash %}
/usr/local/bin/speedtest
==============================================================================

You may only use this Speedtest software and information generated
from it for personal, non-commercial use, through a command line
interface on a personal computer. Your use of this software is subject
to the End User License Agreement, Terms of Use and Privacy Policy at
these URLs:

        https://www.speedtest.net/about/eula
        https://www.speedtest.net/about/terms
        https://www.speedtest.net/about/privacy

==============================================================================

Do you accept the license? [type YES to accept]:
{% endhighlight %}

Now you're ready to go!

You can list out the nearest servers likee so:  

{% highlight bash %}
/usr/local/bin/speedtest -L
Closest servers:

    ID  Name                           Location             Country
==============================================================================
  5469  MyRepublic Limited             Auckland             New Zealand
  5749  Vocusgroup NZ                  Auckland             New Zealand
 11327  Spark New Zealand              Auckland             New Zealand
  2720  WorldNet                       Auckland             New Zealand
  4953  Vodafone New Zealand           Auckland             New Zealand
   721  WorldxChange Comm              Auckland             New Zealand
 13676  speedtest.nzpbx.com            Auckland             New Zealand
 12932  Feenix Communications Limited  Auckland             New Zealand
 16805  Nova Energy                    AUCKLAND             New Zealand
 25477  Devoli                         Auckland             New Zealand
{% endhighlight %}

This particular customer I am testing from is connected through [Vocus](https://www.vocus.co.nz/){: target="_blank"}.  
So I'm going to use [Vocus](https://www.vocus.co.nz/){: target="_blank"} to test against.  

{% highlight bash %}
/usr/local/bin/speedtest -s 5749

   Speedtest by Ookla

     Server: Vocusgroup NZ - Auckland (id = 5749)
        ISP: Vocus Communications
    Latency:     5.10 ms   (0.37 ms jitter)
   Download:   844.16 Mbps (data used: 808.7 MB)
     Upload:   548.05 Mbps (data used: 267.4 MB)
Packet Loss:     0.0%
 Result URL: https://www.speedtest.net/result/c/1ff5533b-b0de-42c5-bd14-24c299cfc249
{% endhighlight %}


Sweet ! 

### Create a directory
Ok, so now let's create a directory to store history, and images.  
```sudo mkdir /var/www/html/rrd```  
```sudo chown paul:paul /var/www/html/rrd```  

Note: I have changed the owner of the directory to the user 'paul'. Change to whatever user you're going to be running this script as.

## The RRD Script
Ok, so here's where the magic happens. So let's skip straight to the script:  

{% highlight bash %}
#!/bin/bash
# generate a speedtest result
# 5749 server is Vocus
/usr/local/bin/speedtest -s 5749 -p no > /tmp/speedtest.txt 2>/dev/null

TRAF=/var/www/html/rrd

        case $1 in (create)
                /usr/bin/rrdtool create $TRAF/upload.rrd -s 60 \
                DS:upload:GAUGE:600:0:U \
                RRA:AVERAGE:0.5:1:4320 \
                RRA:AVERAGE:0.5:1440:3 \
                RRA:MIN:0.5:1440:3 \
                RRA:MAX:0.5:1440:3
                /usr/bin/rrdtool create $TRAF/download.rrd -s 60 \
                DS:download:GAUGE:600:0:U \
                RRA:AVERAGE:0.5:1:4320 \
                RRA:AVERAGE:0.5:1440:3 \
                RRA:MIN:0.5:1440:3 \
                RRA:MAX:0.5:1440:3
                /usr/bin/rrdtool create $TRAF/echoreply.rrd -s 60 \
                DS:echoreply:GAUGE:600:0:U \
                RRA:AVERAGE:0.5:1:4320 \
                RRA:AVERAGE:0.5:1440:3 \
                RRA:MIN:0.5:1440:3 \
                RRA:MAX:0.5:1440:3
                ;;
        (update)
                /usr/bin/rrdtool update $TRAF/upload.rrd N:`cat /tmp/speedtest.txt | grep Upload | awk '{print $3}'`
                /usr/bin/rrdtool update $TRAF/download.rrd N:`cat /tmp/speedtest.txt | grep Download | awk '{print $3}'`
                /usr/bin/rrdtool update $TRAF/echoreply.rrd N:`cat /tmp/speedtest.txt | grep Latency | awk '{print $2}'`
                ;;
        (graph)
                /usr/bin/rrdtool graph $TRAF/upload.png \
                --start "-3day" \
                -c "BACK#000000" \
                -c "SHADEA#000000" \
                -c "SHADEB#000000" \
                -c "FONT#DDDDDD" \
                -c "CANVAS#202020" \
                -c "GRID#666666" \
                -c "MGRID#AAAAAA" \
                -c "FRAME#202020" \
                -c "ARROW#FFFFFF" \
                -u 1.1 -l 0 -v "Upload" -w 1100 -h 250 -t "Upload Speed - `/bin/date +%A", "%d" "%B" "%Y`" \
                DEF:upload=$TRAF/upload.rrd:upload:AVERAGE \
                AREA:upload\#FFFF00:"Upload speed (Mbit/s)" \
                GPRINT:upload:MIN:"Min\: %3.2lf " \
                GPRINT:upload:MAX:"Max\: %3.2lf" \
                GPRINT:upload:LAST:"Current\: %3.2lf\j" \
                COMMENT:"\\n"

                /usr/bin/rrdtool graph $TRAF/download.png \
                --start "-3day" \
                -c "BACK#000000" \
                -c "SHADEA#000000" \
                -c "SHADEB#000000" \
                -c "FONT#DDDDDD" \
                -c "CANVAS#202020" \
                -c "GRID#666666" \
                -c "MGRID#AAAAAA" \
                -c "FRAME#202020" \
                -c "ARROW#FFFFFF" \
                -u 1.1 -l 0 -v "Download" -w 1100 -h 250 -t "Download Speed - `/bin/date +%A", "%d" "%B" "%Y`" \
                DEF:download=$TRAF/download.rrd:download:AVERAGE \
                AREA:download\#00FF00:"Download speed (Mbit/s)" \
                GPRINT:download:MIN:"Min\: %3.2lf " \
                GPRINT:download:MAX:"Max\: %3.2lf" \
                GPRINT:download:LAST:"Current\: %3.2lf\j" \
                COMMENT:"\\n"

                /usr/bin/rrdtool graph $TRAF/echoreply.png \
                --start "-3day" \
                -c "BACK#000000" \
                -c "SHADEA#000000" \
                -c "SHADEB#000000" \
                -c "FONT#DDDDDD" \
                -c "CANVAS#202020" \
                -c "GRID#666666" \
                -c "MGRID#AAAAAA" \
                -c "FRAME#202020" \
                -c "ARROW#FFFFFF" \
                -u 1.1 -l 0 -v "Ping" -w 1100 -h 250 -t "DPing Response - `/bin/date +%A", "%d" "%B" "%Y`" \
                DEF:echoreply=$TRAF/echoreply.rrd:echoreply:AVERAGE \
                AREA:echoreply\#FF0000:"Ping Response (ms)" \
                GPRINT:echoreply:MIN:"Min\: %3.2lf " \
                GPRINT:echoreply:MAX:"Max\: %3.2lf" \
                GPRINT:echoreply:LAST:"Current\: %3.2lf\j" \
                COMMENT:"\\n"
                ;;

        (*)
                echo "Invalid option.";;
        esac
{% endhighlight %}

### Let's do some 'splaining
So firstly, copy everything, save it in a file (I called mine speedtest_rrd.sh), and chmod appropriately.  
Let me make an assumption that all your binary or executable files are in ~/bin.  

```chmod 755 ~/bin/speedtest_rrd.sh```  

The script can take one argument ( $1 ).  

Argument 1: (create)  
This creates the rrd files to store history in, and creates some rrd info that we are going to display.  

Argument 2: (update)  
This updates the rrd database with new values.  

Argument 3: (graph)  
This draws the pretty graphs !  

You may have noticed right at the very beginning of the script this line:  
```/usr/local/bin/speedtest -s 5749 -p no > /tmp/speedtest.txt 2>/dev/null```   

This runs the speedtest cli, and saves the output into your /tmp directory.  

## Running the script
Now let's run it, and schedule it, then look at the results.  

### Running the script manually
Firstly we need to create the rrd database:  
``` ~/bin/speedtest_rrd.sh create```  

result:
{% highlight bash %}
ls -l /var/www/html/rrd/*.rrd
-rw-r--r-- 1 paul paul 35840 Sep 20 22:20 /var/www/html/rrd/download.rrd
-rw-r--r-- 1 paul paul 35840 Sep 20 22:20 /var/www/html/rrd/echoreply.rrd
-rw-r--r-- 1 paul paul 35840 Sep 20 22:20 /var/www/html/rrd/upload.rrd
{% endhighlight %}
simple !

Now let's do a test:  
```~/bin/speedtest_rrd.sh update```  

and now, let's create a graph:  
```~/bin/speedtest_rrd.sh graph```  

{% highlight bash %}
ls -l /var/www/html/rrd/
total 188
-rw-rw-r-- 1 paul paul 28167 Sep 20 22:20 download.png
-rw-r--r-- 1 paul paul 35840 Sep 20 22:20 download.rrd
-rw-rw-r-- 1 paul paul 27113 Sep 20 22:20 echoreply.png
-rw-r--r-- 1 paul paul 35840 Sep 20 22:20 echoreply.rrd
-rw-rw-r-- 1 paul paul 21572 Sep 20 22:20 upload.png
-rw-r--r-- 1 paul paul 35840 Sep 20 22:20 upload.rrd
{% endhighlight %}

Alright ! we have some data !

### Scheduling the script
Ok, so now we have some data, let's start auto running the data collection.

Remember me saying at the beginning you need unlimited data on your internet?  
>  <br />
> Let me say that again .. **YOU NEED UNLIMITED DATA ON YOUR INTERNET !!!**   
> This script will thrash your internet usage!   

So with that warning out of the way, let's chuck it in cron:  
{% highlight bash %}
echo "*/5 *   * * *   paul /home/paul/bin/speedtest_rrd.sh update > /dev/null 2>&1 && /home/paul/bin/speedtest_rrd.sh graph > /dev/null 2>&1" >> /etc/crontab
{% endhighlight %}

note: I am running this script as the user 'paul'. Change to whatever user you are running this script as.

## The result

That's it! we're running. Let that script chug away for a few days, and you'll get a result that looks like this:  

{% include thumbnail.html img="download_graph.png" %}  

{% include thumbnail.html img="upload_graph.png" %}  

{% include thumbnail.html img="echoreply_graph.png" %}  


Happy speedtesting !


