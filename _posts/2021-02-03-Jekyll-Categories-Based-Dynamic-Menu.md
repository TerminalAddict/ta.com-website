---
layout: post
author: paul
comments: true
categories: [jekyll, development]
icon: jekyll.svg
---
So let's start by reminding every one on how to gte start with [Jekyll](https://jekyllrb.com/){: target="_blank"}, [Jekyll Getting Started]({% post_url 2018-10-17-Jekyll-Getting-Started %})  
That should give a you reminder of where to start off 😀  

## Needing a documentation repo

A little while Atlassian announced that they are stopping support for local server installs of Confluence. Boring ‼️  
I had literally moved my content from Mediawiki to Confluence just two months ago 😫  

I guess this has been on my mind for a while. I don't need a wiki, I need a documentation repository.  
So a little bit of googling I find a nice simple template.  
The template didn't use Bootstrap, or jQuery, which I thought would be fine ... err .. I guess I'm a jQuery whore? 👧  LOL 😝  

So I do a litle bit of this, and little bit of that, and I have the basis of a docs website.  

## Sorting data

My first hurdle is I like categorising my data into "spaces" and then categories.  
What I really want was a structure like:
{% highlight bash %}
Personal
  - Animals
      - A cat named Tivo
      - Lexi the Spaniel
  - Technical-Docs
      - A script I wrote
      - A thing I learned
Net Enterprises
  - Technical-Docs
      - Ip addresses
      - SMTP Server
  - General-Docs
      - Stuff
      - Things
{% endhighlight %}

## Creating a "collection"

so I'll start by creating a "collection" in my _config.yml:
{% highlight yml %}
collections:
  docs:
    title: Documentation
    permalink: /:path/
    output: true
{% endhighlight %}

Now I'll need to create some rules for my documentation: 

* A page title
* a "space"
* a _single_ category
* an order (because I'm going to use that later on)

{% highlight yml %}
---
title: Lexi the Spaniel
space: Personal
category: Animals
order: 5
---
{% endhighlight %}

My documents are stored in the directory ```_docs/Personal/*``` and ```_docs/Net-Enterprises/*```

## Creating a dynamic menu

Now I need to create a menu.  
This took me ages !!!! days of trying different things !!  
And the result ... 15 lines of code 😧  
{% highlight bash %}
{% raw %}
 {% assign space_groups = site.docs | group_by: 'space' %}
 {% for s_group in space_groups %}
 {{ s_group.name  }}
     {% assign CATEGORIES = "" | split: ',' %}
     {% for s in s_group.items %}
         {% assign CATEGORIES = CATEGORIES | push: s.category | uniq %}
     {% endfor %}
     {% for cat in CATEGORIES %}
     {{ cat }}
     {% assign local_list = s_group.items | where: "category", cat %}
         {% for i in local_list %}
         {{ i.title }} - {{ site.baseurl }}{{ i.url }}
         {% endfor %}
     {% endfor %}
 {% endfor %}
{% endraw %}
{% endhighlight %}

## The Result

Let skip straight to the screenshot 😂  
{% include thumbnail.html img="docs_website.png" %}

Anyway .. drop me a comment if you need help with Jekyll things

