---
layout: post
author: paul
comments: true
categories: [linux, bash, osx]
icon: apple.svg
---
In 2018 I got a flashy new MacBook Pro. Using the macOS integrated backup solution Time Machine I wanted to build an open source Apple Time Capsule.  
Apple Mac OSX doesn't allow you to use a network share as a backup location.  
The steps described below are tested on Debian Stretch but might also work on other Debian based distributions like Ubuntu.

#### Step 1  
Netatalk, the open source deployment of Apple Filling Protocol (AFP) has to be installed.

`sudo apt-get install netatalk libc6-dev avahi-daemon libnss-mdns`

#### Step 2  
Edit the hosts line in /etc/nsswitch.conf with the editor of your choice. I am using vi.
`sudo vi /etc/nsswitch.conf`
The line should be adjusted as followed:
```
hosts:          files mdns4_minimal [NOTFOUND=return] dns mdns4 mdns
```

#### Step 3  
Create the file /etc/avahi/services/afpd.service

`sudo vi /etc/avahi/services/afpd.service`

and fill it with this content:

{% highlight xml %}
<?xml version="1.0" standalone='no'?><!--*-nxml-*-->
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
    <name replace-wildcards="yes">%h</name>
    <service>
        <type>_afpovertcp._tcp</type>
        <port>548</port>
    </service>
    <service>
        <type>_device-info._tcp</type>
        <port>0</port>
        <txt-record>model=TimeCapsule</txt-record>
    </service>
</service-group>
{% endhighlight %}

#### Step 4  
Now add the shares for the backups. Edit /etc/netatalk/AppleVolumes.default and add the parameter tm.
`sudo vi /etc/netatalk/AppleVolumes.default`
I have created a timemachine share for my wife and I.

```
# The line below sets some DEFAULT, starting with Netatalk 2.1.
:DEFAULT: options:upriv,usedots,tm
# By default all users have access to their home directories.
/mnt/timemachine/paul "TimeMachine Paul"
/mnt/timemachine/helen "TimeMachine Helen"
# End of File
```

#### Step 5  
Finally, Netatalk has to be adjusted.
`sudo vi /etc/default/netatalk`
Edit the folowing variables:
```
ATALKD_RUN=no
PAPD_RUN=no
CNID_METAD_RUN=yes
AFPD_RUN=yes
TIMELORD_RUN=no
A2BOOT_RUN=no
```
Now just restart the services for Netatalk and Avahi.
```
systemctl restart netatalk.service
systemctl restart avahi-daemon.service
```
#### Final notes  
Each user must be a real user on your linux server (i.e. `useradd paul` ).
You may have to create and change ownership of the directories (i.e. `mkdir -p /mnt/timemachine/paul && chown paul:paul /mnt/timemachine/paul` ).
Now you should be able to access the shares from timemachine.
