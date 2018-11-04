---
layout: post
author: paul
comments: true
categories: [linux, bash, mikrotik]
icon: debian.svg
---
I pretty frequently install debian. There is always some sort of development going on that needs me to fire up a new install.  
I wrote a script to update my Debian Netboot directory etc.

I download a new Netboot image from Debian, compare the checksums (to make sure the download is good), then override some boot parameters.  
You need to install a tfpd server.  
`aptitude install tftpd-hpa`

{% highlight bash %}
#!/bin/bash
rm -rf /tmp/netboot-tmp/
mkdir /tmp/netboot-tmp/
cd /tmp/netboot-tmp/


# Get image and validation files
wget http://deb.debian.org/debian/dists/stable/main/installer-amd64/current/images/netboot/netboot.tar.gz -O /tmp/netboot-tmp/netboot.tar.gz
wget http://deb.debian.org/debian/dists/stable/main/installer-amd64/current/images/SHA256SUMS -O /tmp/netboot-tmp/SHA256SUMS

# Check the checksum of the file
SUM1=`cat SHA256SUMS | grep -F netboot/netboot.tar.gz | awk '{print $1}'`
SUM2=`sha256sum netboot.tar.gz | awk '{print $1}'`
if [ "$SUM1" != "$SUM2" ]; then
        echo "Checksum failed for netboot.tar.gz, $SUM2 is not $SUM1"
        exit -1
fi

# Check the checksum of the checksum file
SUM1=`cat /tmp/netboot-tmp/Release | grep -A 100000 '^SHA256' | grep -F installer-amd64/current/images/SHA256SUMS | awk '{print $1}'`
SUM2=`sha256sum /tmp/netboot-tmp/SHA256SUMS | awk '{print $1}'`
if [ "$SUM1" != "$SUM2" ]; then
        echo "Checksum failed for SHA256SUMS, $SUM2 is not $SUM1"
        exit -1
fi

# Extract the archive contents
# cd /srv/tftp
rm -rf /srv/tftp/*
tar -xf /tmp/netboot-tmp/netboot.tar.gz -C /srv/tftp

# Set the timeout so installation is hands off
sed 's/timeout 0/timeout 1/' --in-place /srv/tftp/debian-installer/amd64/pxelinux.cfg/default

# Set up the installer to use the serial console
sed 's@append vga=788 initrd=debian-installer/amd64/initrd.gz --- quiet@append initrd=debian-installer/amd64/initrd.gz --- quiet console=ttyS1,115200n1@' --in-place /srv/tftp/debian-installer/amd64/boot-screens/txt.cfg

# clean up
rm -rf /tmp/netboot-tmp/
{% endhighlight %}

To make this super easy to use you can configure your DHCPd server to tell hosts to netboot.  
Here is an example using the isc-dhcpd-server. It assumes your subnet is 192.168.1.0/24 and the tfpd server is running on 192.168.1.2:

{% highlight dhcpd %}
subnet 192.168.1.0 netmask 255.255.255.0 {
    .......
    next-server 192.16.1.2;
    filename "pxelinux.0";
}
group {
    next-server 192.168.1.2;
    host tftpclient {
        filename "pxelinux.0";
    }
}
{% endhighlight %}

Here is an example using Mikrotik. It assumes your subnet is 192.168.1.0/24 and the tfpd server is running on 192.168.1.2:
```
/ip dhcp-server network
add address=192.168.1.0/24 boot-file-name=pxelinux.0 dns-server=192.168.1.1 domain=example.com gateway=192.168.1.1 next-server=192.168.1.2
```
