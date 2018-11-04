---
comments: true
title: Install a ram drive in Windows 7
categories:
  - development
icon: sysadmin.svg
---
### or How to move the Firefox or Chrome cache to a RAM disk and speed up surfing by 20% or more

If you're as old as me, you probably remember what a [RAM drive](http://en.wikipedia.org/wiki/RAM_disk){: target="_blank} is. 

Back in the golden ages of computing, we had to squeeze every last bit of juice out of our computers (usually for the purpose of playing Quake), you could load a program into a RAM drive; a virtual drive made out of unused RAM. As you probably know, RAM is a lot faster than your hard drive.

Fast forward to today, and it's all about Solid State Drives. Grab one of those bad boys, and your frame rate drops, apps go faster, all sorts of awesomeness happens. Unfortunately a solid state drive will cost you your first born child. Still, with the amount of time I (and probably you) spend in a browser, wouldn't it be cool to sort this out so at least the browser will rocket along?

With a RAM drive, you can make the chrome, firefox, IE, whatever - always load some stuff from memory. This speeds up the entire browsing experience by a significant margin. The browser starts in a flash, switching between tabs feels faster, and page load times can be reduced by 20% or more!

Things you will need to achieve this:

1. [Ram disk software](http://memory.dataram.com/products-and-services/software/ramdisk){: target="_blank} .. The free version of DataRam's ramdisk software will do you
2. Spare ram - I have 16gb in my desktop, so have plenty spare
3. Administration access to your PC .. sorry corporate users, you'll have to ask you system administrator :)


## Instructions:

* Download the [Ram disk software](http://memory.dataram.com/products-and-services/software/ramdisk){: target="_blank} and install it to your system.
* Once installed you can copy my system here which uses a 4092 MB Ram Disk. You may set a smaller or larger drive to use. This is up to you. (a drive larger than 4092 will require a paid version of Ramdisk)
* Set what you see in the screen shots below.

Notice the drive is set to Unformatted. You will see why in a soon.

### Create the image.

{% include thumbnail.html img="RamDisk-1.jpg" %}

{% include thumbnail.html img="RamDisk-2.jpg" %}

_A note here: You may have to play around with which tick boxes. I had to untick "Load disk image at startup" then tick "Create temp" and "Disk Label" then re-tick "Load disk image at startup"._

Once you have set what you see in the above pic hit Start RAMDisk.

Now you need to mount the drive and format it.

### Create the file system.

go to: Start -> Control Panel -> System and Security -> Administrative Tools -> Computer Management -> Disk Management.

Here you should now be greeted with a prompt that you have a new drive.

Mount the drive and quick format it NTFS, give the name RamDrive and assign letter R (R for ramdrive :) ), I also used compression (it's all in ram, compression should be fast as ! :) )

Once the drive is formatted you should see your new ramdrive in "My Computer" .. go have a look.

### Preparing the file system.

* Open the RamDrive.
* Create 2 folders if you use Internet Explore and Firefox. One called IE\_Cache and the other named FF\_Cache.

Now reboot your PC to make sure the RamDisk is working correctly.

_Note:  RamDisk saves your settings, but if you feel the need (which I did), in the ramdisk windows select the file menu, and click save settings._

_Note: Shutdown should take a little longer than normal, this is due to the image of data on the RamDisk being written to the hard drive. Your computer startup should also take a few seconds longer than normal, this is becasue the Ramdisk is being formatted then the image that was written to the hard drive is mounted on the RamDisk. _

### Moving firefox cache.

Open up Firefox. In the address bar type **about:config**

Click the I’ll be careful I promise button.

{% include thumbnail.html img="FF_cache-1.jpg" %}

Right click anywhere in the values in the lower portion of the screen and choose **New -> String**.

{% include thumbnail.html img="FF_cache-2.jpg" %}

Type in **browser.cache.disk.parent_directory** into the “Preference name”

Click OK.

{% include thumbnail.html img="FF_cache-3.jpg" %}

In the next window type in **R:\FF_Cache** in the "string value" (if R: is the RamDisk and you created a folder called FF_Cache).

Click OK.

{% include thumbnail.html img="FF_cache-4.jpg" %}

Restart Firefox ! That's it .. now all your firefox cache is stored on the ram drive, and things should be much faster!

### Internet Explorer cache.

You will need to move Temporary Internet Files folder of Internet Explorer to make it store temporary internet files and all cache data to the RamDrive.

Open Internet Options.

On the General tab look for "Temporary Internet files" or "Browsing history" and hit **Settings**.

{% include thumbnail.html img="IE_cache-1.jpg" %}

Then hit **Move folder** and point to the Cache folder you made on the RamDisk, e.g. **R:\IE_Cache**

{% include thumbnail.html img="IE_cache-2.jpg" %}

You can also set the "Disk space" to be used, do what ever feels good :)

### Moving TEMP and TMP Folder

_Note: you have rebooted right? you **MUST** reboot before moving the TEMP and TMP directories, otherwise you will lose all the work you have done previously._

This tweak takes the Windows TEMP folder and also the TMP folder, and moves it to the RamDrive.

go to: Start Menu -> Right-Click Computer -> Properties -> Advanced System Settings -> Advanced Tab

Click on **Environment Variables**.

{% include thumbnail.html img="Temp-1.jpg" %}

Select The TEMP variable and then click **Edit.**

{% include thumbnail.html img="Temp-2.jpg" %}

Then change the Variable Value to where the RamDrive is. I created a Temp folder on my R: drive, i.e. **R:\Temp**.

{% include thumbnail.html img="Temp-3.jpg" %}

Repeat the same thing for the TMP folder and click **OK**.

### Google Chrome cache

Ok this is a bit trickier .. sorry .. you'll need administrator access, and you'll need to do stuff in a terminal (also known as a command or cmd window).

firstly find out where Chrome is installed, you may have look at the properties of the start menu or desktop shortcut? you could try this:

* While chrome is running, right click on your task bar and select **start task manager**.
* Find any chrome.exe right click on it and select **open file location**.

If you use this method you need to navigate one directory up, because what I really want is the location of the **User Data** folder.

Mine was this: **C:\Users\Paul\AppData\Local\Google\Chrome\User Data\Default**

Ok, so you've found it? close chrome, best open up task manager and make sure there is no chrome.exe application running.

go to: **Start Menu->All Programs->Accessories->Command Prompt**

Right click and select **Run as administrator**

Make sure Chrome is not running then rename the Chrome cache folder like this: **ren "C:\Users\Paul\AppData\Local\Google\Chrome\User Data\Default\cache" "C:\Users\Paul\AppData\Local\Google\Chrome\User Data\Default\cache.old"**

type in this: **mklink /d "C:\Users\Paul\AppData\Local\Google\Chrome\User Data\Default\cache” “R:\ChromeBrowserCache"**

_Note: You will need to change the directory to the directory that you use (I'm guessing your name is probably not Paul :) )_

This creates a "sym link" to your ramdrive for your chrome cache.

### Google Chrome: 1 step further

So I live my life inside Google Chrome, I use it for development, documentation, my email, almost all forms of communication .. lots of things, so I thought, why not run the entire Chrome app in my ram drive.

Firstly create a directory on your Ramdrive, I created: **R:\Applications\Chrome**

Make sure Chrome is not running then rename the Chrome folder like this: **ren "C:\Users\Paul\AppData\Local\Google\Chrome" "C:\Users\Paul\AppData\Local\Google\Chrome.old"**

Again, make sure Chrome.exe is not running, then do this: **mklink /d "C:\Users\Paul\AppData\Local\Google\Chrome" "R:\Applications\Chrome"**


_Note: You will need to change the directory to the directory that you use (I'm guessing your name is probably not Paul )_

Now you have the complete application running from your ramdrive (already in memory). To confirm this, open Chrome, then open a task manager, find Chrome.exe, right click and select **open file location**, it should go directly to your ramdrive folder.

### The downloads folder

So I'm always downloading things; mostly little things, website themes, PDF docs, wordpress source, whatever -things I generally don't want to keep,  but I need for a short time. SO I decided to move my Downloads folder to the ramdrive as well.

Firstly create a folder on your ramdrive i.e. **R:\Downloads**

Next, rename your downloads folder like this: **ren "C:\Users\Paul\Downloads" "C:\Users\Paul\Downloads.old"**

Now sym link your downloads folder like this: **mklink /d "C:\Users\Paul\Downloads" "R:\Downloads"**

_Note: You will need to change the directory to the directory that you use (I'm guessing your name is probably not Paul )_

## Conclusion

The performance improvements is impressive. Apps (firefox, IE, and Chrome) open so fast ! Plus there is an added benefit of not having to write to your hard drive all the time, adding life to your hard drive. If you are an SSD (Solid State Drive) user this will be important to you! as SSDs have a limited number of writes in their lifetime, why waste those writes on browser cache ?

I paid for this app so I can create a larger ram drive with the intention of storing my apps on it. A good place to start might be [http://portableapps.com](http://portableapps.com){: target="_blank"}, where you can download and run things without having to install them.

Measuring the real-world improvement of a RAM disk is tricky. I found that page load times were reduced by around 20%. Shutting down and restarting the browser is also a lot quicker.

If you have any other tips for speeding up the browser cache, leave a comment!
