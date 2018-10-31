---
layout: post
author: paul
comments: true
categories: [linux, bash]
---
Firstly, getting a [git](https://git-scm.com/){:target="_blank"} server up and running is pretty easy.  
Make sure git is installed `aptitude install git`  
Create a git user `adduser git`  
Change the git user's shell `echo $(which git-shell)  >> /etc/shells`, and then `chsh git -s $(which git-shell)`

You should now be able to initiate a git repo on your server.

`cd ~git && git init --bare my-new-project.git && chown -R git:git my-new-project.git`

That's it! You've created a git repo, now on your local machine go and clone it.

`git clone git@myserver:my-new-project.git`
#### SSH Security  
Security is up to you! I have disable password auth in ssh, and loaded my key into `~git/.ssh/authorized_keys`  
This is strongly recommended !!! but if you're building a git server you probably know enough to secure your ssh server. (I hope !)
#### Configuring Nginx  
I'm not going to delve into virtual hosting with [Nginx](https://www.nginx.com/){:target="_blank"} , that's not in this scope.  
What is in scope, is getting nginx to respond accordling to git requests.

I've chosen to serve my git repos over https using a pre-defined sub directory (that doesn't actually exists) called `git/`  
Grab a copy of the following config, chuck it in the appropriate place in nginx then restart nginx.

{% highlight nginx %}
location ~ (/git/.*) {
		client_max_body_size 0; # Git pushes can be massive, just to make sure nginx doesn't suddenly cut the connection add this.
		auth_basic "Git Login"; # Whatever text will do.
		auth_basic_user_file "/home/git/.htpasswd";
		include /etc/nginx/fastcgi_params; # Include the default fastcgi configs
		fastcgi_param SCRIPT_FILENAME /usr/lib/git-core/git-http-backend; # Tells fastcgi to pass the request to the git http backend executable
		fastcgi_param GIT_HTTP_EXPORT_ALL "";
		fastcgi_param GIT_PROJECT_ROOT /home; # /home/git is the location of all of your git repositories.
		fastcgi_param REMOTE_USER $remote_user;
		fastcgi_param PATH_INFO $1; # Takes the capture group from our location directive and gives git that.
		fastcgi_pass  unix:/var/run/fcgiwrap.socket; # Pass the request to fastcgi
	}
{% endhighlight %}
#### Securing http/s with auth  
Finally, let's put a password on the git repo access via http/s.

`htpasswd -c /home/git/.htpasswd myusername`

#### You're done!  
Once you've done that you should be able to check out your repo using http/s from your local machine.

`git clone https://myusername@yourdomain.com/git/my-new-project.git`
