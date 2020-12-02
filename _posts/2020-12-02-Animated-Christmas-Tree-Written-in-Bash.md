---
layout: post
author: paul
comments: true
categories: [bash, linux]
icon: linux.svg
slug: Animated-Christmas-Tree-Written-in-Bash
---
It's Christmas OMG OMG OMG OMG 🎄 🎅 🤶  
So here is your [TerminalAddict.com](https://terminaladdict.com/) gift for 2020 🎁🎁🎁


## Prerequisites
You must have bash installed 😂

### Assumptions
* I'll assume we have bash installed 😜

## The code
{% highlight bash %}
cat << 'EOF' >> ~/xmas_tree.sh
#!/bin/bash

# tput is a command to manipulate the terminal, it can be used to change the color of text, apply effects, and generally brighten things up.
trap "tput reset; tput cnorm; exit" 2
clear
tput civis
lin=2
col=$(($(tput cols) / 2))
c=$((col-1))
est=$((c-2))
color=0

# Set the text color to green to write the tree
tput setaf 2; tput bold

# Write the tree
for ((i=1; i<40; i+=2))
{
    tput cup $lin $col
    for ((j=1; j<=i; j++))
    {
        echo -n \*
    }
    let lin++
    let col--
}

## Set the color to brown for the trunk
tput sgr0; tput setaf 130

# Write the Trunk in three lines
for ((i=1; i<=3; i++))
{
    tput cup $((lin++)) $c
    echo 'mWm'
}

# Write a greeting
tput setaf 93; tput bold
tput cup $lin $((c - 15)); echo Merry Christmas
tput cup $((lin + 1)) $((c - 15)); echo And a happy new year !!!!
let c++
k=1

# Configure lights and decorations
while true; do
    for ((i=1; i<=35; i++)) {
        # Turn off the lights
        [ $k -gt 1 ] && {
            tput setaf 2; tput bold
            tput cup ${line[$[k-1]$i]} ${column[$[k-1]$i]}; echo \*
            unset line[$[k-1]$i]; unset column[$[k-1]$i]  # Array cleanup
        }

        li=$((RANDOM % 9 + 10))
        start=$((c-li+2))
        co=$((RANDOM % (li-2) * 2 + 1 + start))
        tput setaf $color; tput bold   # Switch colors
        tput cup $li $co
        echo o
        line[$k$i]=$li
        column[$k$i]=$co
        color=$(((color+1)%8))
    }
    k=$((k % 2 + 1))
done


EOF
{% endhighlight %}

Now let's run it
## Execution
Set execution:
{% highlight bash %}
chmod 755 ~/xmas_tree.sh
{% endhighlight %}


Now run it:
{% highlight bash %}
~/xmas_tree.sh
{% endhighlight %}

## The result

Check it out !!!

{% include thumbnail.html img="bash_xmas_tree.gif" %}

# Happy Christmas! 🦌🦌🦌🦌🛷


