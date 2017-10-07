./fetch.sh

rm -r dist
mkdir dist

cd fribidi-0.19.7
autoreconf -f -i
emmake make clean
emconfigure ./configure CFLAGS="-O3" --prefix=$(pwd)/../dist --host=x86-none-linux --build=x86_64
sed -i 's/ | \\$global_symbol_pipe //' libtool
emmake make
emmake make install
cd ..

#cd expat-2.2.0
#emmake make clean
#emconfigure ./configure CFLAGS="-O3" --prefix=$(pwd)/../dist
#sed -i 's|#include <stdio.h>|#include <stdio.h>\
##include <unistd.h>|g' xmlwf/readfilemap.c
#emmake make
#emmake make install
#cd ..

cd freetype-2.6.5

#sed -i 's/FONT_MODULES += type1//' modules.cfg
sed -i 's/FONT_MODULES += cff//' modules.cfg
sed -i 's/FONT_MODULES += cid//' modules.cfg
sed -i 's/FONT_MODULES += pfr//' modules.cfg
sed -i 's/FONT_MODULES += type42//' modules.cfg
sed -i 's/FONT_MODULES += winfonts//' modules.cfg
sed -i 's/FONT_MODULES += pcf//' modules.cfg
sed -i 's/FONT_MODULES += bdf//' modules.cfg
sed -i 's/AUX_MODULES += cache//' modules.cfg
sed -i 's/AUX_MODULES += lzw//' modules.cfg
sed -i 's/AUX_MODULES += bzip2//' modules.cfg
#sed -i 's/AUX_MODULES += psaux//' modules.cfg
#sed -i 's/AUX_MODULES += psnames//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftbbox.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftbdf.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftcid.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftfntfmt.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftfstype.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftgasp.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftgxval.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftlcdfil.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftmm.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftotval.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftpatent.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftpfr.c//' modules.cfg
#sed -i 's/BASE_EXTENSIONS += fttype1.c//' modules.cfg
sed -i 's/BASE_EXTENSIONS += ftwinfnt.c//' modules.cfg

sed -i 's/$(APINAMES_EXE): $(APINAMES_SRC)//' builds/exports.mk
sed -i 's/$(CCexe) $(CCexe_CFLAGS) $(TE)$@ $< $(CCexe_LDFLAGS)//' builds/exports.mk
sed -i 's/APINAMES_SRC := $(subst \/,$(SEP),$(TOP_DIR)\/src\/tools\/apinames.c)//' builds/exports.mk
sed -i 's/APINAMES_EXE := $(subst \/,$(SEP),$(OBJ_DIR)\/apinames$(E_BUILD))//' builds/exports.mk

patch -p1 < ../freetype.patch

#emmake make clean
emconfigure ./configure CFLAGS="-O3" --prefix=$(pwd)/../dist --host=x86-none-linux --build=x86_64 
emmake make
emmake make install
cd ..

#cd fontconfig-2.12.1
#FREETYPE_CFLAGS="-I$(pwd)/../dist/include/freetype2" \
#FREETYPE_LIBS=" " \
#EXPAT_CFLAGS="-I$(pwd)/../dist/include" \
#EXPAT_LIBS=" " \
#emconfigure ./configure CFLAGS="-O3" --prefix=$(pwd)/../dist --with-expat-includes=$(pwd)/../dist/include --with-expat-lib=$(pwd)/../dist/lib --with-default-fonts=/fonts --with-cache-dir=/cache --with-baseconfigdir=/ --host=x86-none-linux --build=x86_64 
#sed -i 's|#define HAVE_LINK 1|// #define HAVE_LINK 1|' config.h
#patch -p1 < ../fontconfig.patch
#emmake make
#emmake make install
#cd ..

cd harfbuzz-1.3.0
emmake make clean

FREETYPE_LIBS=" " \
FREETYPE_CFLAGS="-I$(pwd)/../dist/include/freetype2" \
CFLAGS="-O3" \
CXXFLAGS="-O3" \
emconfigure ./configure --prefix=$(pwd)/../dist --with-freetype=yes --host=x86-none-linux --build=x86_64

emmake make
emmake make install
cd ..

cd libass-master

./autogen.sh
emmake make clean

#FONTCONFIG_CFLAGS="-I$(pwd)/../dist/include"
#FONTCONFIG_LIBS=" "
FREETYPE_CFLAGS="-I$(pwd)/../dist/include/freetype2" \
FREETYPE_LIBS=" " \
FRIBIDI_CFLAGS="-I$(pwd)/../dist/include/fribidi" \
FRIBIDI_LIBS=" " \
HARFBUZZ_CFLAGS="-I$(pwd)/../dist/include/harfbuzz" \
HARFBUZZ_LIBS=" " \
emconfigure ./configure CFLAGS="-O3" --prefix=$(pwd)/../dist --host=x86-none-linux --build=x86_64 --disable-require-system-font-provider

emmake make
emmake make install
cd ..

