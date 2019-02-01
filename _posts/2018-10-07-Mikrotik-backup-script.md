---
layout: post
author: paul
comments: true
categories: [linux, bash, mikrotik]
icon: systems.svg
---
I use [Mikrotik](https://www.mikrotik.com/){:target="_blank"} routers a lot! I work for a [WISP](https://en.wikipedia.org/wiki/Wireless_Internet_service_provider){:target="_blank"} and there are a lot of Mikrotik devices.

This script requires a public key ssh access to the router for a user to be setup first.  
You can also pass the script -q to surpress any output.

{% highlight bash %}
#!/bin/bash

## CONFIGURATION PARAMETERS

# The ssh user name on remote server
REMOTE_USER="user"
# The path to the used ssh key file (if exists)
KEYFILE="~/path/to/private_key"

## A good way of using this to check into a repo
#   pushd /my/git/repo
#   ~/git-repos/mikrotik-backup/mikrotik-backup.sh -n paulwillard-mikrotik -i 192.168.1.254 -t text
#   tail -n +2 paulwillard-mikrotik.daily.rsc > paulwillard-mikrotik.daily.rsc.tmp && mv paulwillard-mikrotik.daily.rsc.tmp paulwillard-mikrotik.daily.rsc
#   git comit -a
#   git push
#   popd

## NO NEED TO EDIT BELOW THIS LINE

# Quiet mode
QUIET=false
# red colour for big fat error
RED='\033[0;31m'
NC='\033[0m' # No Color
# surpress built-in GETOPTS errors
OPTERR=0

VERSION="2018-09-21"

CheckIP() {
    if [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        ping -c1 "$1" > /dev/null 2>&1
        if [ "$?" = 0 ]; then
          return 0
        else
          echo -e "\n${RED}$1 is not reachable${NC}\n" && help
        fi
    else
       echo -e "\n${RED}$1 is not valid${NC}\n" && help
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

$SCRIPT_NAME is a small shell script that backups up a Mikrotik router

Put your settings in the config section in the script itself!

Options
 -q                 quiet mode
 -i                 IP address of the router
 -n                 name of file out put (example: -n thisName would produce thisName.daily.rsc or thisName.daily.backup - depending on -t option)
                    this could also include a path i.e. /tmp/thisName
 -t                 type of backup either text or full
 -h                 show this screen
"
exit 0
}

# Yippieeh, commandline parameters

while getopts i:n:t:hq option
do
    case "${option}" in
        i) REMOTE_HOST=${OPTARG};;
        n) NAME=${OPTARG};;
        q) QUIET=true;;
        t) TYPE=${OPTARG};;
        h) help;;
        *) help;;
    esac
done
shift $((OPTIND-1))
test -z "${REMOTE_HOST}" && echo -e "\n${RED}IP address is mandatory${NC}\n" && help
test -z "${NAME}" && echo -e "\n${RED}NAME is mandatory${NC}\n" && help
test -z "${TYPE}" && echo -e "\n${RED}TYPE is mandatory${NC}\n" && help

case $TYPE in
    text)   BACKUP='/export compact file=daily'
            BACKUPFILE='daily.rsc'
            ;;
    full)   BACKUP='/system backup save name=daily dont-encrypt=yes'
            BACKUPFILE='daily.backup'
            ;;
        *)  echo -e "\n${RED}Invalid TYPE${NC}\n"
            help
            ;;
esac

# concat NAME
NAME=$NAME.$BACKUPFILE

CheckIP $REMOTE_HOST
CheckDir $NAME

if [ "$QUIET" = "false" ]; then echo "I'm continuing"; fi

# Connect to remote switch and perform a local backup
if [ "$QUIET" = "false" ]; then echo "I'm connecting to $REMOTE_HOST to performa a local backup"; fi

RESULTS=$(ssh -i $KEYFILE $REMOTE_USER@$REMOTE_HOST $BACKUP)
if [ "$QUIET" = "false" ]; then
    if [ "$?" = 0 ]; then echo "Success"; else echo "\n${RED}Uh-oh !! Failed running backup on the $REMOTE_HOST ${NC}\n"; fi
fi

# Grab a copy of the backup from the remote switch and save it
if [ "$QUIET" = "false" ]; then echo "I'm downloading backup from $REMOTE_HOST and saving to $NAME"; fi

RESULTS=$(scp -i $KEYFILE $REMOTE_USER@$REMOTE_HOST:$BACKUPFILE $NAME)
if [ "$QUIET" = "false" ]; then
    if [ "$?" = 0 ]; then echo "Success"; else echo -e "\n${RED}Uh-oh !! Failed downloading from $REMOTE_HOST ${NC}\n"; fi
fi
{% endhighlight %}

I actually use this script in a cron job to backup a mikrotik daily.  
I trim the first line from the text backup (which is a date stamp), so git can see the "true" changes.

{% highlight bash %}
#!/bin/bash

pushd /path/to/git-repo/mikrotik-backup
git pull --quiet
mikrotik-backup.sh -q -n paulwillard-mikrotik -i 192.168.1.254 -t text
tail -n +2 paulwillard-mikrotik.daily.rsc > paulwillard-mikrotik.daily.rsc.tmp && mv paulwillard-mikrotik.daily.rsc.tmp paulwillard-mikrotik.daily.rsc
git commit -m "updated backup" -a
git push --quiet
popd
exit 0
{% endhighlight %}
