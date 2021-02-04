---
layout: post
author: paul
comments: true
categories: [jekyll, development]
icon: jekyll.svg
---
I've had a project going on for a month or so to re-do a [Confluence](https://www.atlassian.com/software/confluence){: target="_blank"} wiki into Markdown files, hence why I pusblished [The Markdown Cheatsheet]({% post_url 2021-02-04-Markdown-Cheatsheet %}), and [Jekyll categories based menu]({% post_url 2021-02-03-Jekyll-Categories-Based-Dynamic-Menu %})  
One thing that can be handy in a wiki is "back links" i.e. what other pages link to this page.  

## The Requirements

I want to automatically find, and display, all other pages in a [Jekyll](https://jekyllrb.com/){:target="_blank"} site that link to the existing page.

## Ruby Plugin

Ok, so let's just skip straight to the meaty bit 😂  

In your [Jekyll](https://jekyllrb.com/){:target="_blank"} root directory, if you don't already have a folder called `_plugins` then create one.  

{% highlight bash %}
mkdir _plugins
{% endhighlight %}

Let's create a file called `_plugins/backlinks_generator.rb`  

{% highlight ruby %}
class BackLinksGenerator < Jekyll::Generator
  def generate(site)

    all_notes = site.collections['docs'].docs
    all_posts = site.posts
    all_pages = site.pages

    all_docs = all_notes + all_posts + all_pages 

    # Identify backlinks and add them to each doc
    all_docs.each do |current_note|
      notes_linking_to_current_note = all_docs.filter do |e|
        e.content.include?(current_note.url)
      end
      current_note.data['backlinks'] = notes_linking_to_current_note
    end

  end

end
{% endhighlight %}

Here's a brief run down of what the [Ruby](https://www.ruby-lang.org){: target="_blank"} script does:
* Creates 3 arrays: all_notes (i.e. a collection), all_post, all_pages.
* Concatinates the 3 arrays into one larger array called all_docs.
* In the current page that [Jekyll](https://jekyllrb.com/){:target="_blank"} is processing, loop through the all_docs array and find out if there is a link to the current page.
* Store the found results in the page/post.data as an array called backlinks ( i.e. page.backlinks or post.backlinks)

## Some CSS

Yeah, just so things look nice 😝  

{% highlight css %}
.backlink-box {
        background-color: #fffdf7;
        
}
.backlink-box:before {
        content: "What links here";
            font-style: italic;
            
}
.backlink-box li {
        line-height: 1em;
        
}
{% endhighlight %}

## The Jekyll layout

I learned quickly that everything seems to link to the home page (i.e. "/").  
So while writing a section in my layout I had to include an exclusion (i.e. {% raw %}{% if page.url != home.url %}{% endraw %} )  

Now each page has an array of backlinks, or doesn't.  
I'll check if backlinks exists, by checking if it is greater than 0 (zero), and if it is, I can just loop through it !  

{% highlight liquid %}
{% raw %}
{% assign home = site.html_pages | where: 'url', '/' | first %}
{% if page.url != home.url %}
    {% if page.showbacklinks == true %}
        {% if page.backlinks.size > 0 %}
            <div class="backlink-box">
                <ul>
                {% for backlink in page.backlinks %}
                    <li><a href="{{ site.url }}{{ backlink.url }}">{{ backlink.title }}</a></li>
                {% endfor %}
                </ul>
            </div>
        {% endif %}
    {% endif %}
{% endif %}
{% endraw %}
{% endhighlight %}

> Note:  
> You can disable showing the backlink on a per page / per post basis by using the front matter  
> ---  
> showbacklinks: no  
> ---  
>

## The Result

sweet screenshot goodness ....   

{% include thumbnail.html img="what_links_here.png" %}    

