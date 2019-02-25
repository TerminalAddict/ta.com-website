---
layout: post
author: paul
comments: true
categories: development
icon: css.svg
---
So I do a bit of web development, and of course have developed all 3 my own sites numerous times. I'm currently using [Jekyll](https://jekyllrb.com/){: target="_blank"} for my own sites ([TerminalAddict.com](https://terminaladdict.com){: target="_blank"}, [Loudas.com](https://www.loudas.com){: target="_blank"}, and [Paulwillard.nz](https://paulwillard.nz){: target="_blank"}), you can read about it here: [Jekyll Getting Started]({% post_url 2018-10-17-Jekyll-Getting-Started %}).    
I want to talk about validation.

## Not all web browser are equal
This is straight from the w3 website:

> While contemporary Web browsers do an increasingly good job of parsing even the worst HTML “tag soup”, some errors are not always caught gracefully. Very often, different software on different platforms will not handle errors in a similar fashion, making it extremely difficult to apply style or layout consistently.  <br />
> Using standard, interoperable markup and stylesheets, on the other hand, offers a much greater chance of having one's page handled consistently across platforms and user-agents. Indeed, most developers creating rich Web applications know that reliable scripting needs the document to be parsed by User-Agents without any unexpected error, and will make sure that their markup and CSS is validated before creating a rich interactive layer.  <br />
> When surveyed, a large majority of Web professionals will state that validation errors is the first thing they will check whenever they run into a Web styling or scripting bug.  <br />


Basically, all browsers suck somehow. None of them do the right things, and they are always arguing about who is doing it right, and who is doing it wrong; boring !!

## What I do

I try to write valid code ! It's really simple.  
Simple things like closing all your tags, creating valid headers, using `&amp;` instead of &.

### I use a few tools to check my work:

* HTML Validator Chrome extension: [Link here](https://chrome.google.com/webstore/detail/html-validator/mpbelhhnfhfjnaehkcnnaknldmnocglk){: target="_blank"}

This little tool installs as part of the Chrome developer tools, and is a simple, quick test, of whether you've produced valid html.  
This tool uses [HTML-Tidy](http://www.html-tidy.org/){: target="_blank"} in the background. [^1]

{% include thumbnail.html img="HTML-Tidy.png" %}

* The w3c validator: [Link here](https://validator.w3.org/){: target="_blank"}

This is a fantastic tool, but interestingly, returns different results to the previous mentioned tool; it must use a different validation tool, or whatever.  
Absolutely use this during development, and before signing off as complete, on any web project. [^2]

* The Structure Data testing tool: [Link here](https://search.google.com/structured-data/testing-tool/u/0/){: target="_blank"}

Here's a quote from Google:

> Google Search works hard to understand the content of a page. You can help us by providing explicit clues about the meaning of a page to Google by including structured data on the page.

So Structured Data lets you define and describe your website data. I use this extensively at [Loudas.com](https://www.loudas.com){: target="_blank"}, as the data is "bloggy", and it's used fairly heavily here too.

* Chrome "Lighthouse test"

In the Chrome developer tools there is a tab titled "Audits". This uses a chrome tool called lighthouse.  
This is awesome! Not only does it test validity of your website, but also suggested ways to make your website faster.

{% include thumbnail.html img="Lighthouse-tests.png" %}

Challenge yourself to see if you can get 100% across all tests. But here's a warning, you're going to learn about [^3]ServiceWorkers if you don't already know about them.  

## The Benefits

Well this is also simple; things tend to work better when they're using a standard.  
You'll likely come across less browser based bugs. But as I mentioned earlier, all browsers suck, so the key word here is *likely* :)  
Plus, you can gloat on forums about how awesome your website is, and how somebody elses is rubbish.

Actually, don't do that last one, instead just send them this link, and say something like "bro, want some help?".

## Conclusion

Do better work that meets standards :) there are heaps of tools to help you out along the way.

Got some cool tools you use? Drop me a comment and let me know.

[^1]: The HTML Validator extension has started causing an error in the console: Unchecked runtime.lastError: The message port closed before a response was received.
[^2]: Some of my "paid" work is terrible ! The customers don't seem to value validation, and therefore won't pay for my time to work through errors in their web apps (read: Wordpress installs).
[^3]: I use [Google Chrome - Workbox](https://github.com/GoogleChrome/workbox){: target="_blank"} as my ServiceWorker, you can read through my source to see how I use it.
