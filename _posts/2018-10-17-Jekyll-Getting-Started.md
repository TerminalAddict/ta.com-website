---
layout: post
author: paul
comments: true
categories: [linux, jekyll, bash, development]
---
So my web development has taken an interesting path, not that different to some others.  
I start back in 1907 doing hand coded html, then moved to hand coded php, then dreamweaver, then CMS.  
Eventually making it to [Wordpress](https://www.wordpress.org){:target="_blank"} then back to PHP, and now to  [Jekyll](https://jekyllrb.com/){:target="_blank"}

My path to adopting Jekyll has been a long one. Every now and then I get a bee in my bonnet about how bloated Wordpress is for many of my web tasks.  
It's great for what it was designed for! Helen uses Wordpress in all her websites, and it is a perfect tool for her.
She's not technical, and just wants to publish articles that she types in an online editor; perfect for Wordpress!

I *am* technical! and I don't need all the things that come with Wordpress, in fact what I really want is the fastest loading website possible.  
In comes Jekyll (plus [bootstrap](https://getbootstrap.com/){:target="_blank"}, [jquery](https://jquery.com/){:target="_blank"}, and [popper.js](https://popper.js.org/){:target="_blank"} ).

So I faffed about on my Macbook and started converting paulwillard.nz to a Jekyll site.  
after a few days I realised I'd lost track of what I had installed, and where I had got to with dev.  
So I thought I'd start from scratch again, and this time document the steps to get a really simple boostrap site up and running.

Before I continue I've got to give credit to a site that has really helped my journey.  
* [Made Mistakes - Going Static](https://mademistakes.com/articles/going-static/){:target="_blank"}
* [Made Mistakes - Going Static Episode II](https://mademistakes.com/articles/jekyll-static-comments/){:target="_blank"}
* [Made Mistakes - Using Jekyll](https://mademistakes.com/articles/using-jekyll-2017/){:target="_blank"}

I have no idea who this Michael Rose character is, but I reckon he's taken the same web development path as me, going by his posts!


So here we go:  
I start with a dead clean fresh install of [Debian Stretch](https://www.debian.org/){:target="_blank"}

## Installing NodeJS and ruby

Let's install the deb source key:  
`curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add -`

and add to our packages sources.list:  
{% highlight bash %}
cat << EOF >> /etc/apt/sources.list
deb https://deb.nodesource.com/node_10.x stretch main
deb-src https://deb.nodesource.com/node_10.x stretch main
EOF

{% endhighlight %}

Now let's install some packages:  

{% highlight bash %}
aptitude update
aptitude install ruby-full build-essential nodejs tree

{% endhighlight %}

## Environment setup

Let's install all our gems to our home directory:  

{% highlight bash %}
cat << EOF >> ~/.bashrc
### Install Ruby Gems to ~/gems
export GEM_HOME=$HOME/gems
export PATH=$HOME/gems/bin:$PATH
EOF 

source ~/.bashrc

{% endhighlight %}

### Install Jekyll

Let's install Jekyll:  
`gem install jekyll bundler`

## Create a Jekyll site

Let's start with a blank site:  
`jekyll new mysite --blank`

and add some JS packages from node:  

{% highlight bash %}
cd mysite
npm init --force
npm install bootstrap
npm install jquery
npm install popper.js

{% endhighlight %}

### \_config.yml Setup

Let's do a basic \_config.yml  
This will tell Jekyll to search a few different paths for [sass](https://sass-lang.com/){:target="_blank"}

and tell Jekyll to include node_modules by setting exclude to 0 (by default Jekyll excludes node_modules)

{% highlight yaml %}
cat << EOF > _config.yml
sass:
    load_paths:
        - _sass
        - node_modules
        - assets/css
exclude: []
EOF

{% endhighlight %}

### default.html Layout

Lets create a pretty simple starter default layout:  

{% highlight html %}
{% raw %}
cat << EOF > _layouts/default.html
<html lang="en">
	<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<title id="pageTitle">Jekyll Getting Started</title>
	<link rel="stylesheet" href="//assets/css/main.css">
	</head>

	<body>
		{{ content }}
	<script src="{{'/node_modules/jquery/dist/jquery.min.js' | prepend: site.baseurl}}"></script>
	<script src="{{'/node_modules/popper.js/dist/umd/popper.min.js' | prepend: site.baseurl}}"></script>
	<script src="{{'/node_modules/bootstrap/dist/js/bootstrap.min.js' | prepend: site.baseurl}}"></script>
	</body>
</html>
EOF 

{% endraw %}
{% endhighlight %}

### main.scss ( CSS )

In our \_layout/default.html we've told the browser to load css from assets/css/main.css, so we better create that:  
first create the directory `mkdir -p assets/css`. 

Now let's put some text in the file:  
> Note: the file has the extension scss, Jekyll will preprocess the CSS and make a .css file  
> you *must* include the first two lines "---", this tells Jekyll to preprocess the file  

{% highlight bash %}
---
---

@import "variables";
@import "bootstrap/scss/bootstrap";

EOF 

{% endhighlight %}

### index.html ( Your new webpage )

Let's create an index.html file.
> Note: include the [frontmatter](https://jekyllrb.com/docs/front-matter/){:target="_blank"}, the first 4 lines  
> This tells Jekyll the layout to use (default.html) and gives the page a title (used in the above layout).  


{% highlight bash %}
cat << EOF > index.html
---
layout: default
title: Pauls new site
---
My new site
EOF 

{% endhighlight %}

## Jekyll build and server

we're done! Let's build the site, then serve it using the inbuilt Jekyll server:  
`jekyll build && jekyll serve --host=0.0.0.0`

## Advanced CSS 

### Using inline CSS

I like to "inline" my CSS, rather than include a css file.  
It's pretty easy to tell Jekyll to inline the CSS.

Let's make an \_includes directory `mkdir _includes`.

Now let's populate a css file in the includes directory:  
>Note: the file extension *is* .css  
>this file has no frontmatter  

{% highlight bash %}
cat << EOF > _includes/main.css
@import "bootstrap/scss/bootstrap";
EOF

{% endhighlight %}

We don't need the old file anymore so let's remove it `rm assets/css/main.scss`. 

finally, in your index.html replace the css line with:

{% highlight html %}
{% raw %}
{% capture styles %}
    {% include main.css %}
    {% endcapture %}
    <style>
    {{ styles | scssify }}
    </style>
{% endraw %}
{% endhighlight %}

We're done! Let's build and serve:  
`jekyll build && jekyll serve --host=0.0.0.0`

### Compressing (Minify ) CSS

If you're like me and like to have the fastest possible website, you're going to want to minify your css

That's super easy too! Just add a small config to your \_config.yml :  

{% highlight bash %}
cat << EOF > _config.yml
sass:
    load_paths:
        - _sass
        - node_modules
        - assets/css
    style: compressed
exclude: []
EOF

{% endhighlight %}

We're done! Let's build and serve:  
`jekyll build && jekyll serve --host=0.0.0.0`

Open your browser and check out the source code the Jekyll produces!

## Final notes

### -- host ?
You may be wondering why I use `jekyll serve --host=0.0.0.0`?  
Why do I use that --host bit?  
Well by default Jekyll serves up on localhost, and my development server is remote (i.e. I can't use localhost).

I *could* port forward localhost 4000 to the development server (I mean, I'm probably on it anyway doing development).  
`ssh -L 4000:localhost:4000 development.server.nz`  

### Including node_modules directory ?
No, I don't actually include the entire node_modules directory. I have a build script that shuffles files around into the right place first.

I put this file in the root of *mysite* then excute using `./ctl.sh -b && ./ctl.sh -s`


{% highlight bash %}
#!/bin/bash
VENDOR_DIR=assets/vendor/
NPM=/usr/bin/npm
JEKYLL=/home/paul/gems/bin/jekyll
BUNDLE=/home/paul/gems/bin/bundle

VERSION="2018-10-15 v1.0"

ShowHelp() {
    SCRIPT_NAME="$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")"
    echo "
$SCRIPT_NAME version $VERSION

$SCRIPT_NAME is a small shell script that updates, builds, and serves a local Jekyll project
it can only take one argument at a time.
Usage:
$SCRIPT_NAME [single option]


Options
 -h, --help             Show this help screen
 -u, --update           Update your npm packages ($NPM update && $NPM install)
 -b, --build            Build your Jekyll project
 -s, --server           start a local Jekyll server ($BUNDLE exec $JEKYLL serve)
"
    exit 1
}

UpdateNPM() {
    if [ ! -d "$VENDOR_DIR" ]; then
        mkdir -p $VENDOR_DIR
    fi
    $NPM update
    $NPM install
    cp node_modules/jquery/dist/jquery.min.js $VENDOR_DIR
    cp node_modules/jquery/dist/jquery.min.map $VENDOR_DIR
    cp node_modules/popper.js/dist/umd/popper.min.js $VENDOR_DIR
    cp node_modules/popper.js/dist/umd/popper.min.js.map $VENDOR_DIR
    cp node_modules/bootstrap/dist/js/bootstrap.min.js $VENDOR_DIR
    cp node_modules/bootstrap/dist/js/bootstrap.min.js.map $VENDOR_DIR 
    $BUNDLE
}

BuildBundledJS() {
    cat $VENDOR_DIR/jquery.min.js &lt;(echo) $VENDOR_DIR/popper.min.js &lt;(echo) $VENDOR_DIR/bootstrap.min.js &lt;(echo) > $JSBUNDLE_DIR/bundle.js
}

JekyllBuild() {
    BuildBundledJS
    export JEKYLL_ENV=production
    $BUNDLE exec $JEKYLL build
}

StartServer() {
    BuildBundledJS
    $BUNDLE exec $JEKYLL serve --host=0.0.0.0
}

case $1 in 
    (-u)
        UpdateNPM
        ;;
    (--update)
        UpdateNPM
        ;;
    (-h)
        ShowHelp
        ;;
    (--help)
        ShowHelp
        ;;
    (-b)
        JekyllBuild
        ;;
    (--build)
        JekyllBuild
        ;;
     (-s)
        StartServer
        ;;
    (--serve)
        StartServer
        ;;
    (*)
        ShowHelp
        ;;
esac

{% endhighlight %}
