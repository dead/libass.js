rm -rf test.js test.js.mem test.png
emcc -O3 -s USE_LIBPNG=1 -s USE_ZLIB=1 \
--memory-init-file 0 \
-I../build/dist/include/ass \
../build/dist/lib/libfreetype.so \
../build/dist/lib/libfribidi.so \
../build/dist/lib/libexpat.so \
../build/dist/lib/libass.so \
--pre-js pre.js \
test.c \
-o test.js
nodejs test.js working/test.png working/sub.ass 1
