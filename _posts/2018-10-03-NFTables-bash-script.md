---
layout: post
author: paul
comments: true
categories: [linux, bash]
---
In 2018 I changed from running iptables to running nftables. This is my BASH script I use on my firewall.

This script firstly removes any remaining iptables rules, and kernel modules (as they can cause problems).
it then loads the new nftables rules.
I've included examples of accepting ports, as well as forwarding ports to a server.
I also have another file called "banned_ips" which is just a list of IPs or networks that I want to completely ban.

{% highlight bash %}
#!/bin/bash

SYSCTL="/sbin/sysctl -w"
nft="/usr/sbin/nft"
IPT="/sbin/iptables"
BANNED="/etc/banned_ips"


# DEAL WITH IPTABLES .. you can probably safely remove this section once things settle
echo "Flushing IPTables ..."

# Reset Default Policies
$IPT -P INPUT ACCEPT
$IPT -P FORWARD ACCEPT
$IPT -P OUTPUT ACCEPT
$IPT -t nat -P PREROUTING ACCEPT
$IPT -t nat -P POSTROUTING ACCEPT
$IPT -t nat -P OUTPUT ACCEPT
$IPT -t mangle -P PREROUTING ACCEPT
$IPT -t mangle -P OUTPUT ACCEPT

# Flush all rules
$IPT -F
$IPT -t nat -F
$IPT -t mangle -F

# Erase all non-default chains
$IPT -X
$IPT -t nat -X
$IPT -t mangle -X

echo "Removing IPTables kernel modules ..."
rmmod iptable_mangle
rmmod iptable_nat
rmmod ipt_MASQUERADE
# FINISHED DEALING WITH IPTABLES ..

# Internet Interface
INET_IFACE="enp0s20f0"

# LAN Interface Information
LOCAL_IFACE="enp3s0"
LOCAL_IP="192.168.1.254"
LOCAL_NET="192.168.1.0/24"
LOCAL_BCAST="192.168.1.255"

# Localhost Interface
LO_IFACE="lo"
LO_IP="127.0.0.1"

# define some commonly used hosts
SERVER="192.168.1.2"

# nft does not do save and restore (in the current debian it screws things up)
# Save and Restore arguments handled here
# if [ "$1" = "save" ]
# then
#     echo -n "Saving firewall to /etc/nftables.save ... "
#     $nft list ruleset > /etc/nftables.save
#     echo "done"
#     exit 0
# elif [ "$1" = "restore" ]
# then
#     echo -n "Restoring firewall from /etc/nftables.save ... "
#     $nft -f /etc/nftables.save
#     echo "done"
#     exit 0
# fi

###############################################################################
#
# Load Modules
#
echo "Loading kernel modules ..."

# /sbin/modprobe ip_tables
/sbin/modprobe nf_nat
/sbin/modprobe nf_nat_ipv4
/sbin/modprobe nf_conntrack
/sbin/modprobe nf_conntrack_ipv4
/sbin/modprobe nf_conntrack_irc
/sbin/modprobe nf_nat_ftp
/sbin/modprobe nf_conntrack_ftp

###############################################################################
#
# Kernel Parameter Configuration
#
# See http://ipsysctl-tutorial.frozentux.net/chunkyhtml/index.html
# for a detailed tutorial on sysctl and the various settings
# available.

# Required to enable IPv4 forwarding.
# Redhat users can try setting FORWARD_IPV4 in /etc/sysconfig/network to true
# Alternatively, it can be set in /etc/sysctl.conf
if [ "$SYSCTL" = "" ]
then
    echo "1" > /proc/sys/net/ipv4/ip_forward
else
    $SYSCTL net.ipv4.ip_forward="1"
fi

# This enables dynamic address hacking.
# This may help if you have a dynamic IP address \(e.g. slip, ppp, dhcp\).
#if [ "$SYSCTL" = "" ]
#then
#    echo "1" > /proc/sys/net/ipv4/ip_dynaddr
#else
#    $SYSCTL net.ipv4.ip_dynaddr="1"
#fi

# This enables SYN flood protection.
# The SYN cookies activation allows your system to accept an unlimited
# number of TCP connections while still trying to give reasonable
# service during a denial of service attack.
if [ "$SYSCTL" = "" ]
then
    echo "1" > /proc/sys/net/ipv4/tcp_syncookies
else
    $SYSCTL net.ipv4.tcp_syncookies="1"
fi

# This enables source validation by reversed path according to RFC1812.
# In other words, did the response packet originate from the same interface
# through which the source packet was sent?  It's recommended for single-homed
# systems and routers on stub networks.  Since those are the configurations
# this firewall is designed to support, I turn it on by default.
# Turn it off if you use multiple NICs connected to the same network.
if [ "$SYSCTL" = "" ]
then
    echo "1" > /proc/sys/net/ipv4/conf/all/rp_filter
else
    $SYSCTL net.ipv4.conf.all.rp_filter="1"
fi

# This kernel parameter instructs the kernel to ignore all ICMP
# echo requests sent to the broadcast address.  This prevents
# a number of smurfs and similar DoS nasty attacks.
if [ "$SYSCTL" = "" ]
then
    echo "1" > /proc/sys/net/ipv4/icmp_echo_ignore_broadcasts
else
    $SYSCTL net.ipv4.icmp_echo_ignore_broadcasts="1"
fi

# This option can be used to accept or refuse source routed
# packets.  It is usually on by default, but is generally
# considered a security risk.  This option turns it off.
if [ "$SYSCTL" = "" ]
then
    echo "0" > /proc/sys/net/ipv4/conf/all/accept_source_route
