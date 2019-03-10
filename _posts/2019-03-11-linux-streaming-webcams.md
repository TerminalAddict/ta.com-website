---
layout: post
author: paul
comments: true
categories: linux
icon: linux.svg
---
In this little snippet / howto I'm going to show how I got a regular Logitech webcam streaming over the internet.

So let's start with the problem:  
I have a fishtank, I wanted to create a "fish cam" :)

## Step 1 - Hardware

So I have a regular [Logitech HD Webcam C910](https://support.logitech.com/en_us/product/hd-pro-webcam-c910){: target="_blank"}, and a standard [Debian stretch](https://www.debian.org/){: target="_blank"} sitting on a PC next to my fishtank.

Pretty straight forward so far, I do have contrib and non-free repos enabled 

{% highlight bash %}

deb http://deb.debian.org/debian/ stretch main non-free contrib
deb-src http://deb.debian.org/debian/ stretch main non-free contrib

deb http://security.debian.org/debian-security stretch/updates main contrib non-free
deb-src http://security.debian.org/debian-security stretch/updates main contrib non-free

{% endhighlight %}

## Step 2 - The streaming software

**Motion** - [link](https://motion-project.github.io/){: target="_blank"}

Here's a wee quote from the website

> Motion is a highly configurable program that monitors video signals from many types of cameras.
> Set it up to monitor your security cameras, watch birds, check in on your pet, create timelapse videos and more.

Wow, that's what I want to do - check in on my pets :)

So let's install it:

{% highlight bash %}
aptitude install motion
{% endhighlight %}

TADA !!!!

No let's configure it.

I don't want to keep images, I just want to stream, so the steps I need to do are:
1. Create a conf directory in my home directory
2. Create a config file in the created config directory

So let's create a directory by doing  
`mkdir ~/.motion`

No let's create a config file by doing  
`vi ~/.motion/motion.conf`

Note: probably don't do this as user root

Let's look at my config
{% highlight bash %}
stream_port 9091
stream_localhost off
webcontrol_localhost off
webcontrol_port 9092
minimum_motion_frames 1
output_pictures off
quality 100
stream_quality 100
{% endhighlight %}

Basically, the needed bits are `stream_port 9091`, `stream_localhost off`, and `output_pictures off`.  
This sets the tcp port you want to use, disables "localhost" only, and turns off saving images.

## Run the server

Here's the fun bit.  
`motion`

That's it, you have a streaming server up and running. You can view it by open a browser and going to http://your.ip.address:9091/

## Wrapping up

So to get this all up and running (and public if you want that) you have to open a tcp port on your firewall.  
I use Mikrotik, so here is what I do:
{% highlight bash %}
/ip firewall nat
chain=dstnat action=dst-nat to-addresses=10.0.0.2 to-ports=9091 protocol=tcp in-interface=ether1 dst-port=9091 log=no log-prefix=""
{% endhighlight %}

and of course you want to see it running, so here's a link:  
[Fishcam (webcam streaming)](https://www.loudas.com/family/general-life/2019/03/11/Linux-Streaming-webcam.html){: target="_blank"}  
A wee note: I built a small php proxy script that looks like this:  
{% highlight php %}
<?php
set_time_limit(0);
$fp = fsockopen ("my.public.ip", 9091, $errno, $errstr, 30);
if (!$fp) {
    echo "$errstr ($errno)<br>\n";
} else {
    fputs ($fp, "GET / HTTP/1.0\r\n\r\n");
    while ($str = trim(fgets($fp, 4096)))
       header($str);
    fpassthru($fp);
    fclose($fp);
}
?>
{% endhighlight %}
