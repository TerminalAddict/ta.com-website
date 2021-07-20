---
layout: post
author: paul
comments: true
categories: [linux, networking, bash]
icon: linux.svg
slug: WildCardSSL
---
A little while ago I posted about [Let's Encrypt](https://letsencrypt.org){: target="_blank"} as a method of getting SSL Certificates for free.  
Recently I had a customer who wants a community website, and they want to offer "communityName.example.com" URLs.  
In this post I'll explain how I use [Dehydrated](https://github.com/dehydrated-io/dehydrated){: target="_blank"} to genetrated wildcard [Let's Encrypt](https://letsencrypt.org){: target="_blank"} SSL certs.  

So, I have a customer who wants to build a community website, nothing new.  
They want to offer their community users a custom URL specific to their name, in the form of username.example.com.  

## Prerequisites
You're going to need:
* A working [Dehydrated](https://github.com/dehydrated-io/dehydrated){: target="_blank"} install.
* A working [Bind 9](https://www.isc.org/){: target="_blank"} server.
    * The Bind 9 server must be authoratative for the domain.
* Some bash skillz yo.

> I have a separte DNS server, and web server.  
> So that means I have to have a copy of the key file on both machines.  
> We'll get to that ....

## Generate a hmac-sha512 Key
So, we all know I'm a [Debian](https://www.debian.org/){: target="_blank"} user.  
What that means, is all the Googling in the world kept pointing me to use dnssec-keygen to generate my key.  
Well, dnssec-keygen isn't around anymore. Instead tsig-keygen is our friend.  

tsig-keygen is part of the bind9 package, so I'm running this command on my nameserver.  
Let's generate a key:  
{% highlight bash %}
tsig-keygen -a HMAC-SHA512 -r /dev/random letsencrypt_wildcard
key "letsencrypt_wildcard" {
        algorithm hmac-sha512;
        secret "cGBBoH3wtO9e7KT1M3o1Mpe4UNLkNv2nUifQpwxBdSzoAHawkAWdMbm82TXHW+Yihu/IWinB79vqZsNYRjPDMg==";
};
{% endhighlight %}
> Don't panic: this is not my key 😁

You'll need to copy this into a file. I called my file letsencrypt_wildcard_key.conf and placed it in my /etc/bind directory.  

## Include the key in Bind9
Pretty simple. You have to tell Bind9 about your key.  
So in named.conf.local  
{% highlight bash %}
include "/etc/bind/letsencrypt_wildcard_key.conf";
{% endhighlight %} 

## Edit the zone file to allow updates
In your domain zone, you will need to allow updates from people and/or processes using that key (so keep it secret!).  
{% highlight bash %}
zone "example.com" in {
        type master;
        notify no;
        check-names warn;
        file "/var/lib/bind/example.com";
        update-policy {
            grant letsencrypt_wildcard. name _acme-challenge.example.com. txt;
        };
};
{% endhighlight %}

> Special note:  
> In the key file we named the key "letsencrypt_wildcard"  
> In the zone file we refer to: "letsencrypt_wildcard."  
> Notice the period/full stop at the end?  
> That's important

The update policy is restrictive.  
It only allows the updating of the sub domain _acme-challenge.example.com, and only it's TXT record.  

### The Wildcard zone
You'll also need a wildcard entry in your zone:  
{% highlight bash %}
*               IN      CNAME   example.com.
{% endhighlight %}

Restart Bind9 and make sure everything is tickety boo 👍.  

## The Wildcard hook file
So, [Dehydrated](https://github.com/dehydrated-io/dehydrated){: target="_blank"} uses hooks to run stuff during the certifying process.  

On my webserver, in the /etc/dehydrated directory I'm going to create a new file called wildcard_hook.sh  
{% highlight bash %}
#!/usr/bin/env bash

#
# Example how to deploy a DNS challenge using nsupdate
#
# $1 an operation name (clean_challenge, deploy_challenge, deploy_cert, invalid_challenge or request_failure) and some operands for that. For deploy_challenge
# $2 is the domain name for which the certificate is required,
# $3 is a "challenge token" (which is not needed for dns-01), and
# $4 is a token which needs to be inserted in a TXT record for the domain.
#
# /usr/bin/dehydrated --cron --challenge dns-01 --domain *.example.com --alias star_example.com --hook /etc/dehydrated/wildcard_hook.sh

set -e
set -o pipefail

DOMAIN="$2"
TEXT="$4"
NSUPDATE="/usr/bin/nsupdate -k /etc/dehydrated/letsencrypt_wildcard_key.conf"
DOMAIN_SERVERS=(ns1.netent.co.nz)

case "$1" in
    "deploy_challenge")
        for DNSSERVER in $(DOMAIN_SERVERS[@]); do
            # printf "server %s\nzone %s\nupdate add _acme-challenge.%s. 3600 TXT \"%s\"\nsend\n" "${DNSSERVER}" "${DOMAIN}" "${DOMAIN}" "${TEXT}" | $NSUPDATE
            echo "adding $TEXT to $DOMAIN  on $DNSSERVER"
        done
        ;;
    "clean_challenge")
        for DNSSERVER in $(DOMAIN_SERVERS[@]); do
            # printf "server %s\nzone %s\nupdate delete _acme-challenge.%s. 3600 TXT \"%s\"\nsend\n" "${DNSSERVER}" "${DOMAIN}" "${DOMAIN}" "${TEXT}" | $NSUPDATE
            echo "deleting $TEXT from $DOMAIN on $DNSSERVER"
        done
        ;;
    "deploy_cert")
        # optional:
        # /path/to/deploy_cert.sh "$@"
        ;;
    "unchanged_cert")
        # do nothing for now
        ;;
    "startup_hook")
        # do nothing for now
        ;;
    "exit_hook")
        # do nothing for now
        ;;
    *)
        exit 0
        ;;
esac

exit 0
{% endhighlight %}

and let `chmod 755 /etc/dehydrated/wildcard_hook.sh`  

> Note:
> This bash script usses nsupdate, which is part of the dnsutils package  
> So install dnsutils if you need to  


## Generate a cert
Here's the exciting bit, let's see if it works:  
{% highlight bash %}
/usr/bin/dehydrated --cron --challenge dns-01 --domain *.example.com --alias star_example.com --hook /etc/dehydrated/wildcard_hook.sh
{% endhighlight %}

## Conslusion 
We've generated a Wildcard SSL cert !  
Woohoo 🥳  

Now in theory, you could probably cron this. I haven't yet.  
I want to keep an eye on the process.  

I do, however, have a separate reporting process that keeps an eye on all my SSL certs, and emails me if one is going to expire in the next 20 days.  
So, I have a backup plan for my SSL certs.  
Maybe, one day I'll blog about my SSL report?  

Good luck, and Happy Secure Browsing! 😊