else
    $SYSCTL net.ipv4.conf.all.accept_source_route="0"
fi

# This option accepts only from gateways in the default gateways list.
if [ "$SYSCTL" = "" ]
then
    echo "1" > /proc/sys/net/ipv4/conf/all/secure_redirects
else
    $SYSCTL net.ipv4.conf.all.secure_redirects="1"
fi

# This option logs packets from impossible addresses.
if [ "$SYSCTL" = "" ]
then
    echo "1" > /proc/sys/net/ipv4/conf/all/log_martians
else
    $SYSCTL net.ipv4.conf.all.log_martians="1"
fi

# This option allows connection tracking for helpers (like ftp and irc connection tracking)
if [ "$SYSCTL" = "" ]
then
    echo "1" > /proc/sys/net/netfilter/nf_conntrack_helper
else
    $SYSCTL net.netfilter.nf_conntrack_helper="1"
fi

###############################################################################
#
# Flush Any Existing Rules or Chains
#
$nft flush ruleset

if [ "$1" = "stop" ]
then
    echo "Firewall completely flushed!  Now running with no firewall."
    exit 0
fi

$nft add table filter
$nft add chain filter input { type filter hook input priority 0\; policy drop \; }
$nft add chain filter forward { type filter hook forward priority 0\; policy drop \; }
$nft add chain filter output { type filter hook output priority 0\; policy accept \; }

$nft add table nat
$nft add chain nat prerouting { type nat hook prerouting priority 0 \; }
# this is a router so masq
$nft add chain nat postrouting { type nat hook postrouting priority 100 \; meta oifname $INET_IFACE masquerade\; }

# Banned IPs
if [ -f "$BANNED" ]; then
    last=`tail -1 $BANNED`
    BANNED_LIST=""
    while read BANNED_IP; do
        if [ $BANNED_IP == $last ]; then
            BANNED_LIST="$BANNED_LIST$BANNED_IP"
        else
            BANNED_LIST="$BANNED_LIST$BANNED_IP, "
	fi
    done &lt;$BANNED
    $nft add rule filter input meta iifname $INET_IFACE ip saddr {$BANNED_LIST} ct state new log prefix \"Banned IP: \" drop
fi

# Specific rules for dropping ports that I found were open
## $nft add rule filter input tcp dport 110 ct state new log prefix \"110 input: \"

$nft add rule filter input tcp dport 110 reject with icmp type port-unreachable comment \"reject INPUT port 110\"
$nft add rule filter input tcp dport 995 reject with icmp type port-unreachable comment \"reject INPUT port 995\"
$nft add rule filter input tcp dport 143 reject with icmp type port-unreachable comment \"reject INPUT port 143\"
$nft add rule filter input tcp dport 993 reject with icmp type port-unreachable comment \"reject INPUT port 993\"

# Drop locals from internet
# commented out for testing
$nft add rule filter input meta iifname $INET_IFACE ip saddr { 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12 } drop

# Drop invalid
$nft add rule filter input ct state invalid drop

# accept from LO
$nft add rule filter input meta iifname lo accept

# Accept pings
$nft add rule filter input icmp type echo-request accept
$nft add rule filter input icmp type time-exceeded accept

# accept from LAN
$nft add rule filter forward meta iifname $LOCAL_IFACE ip saddr $LOCAL_NET accept

# Port forwarding rule (2 lines, one forward/accept and one dnat)
# SERVER
$nft add rule filter forward meta iifname $INET_IFACE ip daddr $SERVER tcp dport 22 accept
$nft add rule nat prerouting meta iifname $INET_IFACE tcp dport 22 counter dnat $SERVER:22 comment \"DNAT 22 ssh to $SERVER\"

# Rules specifcally to allow access to the firewall
$nft add rule filter input meta iifname $LOCAL_IFACE ip daddr $LOCAL_BCAST accept
$nft add rule filter input meta iifname $LOCAL_IFACE ip daddr $LOCAL_NET accept
$nft add rule filter input tcp dport 2222 ct state new log prefix \"SSH input: \" counter accept comment \"Allow ssh 2222 \"
$nft add rule filter input meta iifname $LOCAL_IFACE udp dport 67 accept comment \"Allow DHCP from $LOCAL_IFACE\"
$nft add rule filter input meta iifname $INET_IFACE udp sport 67 udp dport 68 accept comment \"Allow DHCP client on $INET_IFACE\"
$nft add rule filter input meta iifname $INET_IFACE udp sport 68 udp dport 67 drop comment \"Drop DHCP server on $INET_IFACE\"
$nft add rule filter input meta iifname $INET_IFACE ip daddr 224.0.0.1 drop comment \"Drop multicast on $INET_IFACE\"
$nft add rule filter input meta iifname $INET_IFACE ip daddr 239.255.255.250 drop comment \"Drop uPnP on $INET_IFACE\"
$nft add rule filter input meta iifname $LOCAL_IFACE ip daddr 255.255.255.255 accept comment \"Accept broadcast from $LOCAL_IFACE\"

# Accept related, established, needed to be near the bottom of the chains
$nft add rule filter input ct state related, established accept
$nft add rule filter forward ct state related, established accept

# Policies - Important ! the last rule to run
$nft add rule filter input ct state new log prefix \"Dropped input packet \"
$nft add rule filter input drop;
$nft add rule filter forward ct state new log prefix \"Dropped forward packet \"
$nft add rule filter forward drop;
$nft add rule filter output accept;
{% endhighlight %}
