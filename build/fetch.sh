#!/bin/bash

if [ -d "cache" ]; then
  cd cache
else
  mkdir cache
  cd cache
fi

function download {
  if [ ! -f $1 ]; then
    wget $2 -O $1
  fi
}

download libass.zip https://github.com/libass/libass/archive/master.zip
download fribidi-0.19.7.tar.bz2 http://fribidi.org/download/fribidi-0.19.7.tar.bz2
download freetype-2.6.5.tar.gz http://downloads.sourceforge.net/project/freetype/freetype2/2.6.5/freetype-2.6.5.tar.gz
#download fontconfig-2.12.1.tar.bz2 https://www.freedesktop.org/software/fontconfig/release/fontconfig-2.12.1.tar.bz2
download expat-2.2.0.tar.bz2 http://sourceforge.net/projects/expat/files/expat/2.2.0/expat-2.2.0.tar.bz2

cd ..

rm -rf libass-master \
       freetype-2.6.5 \
       fribidi-0.19.7 \
#       fontconfig-2.12.1 \
       expat-2.2.0

unzip cache/libass.zip
tar -zxvf cache/freetype-2.6.5.tar.gz
tar -jxvf cache/fribidi-0.19.7.tar.bz2
#tar -jxvf cache/fontconfig-2.12.1.tar.bz2
tar -jxvf cache/expat-2.2.0.tar.bz2

