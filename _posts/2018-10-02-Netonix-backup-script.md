---
layout: post
author: paul
comments: true
categories: [bash, linux]
icon: bash.svg
---
Working for a [WISP](https://en.wikipedia.org/wiki/Wireless_Internet_service_provider){:target="_blank"} I entensively use [Netonix](https://www.netonix.com/){:target="_blank"} switches. I was asked to code a backup script with parameters in BASH.

So I was asked to code a script that accepts an IP address, and a name, that would backup a switch at IP address to name.tar
This script will show my coding style.
It requires a public key ssh access to the switch for the root user to be setup first.
You can also pass the script -q to surpress any output.

{% highlight bash %}
#!/bin/bash

## CONFIGURATION PARAMETERS

# The ssh user name on remote server
REMOTE_USER="root"
# The path to the used ssh key file (if exists)
KEYFILE="/path/to/ssh-key"

## NO NEED TO EDIT BELOW THIS LINE

# Quiet mode
QUIET=false
# red colour for big fat error
RED='\033[0;31m'
NC='\033[0m' # No Color
# surpress built-in GETOPTS errors
OPTERR=0

VERSION="2018-04-10"

CheckIP() {
    if [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        ping -c1 "$1" > /dev/null 2>&1
        if [ "$?" = 0 ]; then
          return 0
        else
          echo -e "\n${RED}$IP is not reachable${NC}\n" 77 help
        fi
    else
       echo -e "\n${RED}$IP is not valid${NC}\n" 77 help
    fi 
    return 0
}

CheckDir() {
    DIR=$(dirname "$1")
    if [ ! -d "$DIR" ]; then
        echo -e "\n${RED}Directory $DIR does not exist${NC}\n" && help
    fi
    if [ ! -w "$DIR" ]; then
        echo -e "\n${RED}Directory $DIR is not writable${NC}\n" && help
    fi
    return 0
}

help() {
    SCRIPT_NAME="$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")"
    echo "$SCRIPT_NAME version $VERSION

$SCRIPT_NAME is a small shell script that backups up a netonix switch

Put your settings in the config section in the script itself!

Options
 -q                 quiet mode
 -i                 IP address of the switch
 -n                 name of file out put (example: -n thisName would produce thisName.tar)
                    this could also include a path i.e. /tmp/thisName.tar
 -h                 show this screen
"
exit 0
}

# Yippieeh, commandline parameters

while getopts i:n:hq option 
do
    case "${option}" in
        i) REMOTE_HOST=${OPTARG};;
        n) NAME=${OPTARG};;
        q) QUIET=true;;
        h) help;;
        *) help;;

    esac
done
shift $((OPTIND-1))
test -z "${REMOTE_HOST}" && echo -e "\n${RED}IP address is mandatory${NC}\n" && help
test -z "${NAME}" && echo -e "\n${RED}NAME is mandatory${NC}\n" && help

CheckIP $REMOTE_HOST
CheckDir $NAME

if [ "$QUIET" = "false" ]; then echo "I'm continuing"; fi

# Connect to remote switch and perform a local backup
if [ "$QUIET" = "false" ]; then echo "I'm connecting to $REMOTE_HOST to performa a local backup"; fi

RESULTS=$(ssh -i $KEYFILE $REMOTE_USER@$REMOTE_HOST '/usr/bin/config_backup')
if [ "$QUIET" = "false" ]; then 
    if [ "$?" = 0 ]; then echo "Success"; else echo "\n${RED}Uh-oh !! Failed running backup on the $REMOTE_HOST ${NC}\n"; fi
fi

# Grab a copy of the backup from the remote switch and save it
if [ "$QUIET" = "false" ]; then echo "I'm downloading backup from $REMOTE_HOST and saving to $NAME"; fi

RESULTS=$(scp -i $KEYFILE $REMOTE_USER@$REMOTE_HOST:/tmp/wispswitch_config.tar $NAME.tar)
if [ "$QUIET" = "false" ]; then 
    if [ "$?" = 0 ]; then echo "Success"; else echo -e "\n${RED}Uh-oh !! Failed downloading from $REMOTE_HOST ${NC}\n"; fi
fi
{% endhighlight %}
