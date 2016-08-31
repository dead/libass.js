# libass.js
This is a port of libass to javascript using Emscripten.

## Performance
I think it perform really well, of course not as the native libass.
The memory consumption is a little high, but is stable (consuming around 300mb in Chrome).
Take a look at the examples and draw your own conclusion.

## Examples
Those examples are a modification of the [videojs-ass](https://github.com/SunnyLi/videojs-ass) example to run using the libass.js

### [videojs.libass.js](http://dead.github.io/libass.js/example-videojs/test.html)
This example use multiple canvas to render the subtitles. The resizing is not working correctly.
Because it need allocate a buffer and a canvas for every subtitle sometimes the browser can throw an allocation error.

### [videojs.libass-onecanvas.js](http://dead.github.io/libass.js/example-videojs/test-onecanvas.html)
This example use only one canvas to render the subtitles. So it will probably use less memory than the previous example.

Both examples perform almost the same in my computer and phone.

## Want to build it yourself?
I recommend using this docker image: https://github.com/apiaryio/emscripten-docker

To run the `build.sh` and `libass.sh` you will need install emscripten and the following packages:
`apt-get install wget libtool automake autoconf pkg-config patch bzip unzip`

## TODO
* Remove jquery dependency
* Remove video.js dependency
* Remove libjass clock dependency
* Remove long.js dependency
* Create a proper libass wrapper
* Cache next frames to improve performance?
* Use javascript SIMD to blend the bitmaps?
* Improve the build scripts
* Benchmarking ?
* Documentation

## Thanks
* Arnavion for the libjass https://github.com/Arnavion/libjass
* Emscripten https://github.com/kripken/emscripten
* SunnyLi for the videojs-ass https://github.com/SunnyLi/videojs-ass
* libass https://github.com/libass/libass