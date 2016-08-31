rm -rf sdl.html sdl.js
emcc -O3 \
--memory-init-file 0 \
-s USE_SDL=2 \
-s USE_SDL_IMAGE=2 \
-s TOTAL_MEMORY=67108864 \
test_sdl.c \
-I../build/dist/include \
../build/dist/lib/libass.so \
../build/dist/lib/libfreetype.so \
../build/dist/lib/libfribidi.so \
../build/dist/lib/libexpat.so \
--embed-file sub.ass@in.ass \
--embed-file font.ttf@font.ttf \
-o sdl.html
