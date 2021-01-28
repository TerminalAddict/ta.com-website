---
layout: post
author: paul
comments: true
categories: [linux, networking, bash]
icon: bash.svg
slug: LetsEncrypt
---
So in a few of my posts I've mentioned [Let's Encrypt](https://letsencrypt.org){: target="_blank"} as a method of getting SSL Certificates for free.  
In this post I'll explain how I set up [Nginx](https://www.nginx.com){: target="_blank"} to use Let's Encrypt SSL certs.

## Initial install and setup
I decide a while ago that [Dehydrated](https://github.com/dehydrated-io/dehydrated){: target="_blank"} would be the script I would use to manage my SSL certs. And conveniently for me there is a Debian package. So let's install it.

```aptitude install dehydrated``` 

This creates a config directory in ```/etc/dehydrated``` and stores all your certs in ```/var/lib/dehydrated/certs```.  
Great, let's config it.

{% highlight bash %}
#############################################################
# This is the main config file for dehydrated               #
#                                                           #
# This is the default configuration for the Debian package. #
# To see a more comprehensive example, see                  #
# /usr/share/doc/dehydrated/examples/config                 #
#                                                           #
# For details please read:                                  #
# /usr/share/doc/dehydrated/README.Debian                   #
#############################################################
CONFIG_D=/etc/dehydrated/conf.d
BASEDIR=/var/lib/dehydrated
WELLKNOWN="/var/www/dehydrated"
DOMAINS_TXT="/etc/dehydrated/domains.txt"
CONTACT_EMAIL=paul@domain.com
HOOK=/etc/dehydrated/hook.sh
{% endhighlight %}


Ok, so there's a few things in this config we're going to have to create

* the directory /var/www/dehydrated
* the file /etc/dehydrated/domains.txt
* the hook file /etc/dehydrated/hook.sh

So let's do that:

```mkdir /var/www/dehydrated && chown www-data:www-data /var/www/dehydrated```  
Pretty simple so far.

The domains file
{% highlight bash %}
terminaladdict.com www.terminaladdict.com myother-subdomain.terminaladdict.com
{% endhighlight %}

Let's Encrypt creates one certificate "per line" i.e. it creates one certificate that covers the domain terminaladdict.com, and the sub domains.  
The sub domains must all exist in DNS, and all exist in Nginx.

## The Hook File
I got this hook file from [Antoine Aflalo](https://www.aaflalo.me/2016/09/dehydrated-bash-client-lets-encrypt/){: target="_blank"}   
Here it is:

{% highlight bash %}
deploy_challenge() {
     local DOMAIN="${1}" TOKEN_FILENAME="${2}" TOKEN_VALUE="${3}"
}
clean_challenge() {
 local DOMAIN="${1}" TOKEN_FILENAME="${2}" TOKEN_VALUE="${3}"
}
deploy_cert() {
 local DOMAIN="${1}" KEYFILE="${2}" CERTFILE="${3}" FULLCHAINFILE="${4}" CHAINFILE="${5}" TIMESTAMP="${6}"

 systemctl reload nginx
}
unchanged_cert() {
 local DOMAIN="${1}" KEYFILE="${2}" CERTFILE="${3}" FULLCHAINFILE="${4}" CHAINFILE="${5}"
}
invalid_challenge() {
 local DOMAIN="${1}" RESPONSE="${2}"
}
request_failure() {
 local STATUSCODE="${1}" REASON="${2}" REQTYPE="${3}"
}
exit_hook() {
 :
}
HANDLER="$1"; shift
if [[ "${HANDLER}" =~ ^(deploy_challenge|clean_challenge|deploy_cert|unchanged_cert|invalid_challenge|request_failure|exit_hook)$ ]]; then
 "$HANDLER" "$@"
fi
{% endhighlight %}

## Nginx Config 
Setting up Nginx is pretty straight forward, you need a ".well-known" directive:

{% highlight nginx %}
server {
    listen 80;
    listen [::]:80;

    location /.well-known/acme-challenge {
        alias /var/www/dehydrated;
    }
    root /var/www/html/terminaladdict.com;

    server_name terminaladdict.com www.terminaladdict.com;
}
{% endhighlight %}
that's our entire config for port 80 (HTTP).

For the SSL port 443 (HTTPS) config:
{% highlight nginx %}
server {
	listen 443 ssl http2;
	listen [::]:443 ssl http2;

    location /.well-known/acme-challenge {
      alias /var/www/dehydrated;
    }
    ssl_certificate /var/lib/dehydrated/certs/terminaladdict.com/fullchain.pem;
    ssl_certificate_key /var/lib/dehydrated/certs/terminaladdict.com/privkey.pem;

	# enables all versions of TLS, but not SSLv2 or 3 which are weak and now deprecated.
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

    # disables all weak ciphers
    ssl_ciphers 'AES128+EECDH:AES128+EDH';

    ssl_prefer_server_ciphers on;

    root /var/www/html/terminaladdict.com;
    client_max_body_size 100m;

    index index.html;

    server_name terminaladdict.com;
    access_log /var/log/nginx/terminaladdict.com-access.log;
    error_log /var/log/nginx/terminaladdict.com-error.log;

    location / {
        try_files $uri $uri/ index.html;
        add_header Service-Worker-Allowed /;
    }
    error_page 404 =404 /404.html;

    location /manifest.json {
        default_type application/x-web-app-manifest+json;
    }

    location ~ /\.ht {
        deny all;
    }
    # ESSENTIAL : no favicon logs
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
    # ESSENTIAL : robots.txt
    location = /robots.txt {
        allow all;
        log_not_found off;
        access_log off;
    }
    location ~* sw\.js$ {
        expires -1;
    }
    # PERFORMANCE : Set expires headers for static files and turn off logging.
    location ~* ^.+\.(js|css|swf|xml|txt|ogg|ogv|svg|svgz|eot|otf|woff|mp4|ttf|rss|atom|jpg|jpeg|gif|png|ico|zip|tgz|gz|rar|bz2|doc|xls|exe|ppt|tar|mid|midi|wav|bmp|rtf)$ {
            access_log off; log_not_found off; expires 30d;
    }
}
{% endhighlight %}

You won't be able to restart Nginx yet, as you don't have the certs.  
What I do is comment out the two lines that point to the certs, reload Nginx, then uncomment them once I have the certs.

## Apache Config
Setting up Apache is pretty straight forward, you need a .well-known directive:  
{% highlight bash %}
 <VirtualHost *:80>
    ServerAdmin paul@paulwillard.nz
    DocumentRoot /var/www/html/terminaladdict.com
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
    ServerName terminaladdict.com
	ServerAlias www.terminaladdict.com
 
    Alias /.well-known/acme-challenge /var/www/dehydrated
    <Directory /var/www/dehydrated>
    	Options None
    	AllowOverride None
    	# Apache 2.x
     	<IfModule !mod_authz_core.c>
    		 allow,deny
    		 from all
    	</IfModule>
    	# Apache 2.4
    	<IfModule mod_authz_core.c>
    		 all granted
    	</IfModule>
    	RedirectMatch 404 "^(?!/\.well-known/acme-challenge/[\w-]{43}$)"
    </Directory>
    RewriteEngine On
    RewriteCond %{REQUEST_URI} !^/.well-known/acme-challenge [NC]
    RewriteCond %{HTTPS} off
    RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI}
</VirtualHost>
{% endhighlight %}
thats our entire config for port 80 (HTTP).

For the SSL port 443 (HTTPS) config:  
* notice I have 2 ssl directives, the www directive redirects to the non-www directive.  

{% highlight bash %}
<IfModule mod_ssl.c>
    <VirtualHost _default_:443>
        ServerAdmin paul@paulwillard.nz
        DocumentRoot /var/www/html/terminaladdict.com
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
        ServerName www.terminaladdict.com;

        SSLEngine on
        SSLCertificateFile /var/lib/dehydrated/certs/terminaladdict.com/fullchain.pem
        SSLCertificateKeyFile /var/lib/dehydrated/certs/terminaladdict.com/privkey.pem

        Alias /.well-known/acme-challenge /var/www/dehydrated
        <Directory /var/www/dehydrated>
            Options None
            AllowOverride None
            # Apache 2.x
            <IfModule !mod_authz_core.c>
                 allow,deny
                 from all
            </IfModule>
            # Apache 2.4
            <IfModule mod_authz_core.c>
                 all granted
            </IfModule>
        RedirectMatch 404 "^(?!/\.well-known/acme-challenge/[\w-]{43}$)"
        </Directory>
        RewriteEngine On
        RewriteCond %{REQUEST_URI} !^/.well-known/acme-challenge [NC]
        RewriteCond %{HTTPS} off
        RewriteRule (.*) https://terminaladdict.com%{REQUEST_URI}
    </VirtualHost>
</IfModule>
<IfModule mod_ssl.c>
    <VirtualHost _default_:443>
        ServerAdmin paul@paulwillard.nz
        DocumentRoot /var/www/html/terminaladdict.com
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
        ServerName terminaladdict.com;

        SSLEngine on
        SSLCertificateFile /var/lib/dehydrated/certs/terminaladdict.com/fullchain.pem
        SSLCertificateKeyFile /var/lib/dehydrated/certs/terminaladdict.com/privkey.pem
        <FilesMatch "\.(cgi|shtml|phtml|php)$">
            SSLOptions +StdEnvVars
        </FilesMatch>
        <Directory /usr/lib/cgi-bin>
            SSLOptions +StdEnvVars
        </Directory>

        Alias /.well-known/acme-challenge /var/www/dehydrated
        <Directory /var/www/dehydrated>
            Options None
            AllowOverride None
            # Apache 2.x
            <IfModule !mod_authz_core.c>
                 allow,deny
                 from all
            </IfModule>
            # Apache 2.4
            <IfModule mod_authz_core.c>
                 all granted
            </IfModule>
        RedirectMatch 404 "^(?!/\.well-known/acme-challenge/[\w-]{43}$)"
        </Directory>
        <FilesMatch \.php$>
            # 2.4.10+ can proxy to unix socket
            SetHandler "proxy:unix:/run/php/php7.3-fpm.sock|fcgi://localhost"
        </FilesMatch>
    </VirtualHost>
</IfModule>
{% endhighlight %}

## Getting the cert
Here we go:  
```dehydrated -fc -c```

You should see output like this:
{% highlight bash %}
Processing terminaladdict.com with alternative names: www.terminaladdict.com
 + Checking domain name(s) of existing cert... unchanged.
 + Checking expire date of existing cert...
 + Valid till Mar 12 12:05:56 2020 GMT Certificate will expire
(Less than 30 days). Renewing!
 + Signing domains...
 + Generating private key...
 + Generating signing request...
 + Requesting new certificate order from CA...
 + Received 2 authorizations URLs from the CA
 + Handling authorization for terminaladdict.com
 + Handling authorization for www.terminaladdict.com
 + 2 pending challenge(s)
 + Deploying challenge tokens...
 + Responding to challenge for terminaladdict.com authorization...
 + Challenge is valid!
 + Responding to challenge for www.terminaladdict.com authorization...
 + Challenge is valid!
 + Cleaning challenge tokens...
 + Requesting certificate...
 + Checking certificate...
 + Done!
 + Creating fullchain.pem...
 + Done!
{% endhighlight %}

That's it! go and load your website in a browser and check out your new SSL certificate!

## Automating
Hello cron:  
```
# lets encrypt
5 2     * * 6   root    /usr/bin/dehydrated -fc -c > /dev/null 2>&1
```

