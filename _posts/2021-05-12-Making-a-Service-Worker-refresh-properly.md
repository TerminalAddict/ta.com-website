---
title: Making a Service Worker refresh properly
layout: post
author: paul
comments: true
categories: [development]
icon: js.svg
---
I've been playing around in web development for years, in fact, the first web "application" I wrote was in 1994, the year the world wide web was available to the general public in New Zealand.  
The last couple of years I've been focused on Progressive Web Apps (PWA's), and this includes using service workers, which are notoriously bad at breaking the refresh button in browsers.  
Maybe another title for this post might be: **How to Fix the Refresh Button When Using a Service Worker** 🔄  

## The Backstory
So, let's start with: I use [Google Workbox](https://developers.google.com/web/tools/workbox/){: target="_blank"}.  
They even have a [Github Repository](https://github.com/GoogleChrome/workbox){: target="_blank"}.  

Also, I am a New Zealander (a kiwi 🥝), and I host all my websites and apps in New Zealand. In fact, I run my own hosting and internet company called [Net Enterprises Ltd](https://www.netenterprises.co.nz/){: target="_blank"}.  
Another (I think it might be little known) fact, is New Zealand isn't connected very well with the rest of the world in terms of fibre connections. So, something in the UK that might be simple, like loading the workbox library from the CDN, turns out to be a slow experience here in New Zealand.  

The punchline? I host a local copy of all the libraries I use: jQuery, Boostrap, Popper.js, Workbox, DataTables, etc ...

I wanted an easy method to update my workbox library locally.  
Fortunately, Google provide a "workbox-cli" to do exactly this.

You need Node installed, and npm-check-updates for my little script to work:  

{% highlight bash %}
#!/bin/bash
NPM=/usr/bin/npm
NCU=/usr/bin/ncu
CURDIR=$(pwd)
if [ ! -f $NPM ]; then
    echo npm/node not installed
    exit 1
fi
if [ ! -f $NCU ]; then
    echo npm-check-updates not installed
    echo install it with
    echo sudo npm i -g npm-check-updates
    exit 1
fi
if [ ! -f $CURDIR/node_modules/workbox-cli/build/bin.js  ]; then
    echo installing workbox-cli
    $NPM install workbox-cli
fi
echo updating node_modules
$NCU -u
$NPM update
echo updating workbox local files
$CURDIR/node_modules/workbox-cli/build/bin.js copyLibraries local_workbox
{% endhighlight %}

Running this script will create a local copy of the workbox library in a folder called "local_workbox".

## The Service Worker
So, a key concept for a service worker is that, to load a service worker you need to run javascript in your page, then you have separate javascript running _as the service worker_.  

So, let's get to it.  

## The Service Worker Lifecycle
Google produces some great documentation entitled [The Service Workers Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle){: target="_blank"}, but if you're starting out, this doc can be overwhelming.  
So I'm going to try and break this down as simply as I can (this is how I understood service workers).

1. On the first visit to a PWA a service worker is installed, and some cache maybe?
2. The second visit to PWA the content is probably loaded from the cache.
3. The PWA has some new content.
4. On the third visit to the PWA (after the new content has been added), the content is loaded from the cache!!
    * Wait?!?!? What?!?!? Where's the new content?????
5. During the third visit a new version of the service worker is installed and sits in a state called "waiting".
6. With some magically voodoo magic the new service worker is installed, replacing the first service worker.
7. On the fourth visit to the PWA the new content appears.

So, there was definitely some weird thing I was missing about caching and loading new service workers.  
This week I figured it out.  
I need check to see if there is a service worker in "waiting" and prompt the user. (I actually saw this in real life on Tinder, last year sometime 😂).  

So back to the code:  
## Code in your page

{% highlight javascript %}
const promptStr = 'New version of this site is available, do you want to update? It may take two reloads.';
function createUIPrompt(opts) {
  if (confirm(promptStr)) {
     opts.onAccept()
  }
}
// register a service worker for offline content
// This code sample uses features introduced in Workbox v6.
import {Workbox, messageSW} from '../local_workbox/workbox-v6.1.5/workbox-window.prod.mjs';

if ('serviceWorker' in navigator) {
  const wb = new Workbox('sw.js');
  let registration;

  const showSkipWaitingPrompt = (event) => {
    const prompt = createUIPrompt({
      onAccept: () => {
        // Assuming the user accepted the update, set up a listener
        // that will reload the page as soon as the previously waiting
        // service worker has taken control.
        wb.addEventListener('controlling', (event) => {
          window.location.reload();
        });
        wb.messageSW({ type: 'SKIP_WAITING', payload: 'SKIP_WAITING' });
      },
      onReject: () => {
        prompt.dismiss();
      }
    });
  };

  // Add an event listener to detect when the registered
  // service worker has installed but is waiting to activate.
  wb.addEventListener('waiting', showSkipWaitingPrompt);
  wb.register().then(function() {
    // console.log('CLIENT: service worker registration complete.');
    }, function () {
        console.log('CLIENT: service worker registration failure.');
    });
} else {
  console.log('CLIENT: service worker is not supported.');
}
{% endhighlight %}

Let's work through this script, top to bottom to see what it does.  

First off, there's a little function that creates a JS prompt, and on clicking "ok" will return onAccept.  

Then we head to the meat of the script!  

We import a couple of libraries from the workbox local copy: Workbox, and messageSW (Later we're going to send a message to the service worker!).  

Let's first check if the browser supports service workers (if 'serviceWorker' in navigator).  
The we'll fire up a new Workbox object.

Here's the tricky bit .. SkipWaiting ...  
This had me stumped for a while, mainly because I didn't really understand how service workers worked!  
But reading through the lifecycle, kind of got me to a point where I understood _just_ enough.  

We create a function showSkipWaitingPrompt that does 2 things:
1. Send a message to the service worker that is "waiting" to skipwaiting, and just install itself.
2. Reload the page.

Now we add an event listener that "listens" for the "waiting" message in the browser, and when it hears it, it runs the showSkipWaitingPrompt function.  
Next, we register the service worker.  
Plus, I chuck in a couple of console.log's for good measure (so I can keep an eye of what's going on).

that's it .. that is our javascript module!!!  

> Note: it's a module!!!

Which brings me to a key point!!  
When loading this javascript you must load it as a module in your browser:  
{% highlight html %}
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-dns-prefetch-control" content="on">
  </head>
  <body>
    <p>My Main body content</p>
    <script src="load-service-worker.js" type="module"></script>
  </body>
</html>
{% endhighlight %}

Notice that script tag that has type="module"?

## The Service Worker code
Now, my understanding of service workers is probably just enough to get me in trouble, so I'd love to hear people's feedback about this.  

So, here goes ...  
{% highlight javascript %}

importScripts("../local_workbox/workbox-v6.1.5/workbox-sw.js");

workbox.setConfig({
  debug: false,
  modulePathPrefix: "../local_workbox/workbox-v6.1.5/"
});

var CACHE_NAME='my-cache';

workbox.precaching.precacheAndRoute([
{url: '/', revision: '1620607563' },
{url: '/404.html', revision: '1620607563' },
{url: '/contact.html', revision: '1620607563' },
{url: '/history.html', revision: '1620607563' },
{url: '/personal.html', revision: '1620607563' },
{url: '/projects.html', revision: '1620607563' },
{url: '/staff.html', revision: '1620607563' },
{url: '/sw.js', revision: '1620607563' },
{url: '/sitemap.xml', revision: '1620607563' },
{url: '/robots.txt', revision: '1620607563' }
], {
  directoryIndex: null,
});

// cache images
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 10 * 24 * 60 * 60 // 10 Days
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      }),
    ],
  })
);

