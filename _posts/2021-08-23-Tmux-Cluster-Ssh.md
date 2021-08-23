---
layout: post
author: paul
comments: true
categories: [bash, linux, networking]
icon: systems.svg
title: Using Tmux for Cluster SSH
slug: Tmux-ClusterSSH
---
Everyday I connect to a number of servers, and everyday I send the same command to a list of servers.  
Sometimes it is [Ubuntu](https://ubuntu.com/){: target="blank"} servers, sometimes [Debian](https://www.debian.org/){: target="blank"} servers; I needed a way to slice and dice my list of servers, and start a clustered ssh session with the resulting sliced and diced list of servers.  
Enter [tmux](https://github.com/tmux/tmux/wiki){: target="blank" }, [tmux-cssh](https://github.com/peikk0/tmux-cssh){: target="blank"},  and some custom [bash](https://www.gnu.org/software/bash/){: target="blank"} scripting.  

So, a little while a go I switched to Windows as my daily desktop OS.  
I figured out how to tune Windows Terminal to my liking, but was missing clusterssh from my OSX days.  

A friend of mine (Shane Howearth), pointed me (I think he unknowingly pointed me) to [tmux](https://github.com/tmux/tmux/wiki){: target-"blank"}.  
And in turn I was pointed to [tmux-cssh](https://github.com/peikk0/tmux-cssh){: target="blank"}  
> <br />
> Very cool that this is written by a Kiwi (New Zealander). <br />
> <br />

So, tmux-cssh allows me to cluster my ssh sessions. Now I need to figure a way to slice and dice my list of servers.  

## The Problem
I have some Ubuntu servers, and some Debian servers.  
Some of those servers are bare metal, some are not.  
Some of those servers are Hyper Visors, some are not.  

Sometimes I want to connect to only Debian servers, sometimes I want to connect to only real machines (bare metal installs).  
I want the ability to organise my list of servers into some kind of searchable list.  

## My Solution
Firstly, I don't kknow whether this is the most elegant way, in fact, I'm pretty sure it's not, and I would love to hear people's suggestions.  
Comment below !  

For this to work, you must have your ssh sorted.  
i.e. you must be able to do:  
{% highlight bash %}
ssh host1
{% endhighlight %}

Here is what I came up with:  

### The Data

I pictured my list of hosts as a number of rows in a table (or spreadsheet), and my "categories" as row headings.  

Kind of like this:  

<table class="table table-bordered table-hover table-condensed">
<thead><tr><th title="Field #1">hostname</th>
<th scope="col" title="Field #2">debian_hosts</th>
<th scope="col" title="Field #3">real_hosts</th>
<th scope="col" title="Field #4">hv_hosts</th>
<th scope="col" title="Field #5">ubuntu_hosts</th>
<th scope="col" title="Field #6">mikrotik_hosts</th>
<th scope="col" title="Field #7">blank</th>
</tr></thead>
<tbody><tr>
<td>host1</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host2</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host3</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host4</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host5</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host6</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host7</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host8</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host9</td>
<td>y</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host10</td>
<td>y</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host11</td>
<td>y</td>
<td>y</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host12</td>
<td>&nbsp;</td>
<td>y</td>
<td>&nbsp;</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host13</td>
<td>&nbsp;</td>
<td>y</td>
<td>&nbsp;</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host14</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host15</td>
<td>&nbsp;</td>
<td>y</td>
<td>&nbsp;</td>
<td>y</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host16</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>y</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host17</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>y</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host18</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>y</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>host19</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>y</td>
<td>&nbsp;</td>
</tr>
</tbody></table>

> <br />
> Weirdly, I had to create a blank column at the end. <br />
> Otherwise, bash would drop the last column. <br />
> So, now bash drops the blank column. <br />
>

I saved this info into a csv file (input.csv).  
The data is now "predictable". 👍

### Selecting from the data

[awk](https://www.gnu.org/software/gawk/manual/gawk.html){: target="blank"} to the rescue:  

{% highlight bash %}
awk -v c1=3 -F , '$c1 == "y" {print "   "$1}' input.csv
{% endhighlight %}

Let's do a quick run down on awk:  
* -v allows me to pass variables to awk.
    * In this case I'm using it to name my columns.
* -F means fields are separated by the following character. 
    * in this case "," as this is a csv (comma separated values) file.
* {print $1 } means, print the first column. i.e. the hostname.

### Some Bash things I'll use
So, I love [bash](https://www.gnu.org/software/bash/){: target="blank"}.  
I think anyone who reads this blog knows that ❗  

I'm going to create an array I call "categories" using bash's internal [IFS](https://www.gnu.org/savannah-checkouts/gnu/autoconf/manual/autoconf-2.69/html_node/Special-Shell-Variables.html){: target="blank"} special shell variable.  

{% highlight bash %}
IFS=',' read -a categories <<< `head -n 1 input.csv`
{% endhighlight %}

I'm also going to use [getopt](https://www.gnu.org/software/libc/manual/html_node/Getopt.html){: target="blank"} to get variables passed from the command line.   
Basically, I want to use pretty short AND long variable names 😊  

One interesting thing I'll note here:  
I wanted a "list" function that would list all my hosts, or list the hosts in a specific category.  
My getopt options expect a passed argument.  
i.e. `options=$(getopt -o hdrvumal: --long help,debian,real,virtual,ubuntu,mikrotik,all,list: -- "$@")`  

So I wrote a wee bit in the script that checks to see if $arg2 is set, and if it's not, then sets it, and also sets "default" values.  
{% highlight bash %}
if [ -z "$2" ]; then
    arg1=${1:-"h"}
    arg2=${2:-"all"}
    set -- "${arg1}" "${arg2}"
    unset arg1 arg2
fi
{% endhighlight %}

## The Script
that's enough chatter ... here's the script 😌  

I've stored tmux-cssh in my ~/bin/ directory, and made sure it is executable.   

{% highlight bash %}
#!/bin/bash

DATA_SRC=input.csv

IFS=',' read -a categories <<< `head -n 1 $DATA_SRC`

ShowHelp() {
    SCRIPT_NAME="$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")"
    echo "
$SCRIPT_NAME is a small shell script that opens a tmux window pane to a bunch of hosts.
Then runs a tmux session to simulate ClusterSSH

It can only take one argument at a time.
Usage:
$SCRIPT_NAME [single option]
Options
 -h, --help             Show this help screen
 -d, --debian           Open all Debian hosts
 -r, --real             Open all 'real' bare-metal hosts
 -v, --virtualhost      Open all hypervisors (i.e. virtual servers)
 -u, --ubuntu           Open all Ubuntu hosts
 -m, --mikrotik         Open all Mikrotik hosts
 -a, --all              Open all hosts (excluding Mikrotik Hosts)
 -l, --list             List all hosts (optionally pass a category name)

All hosts are defined in the file $DATA_SRC and are categorised as:
* Debian hosts (debian_hosts).
* Real hosts (real_hosts).
* Hyper Visor hosts (hv_hosts).
* Ubunutu hosts (ubuntu_hosts).
* and Mikrotik hosts (mikrotik_hosts).

A valid csv file with the following headers is required:
  hostname,debian_hosts,real_hosts,hv_hosts,ubuntu_hosts,mikrotik_hosts,blank

Note: a blank column is required at the end
"
    exit 1
}

connect_hosts() {
    COLNUM=$1
    if [[ $COLNUM == 1 ]]; then
        # Column 6 is Mikrotik, let's connect to all NON-mikrotik hosts
        ARRAY=(`awk -F , '$6 != "y" {print $1}' <(tail -n +2 $DATA_SRC)`)
    else
        ARRAY=(`awk -v c1=$COLNUM -F , '$c1 == "y" {print $1}' $DATA_SRC`)
    fi

    # echo -e ${ARRAY[@]}
    clusterSSH ${ARRAY[@]}
}

clusterSSH() {
    h=("$@")
    ~/bin/tmux-cssh ${h[@]}
}

listHosts() {
    echo Categories
	case "$1" in
			all)
    			localCOUNT=1
				;;
			debian_hosts)
    			localCOUNT=2
				;;
			real_hosts)
    			localCOUNT=3
				;;
			hv_hosts)
    			localCOUNT=4
				;;
			ubuntu_hosts)
    			localCOUNT=5
				;;
			mikrotik_hosts)
    			localCOUNT=6
				;;
			*)
	esac
    localARRCOUNT=${#categories[@]}
    if [ $localCOUNT -gt 1 ]; then
        echo " "$1
        awk -v c1=$localCOUNT -F , '$c1 == "y" {print "   "$1}' $DATA_SRC
    else
        for cat in "${categories[@]}"; do
            # Column 7 ( -lt  $localARRCOUNT ) is "blank", let's show all NON-blank categories
            if [[ $localCOUNT -gt 1 && $localCOUNT -lt $localARRCOUNT ]]; then
                echo " what "$cat
                awk -v c1=$localCOUNT -F , '$c1 == "y" {print "   "$1}' $DATA_SRC
            fi
            ((localCOUNT++))
        done
    fi
    #
    # echo All Hosts:
	# awk -F , '$1 != "hostname" { print " "$1 }' $DATA_SRC
    #
}

if [ -z "$2" ]; then
    arg1=${1:-"h"}
    arg2=${2:-"all"}
    set -- "${arg1}" "${arg2}"
    unset arg1 arg2
fi

options=$(getopt -o hdrvumal: --long help,debian,real,virtual,ubuntu,mikrotik,all,list: -- "$@")


eval set -- "$options"

while :
do
	case "$1" in
		-h | --help ) ShowHelp; shift; break ;;
		-d | --debian ) connect_hosts "2"; shift; break ;;
		-r | --real ) connect_hosts "3"; shift; break ;;
		-v | --virtual ) connect_hosts "4"; shift; break ;;
		-u | --ubuntu ) connect_hosts "5"; shift; break ;;
		-m | --mikrotik ) connect_hosts "6"; shift; break ;;
		-a | --all ) connect_hosts "1"; shift; break ;;
		-l | --list ) listHosts "$2"; shift 2; break ;;
		* ) ShowHelp; shift; break;;
        -- ) shift; break ;;
	esac
done
{% endhighlight %}

## Conclusion
Well, it works 👍  

I'm not sure this is the "best" way of achieving what I wanted? I'd love to hear what you think.  
