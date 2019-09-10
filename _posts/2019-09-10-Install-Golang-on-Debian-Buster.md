---
layout: post
author: paul
comments: true
categories: [linux, bash, golang]
icon: golang.svg
---
[Go](https://golang.org/){:target="_blank"} is an open source programming language that makes it easy to build simple, reliable, and efficient software.  
This is way easier than you think !! 

## Step 1 - download
Firstly, let make sure our system is up-to-date  
`sudo apt update && sudo apt upgrade`

No let's download the go package:  
Go to [Go's download page](https://golang.org/dl/){:target="_blank} and grab a link for the latest version.  
The version when I wrote this wee blog was go1.13.   
Got the link? sweet! let's download it:  
`wget https://dl.google.com/go/go1.13.linux-amd64.tar.gz`  

Now let's untar it  
`tar xvfz go1.13.linux-amd64.tar.gz`  

And move it to an appropriate place (like /usr/local maybe?)  
`sudo mv go /usr/local/go`  

## Step 2 - setup your environment

We're going to add a few environment variables in our .bashrc, and add to our $PATH.  
so let's do that
{% highlight bash %}
cat << EOF >> ~/.bashrc
export GOROOT=/usr/local/go
export GOPATH=$HOME/goProjects
export PATH=$GOPATH/bin:$GOROOT/bin:$PATH

EOF

{% endhighlight %}

and then create our goProjects directory:  
`mkdir ~/goProjects `

and finally, let's reload our environment:  
`source ~/.bashrc `

What we've done is:
* Told our bash environment where to find go
* Told our bash environment where our working directory is (~/goProjects)
* added two directories to our $PATH

## Step 3 - verify your install

Here comes the easy bit, let's check our installed go version:  
`go version `  

{% highlight bash %}
go version go1.13 linux/amd64
{% endhighlight %}

and let's check our go environment  
`go env`  

{% highlight bash %}
GO111MODULE=""
GOARCH="amd64"
GOBIN=""
GOCACHE="/home/paul/.cache/go-build"
GOENV="/home/paul/.config/go/env"
GOEXE=""
GOFLAGS=""
GOHOSTARCH="amd64"
GOHOSTOS="linux"
GONOPROXY=""
GONOSUMDB=""
GOOS="linux"
GOPATH="/home/paul/goProjects"
GOPRIVATE=""
GOPROXY="https://proxy.golang.org,direct"
GOROOT="/usr/local/go"
GOSUMDB="sum.golang.org"
GOTMPDIR=""
GOTOOLDIR="/usr/local/go/pkg/tool/linux_amd64"
GCCGO="gccgo"
AR="ar"
CC="gcc"
CXX="g++"
CGO_ENABLED="1"
GOMOD=""
CGO_CFLAGS="-g -O2"
CGO_CPPFLAGS=""
CGO_CXXFLAGS="-g -O2"
CGO_FFLAGS="-g -O2"
CGO_LDFLAGS="-g -O2"
PKG_CONFIG="pkg-config"
GOGCCFLAGS="-fPIC -m64 -pthread -fmessage-length=0 -fdebug-prefix-map=/tmp/go-build934234536=/tmp/go-build -gno-record-gcc-switches"
{% endhighlight %}

### Conclusion

Simple eh? 👍

no get "go-ing" 😂