// cache styles
workbox.routing.registerRoute(
  ({request}) => request.destination === 'style',
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 10 * 24 * 60 * 60 // 10 Days
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      }),
    ],
  })
);

var urlsToCache = [
  '/',
  '/404.html',
  '/contact.html',
  '/history.html',
  '/personal.html',
  '/projects.html',
  '/staff.html',
  '/sw.js',
  '/sitemap.xml',
  '/robots.txt'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        console.log('Returned from cache');
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                console.log('Storing in cache');
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('message', (event) => {
  console.log('Message received');
  if (event.data && event.data.type === 'SKIP_WAITING') {
    return self.skipWaiting();
  }
});
{% endhighlight %}

This was mostly lifted straight from Google's [Advanced Recipes](https://developers.google.com/web/tools/workbox/guides/advanced-recipes){: target="_blank"}.  
The bit that I changed was how to handle sending the SkipWaiting message.  
For some reason I couldn't get messageSkipWaiting() loaded. I think they have removed it, but haven't updated the documentation?  
Anyway, I didn't feel like picky to bits Google's code, so I changed it to messageSW().  

Which required me to add a small listener to the service worker:  
{% highlight javascript %}
self.addEventListener('message', (event) => {
  console.log('Message received');
  if (event.data && event.data.type === 'SKIP_WAITING') {
    return self.skipWaiting();
  }
});
{% endhighlight %}

Pretty simple: listen for a message of type 'SKIP_WAITING', with the content 'SKIP_WAITING', then execute skipWaiting(), i.e. install the new service worker.  

You can also see how I configure routes to cache, and how I add the files into the cache.  

## Conclusion
Firstly, you can see how I use this exact principle with this web site, and how I integrate it with Jekyll.  
Take a look at the [TerminalAddict.com Github repository](https://github.com/TerminalAddict/ta.com-website){: target="_blank"}.  

Now when new data is found on this website, a prompt is offered to the user, instead of hoping the user might come back later to see the new content.  

### Give me some feedback
As I mentioned, I'd love to hear people's thoughts.  
Service workers are very polarising in the web community, some hate them, some love them.  
And everyone that uses them, seem to use them differently.  

So drop me a message if you've got something to share.  

