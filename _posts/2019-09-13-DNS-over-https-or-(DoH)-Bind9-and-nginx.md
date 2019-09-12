---
layout: post
author: paul
comments: true
categories: [networking, linux]
icon: systems.svg
slug: DoH
---
So in a litte while Google Chrome is going to enable DNS over HTTPs, and Firefox has already enabled it, by default!  
So I think to myself "myself, do you want cloudflare watching all your DNS queries?" - nope is the the answer!  
Right, so I'll build my own DNS over HTTPs (DoH) server.

So what I'm going to do is:
* Setup nginx to act as a front end proxy.
* Build and install a go package called [doh-server](https://github.com/m13253/dns-over-https){:target="_blank"}
* Check that it all works 👨‍💻
* Configure my browser

This doc assumes you have a working DNS server (I use bind9), and you can sort your own SSL certs for nginx.  
It also assumes you know your way around a command line 🤪

## Set up nginx

So I'm not going to talk you through how to install nginx, or get it running, that is beyond the scope of this doc.  
I'm also not going to tell you how to setup [Let's Encrypt](https://letsencrypt.org/){:target="_blank"}, that is also outside the scope of this doc.


So let's get straight into the config:
{% highlight nginx %}
upstream dns-backend {
    server 127.0.0.1:8053;
    keepalive 30;
}
server {
    listen 80;
    listen [::]:80;

    location /.well-known/acme-challenge {
        alias /var/www/dehydrated;
    }
    root /var/www/html;

    server_name ns1.example.com;
    return 301 https://$host;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    location /.well-known/acme-challenge {
      alias /var/www/dehydrated;
    }
    ssl_certificate /etc/dehydrated/certs/ns1.example.com/fullchain.pem;
    ssl_certificate_key /etc/dehydrated/certs/ns1.example.com/privkey.pem;

    # enables all versions of TLS, but not SSLv2 or 3 which are weak and now deprecated.
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

    # disables all weak ciphers
    ssl_ciphers 'AES128+EECDH:AES128+EDH';

    ssl_prefer_server_ciphers on;

    root /var/www/html;

    index index.html index.htm index.nginx-debian.html;

    server_name ns1.example.com;
    access_log /var/log/nginx/ns1.example.com-access.log;
    error_log /var/log/nginx/ns1.example.com-error.log;

    location /dns-query {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;
        proxy_set_header Connection "";
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_redirect off;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_pass http://dns-backend/dns-query;
    }

}
{% endhighlight %}

So let me talk you through the config:  
I start by creating a config that points to our, not yet installed, doh-server. That server is going to be running on port 8053:
{% highlight nginx %}
upstream dns-backend {
    server 127.0.0.1:8053;
    keepalive 30;
}
{% endhighlight %}

Next I've got a server block for port 80 (non-secure / non https).  
It has some config for my Let's Encrypt SSL cert bot (dehydrated), and redirects everthing to the SSL version of the website (return 301):
{% highlight nginx %}
server {
    listen 80;
    listen [::]:80;

    location /.well-known/acme-challenge {
        alias /var/www/dehydrated;
    }
    root /var/www/html;

    server_name ns1.example.com;
    return 301 https://$host;
}
{% endhighlight %}

and lastly, the SSL version config, includng the reverse proxy bit which I will repeat here (because it is the important bit):
{% highlight nginx %}
location /dns-query {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_set_header X-NginX-Proxy true;
    proxy_set_header Connection "";
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_redirect off;
    proxy_set_header        X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
    proxy_pass http://dns-backend/dns-query;
}
{% endhighlight %}

So assuming that you have your SSL certs sorted, and your nginx config is all good you should be able to start nginx 🥰

## Install doh-server

so you'll need some build packages, so let's install some build tools:  
`aptitude install curl software-properties-common build-essential git`

And you're going to need to get your golang environment setup:  
[Install Go on Debian Buster]({% post_url 2019-09-10-Install-Golang-on-Debian-Buster %})

now let's install the DoH server:  
{% highlight bash %}
git clone git@github.com:m13253/dns-over-https.git
cd dns-over-https/
make
make install
{% endhighlight %}

