emcc -O3 \
--memory-init-file 0 \
-s EXPORTED_FUNCTIONS=@build/libass.sym \
-s INVOKE_RUN=0 \
-s NO_EXIT_RUNTIME=1 \
-s TOTAL_MEMORY=134217728 \
build/dist/lib/libass.a \
build/dist/lib/libfreetype.a \
build/dist/lib/libexpat.a \
build/dist/lib/libfribidi.a \
--post-js build/api.js \
-o libass.js
