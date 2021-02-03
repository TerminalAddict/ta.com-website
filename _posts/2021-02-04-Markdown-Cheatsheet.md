---
layout: post
author: paul
comments: true
categories: [jekyll, development]
icon: jekyll.svg
---
I use markdown a lot, but sometimes need a quick "cheat sheet" (because I'm thinking about code, rather documenting normally)  
Here is my "cheat sheet"  


This Markdown cheat sheet provides a quick overview of all the Markdown syntax elements. It can’t cover every edge case, so if you need more information about any of these elements, refer to the reference guides for [basic syntax](https://www.markdownguide.org/basic-syntax){: target="_blank"} and [extended syntax](https://www.markdownguide.org/extended-syntax){: target="_blank"}.

Also note, all code highlight is done using [Rouge](http://rouge.jneen.net/){: target="_blank"}

## Basic Syntax

These are the elements outlined in John Gruber’s original design document. All Markdown applications support these elements.

### Heading

{% highlight markdown %}
# H1
## H2
### H3
{% endhighlight %}

### Bold

{% highlight markdown %}
**bold text**
{% endhighlight %}

### Italic

{% highlight markdown %}
*italicized text*
{% endhighlight %}

### Blockquote

{% highlight markdown %}
> blockquote
{% endhighlight %}

### Ordered List

{% highlight markdown %}
1. First item
2. Second item
3. Third item
{% endhighlight %}

### Unordered List

{% highlight markdown %}
- First item
- Second item
- Third item
{% endhighlight %}

### Code

{% highlight markdown %}
`code`
{% endhighlight %}

### Horizontal Rule

{% highlight markdown %}
---
{% endhighlight %}

### Link

{% highlight markdown %}
[title](https://www.example.com)
[title](https://www.example.com){: target="_blank"}
{% endhighlight %}

### Image

{% highlight markdown %}
![alt text](image.jpg)
{% endhighlight %}

## Extended Syntax

These elements extend the basic syntax by adding additional features. Not all Markdown applications support these elements.

### Table

{% highlight markdown %}
| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |
{% endhighlight %}

### Fenced Code Block

{% highlight markdown %}
```
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
```
{% endhighlight %}

### Footnote

{% highlight markdown %}
Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.
{% endhighlight %}

### Heading ID

{% highlight markdown %}
### My Great Heading {#custom-id}
{% endhighlight %}

### Definition List

{% highlight markdown %}
term
: definition
{% endhighlight %}

### Strikethrough

{% highlight markdown %}
~The world is flat.~~
{% endhighlight %}

### Task List

{% highlight markdown %}
- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media
{% endhighlight %}