Now let's config the DoH server:  
The DoH server has a config in /etc/dns-over-https/doh-server.conf  
You want to change the upstream to use 127.0.0.1:53 and that's about it, here's what I've got:
{% highlight conf %}
listen = [
    "127.0.0.1:8053",
    "[::1]:8053"
]
local_addr = ""
cert = ""
key = ""
path = "/dns-query"
upstream = [
	"127.0.0.1:53"
]
timeout = 10
tries = 3
tcp_only = false
verbose = false
log_guessed_client_ip = false
{% endhighlight %}

Once you've got that saved you can restart the DoH server with `systemctl restart doh-server`  

## Testing the install
So let's recap:  
We have:
* Configured nginx and got it running nicely, forwarding DoH requests
* Installed a DoH server
* We already had a DNS resolver installed and running, right? 🧐

Now let's do some testing.

The DoH server returns JSON, so you can just test in your browser:  
https://ns1.example.com/dns-query?name=example.org&type=A  

Or, since you're already working in a terminal (and this website _is_ called Terminal Addict 😇)
{% highlight bash %}
curl -s "https://ns1.example.com/dns-query?name=example.org&type=A" | python -m json.tool
{% endhighlight %}

You should get a JSON response like the following:
{% highlight json %}
{
    "AD": true,
    "Answer": [
        {
            "Expires": "Thu, 12 Sep 2019 22:59:07 UTC",
            "TTL": 7090,
            "data": "93.184.216.34",
            "name": "example.org.",
            "type": 1
        },
        {
            "Expires": "Thu, 12 Sep 2019 22:59:07 UTC",
            "TTL": 7090,
            "data": "A 8 2 86400 20190921055451 20190831145703 31036 example.org. r4fWzdiYS7Px0qXX+7cHtPsj2a3lFhmeM4OXvOsDd2WorpP3Na/FupUFozdp2ao7xyguW+tZSJEI01dKuMt5MDfmJR4cN2n+IiRMvLvQuG60SnQNRBmOTTwca79GNTv5To8rxU5kSixH1liyho2/c/hvIqZKajHs6Bxr460A/RM=",
            "name": "example.org.",
            "type": 46
        }
    ],
    "Authority": [
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "l.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "j.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "h.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "e.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "f.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "g.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "k.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "b.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "d.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "i.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "a.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "m.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "c.root-servers.net.",
            "name": ".",
            "type": 2
        },
        {
            "Expires": "Thu, 12 Sep 2019 21:18:35 UTC",
            "TTL": 1058,
            "data": "NS 8 0 518400 20190925170000 20190912160000 59944 . E7Vt9bijsTA8J2m5mcI9mc7uyk2PAbjtuDS4zGFaDVpVP4UyFFPYrttCA5CrXFurVN+Qf0nzB31pLzPfrgnY2xqe2S0Pm7Qq+t7rCp/Q1mNp3JbZG4fYxRXoz9uz4zSCaXDJ9WP4zrWrYd++ZGuUs4DXawg9qo0QhX5KRnXehDM9WkjY3JM61tw8CN5KS1ODov7Nw5qZI2uJ69npPnElm163cePQgZTkoGA8AO5vgmgHVbZZqQ3GkxNa8lzHNH/G66xEvPXLe03h6QptCHcOugU6SwCzmxbt2hQnvbQXZk4eGz330CmwlwVPEAKP3VwWsruEkU+LWBIohDg/0Yk6Dg==",
            "name": ".",
            "type": 46
        }
    ],
    "CD": false,
    "Question": [
        {
            "name": "example.org.",
            "type": 1
        }
    ],
    "RA": true,
    "RD": true,
    "Status": 0,
    "TC": false,
    "edns_client_subnet": "103.123.164.0/0"
}
{% endhighlight %}

## Configure your browser

Well in Firefox this is pretty easy.  
Search your preferences / settings in Firefox for DNS.  

{% include thumbnail.html img="FF-DoH-settings.png" %}

In Google Chrome the setting will be released in version 78 I'm told, I guess I'll keep an eye out 🙃

## Conclusion

So, maybe you're super sentive about people spying on you, maybe you like playing with new gadgets / tech. Who knows.  
But, I certainly don't trust cloudflare enough to be giving them my browser DNS queries!  

So we've now got DNS over HTTPs to use, and we own all our own history / data 👍
