(function (videojs, libjass) {
    'use strict';
    
    var vjs_ass = function (options) {
        var overlay = document.createElement('div'),
            player  = this,
            clock   = null,
            lib     = null,
            render  = null,
            track   = null,
            clockRate = options.rate || 1,
            delay   = options.delay || 0,
            OverlayComponent = null,
            ready   = false;
        
        if (!options.src) {
            return;
        }
        
        lib = ass_library_init();
        render = ass_renderer_init(lib);
        
        function getVideoWidth() {
            return options.videoWidth || player.videoWidth() || player.el().offsetWidth;
        }
        
        function getVideoHeight() {
            return options.videoHeight || player.videoHeight() || player.el().offsetHeight
        }
        
        ass_set_frame_size(render, getVideoWidth(), getVideoHeight());
        console.log(getVideoWidth() + 'x' + getVideoHeight());
        
        function loadFont(url, fontName) {
            var fn = url.substring(url.lastIndexOf('/')+1);
            
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'arraybuffer';

                xhr.onload = function(e) {
                    var responseArray = new Uint8Array(this.response);
                    console.log('Font ' + fn + ' loaded');
                    ass_add_font(lib, fontName, responseArray, responseArray.length);
                    resolve();
                };

                xhr.send();
            });
        }
        
        var fonts = [loadFont('LiberationSans-Bold.ttf', 'Liberation Sans Bold')];
        
        if (options.fonts) {
            for (var i in options.fonts) {
                fonts.push(loadFont(options.fonts[i][0], options.fonts[i][1]));
            }
        }
            
        Promise.all(fonts).then(function () {
            ass_set_fonts(render, '', 'Liberation Sans Bold', 0, null, 0);
            if (options.fonts_id) {
                $('#'+options.fonts_id).hide();
            }
        });
        
        $.get( options.src, function(data) {
            track = ass_read_memory(lib, data, data.length+1, null);
        });
        
        overlay.className = 'vjs-ass';
        
        OverlayComponent = {
            name: function () {
                return 'AssOverlay'
            },
            el: function () {
                return overlay;
            }
        };

        function getCurrentTime() {
            return player.currentTime() - delay;
        }
        
        clock = new libjass.renderers.AutoClock(getCurrentTime, 500);
        var changed = Module._malloc(4);
        
        function blend(dst, img, dst_w, dst_h) {
            var w = img.w,
                h = img.h,
                color = img.color,
                bitmap_ptr = img.bitmap,
                stride = img.stride,
                dst_x = img.dst_x,
                dst_y = img.dst_y;
            
            if (!w || !h)
                return;
            
            var r = (color >> 24) & 0xFF,
                g = (color >> 16) & 0xFF,
                b = (color >> 8) & 0xFF,
                a = 255 - (color & 0xFF);
            
            var src_pos = 0;
            var dst_pos = (dst_y * dst_w * 4) + (dst_x * 4);
            
            for (var y = 0; y < h; ++y) {
                for (var x = 0; x < w; ++x) {
                    var k = Module.HEAPU8[bitmap_ptr + src_pos + x] * a / 255;
                    dst[dst_pos]     = (k * r + (255 - k) * dst[dst_pos]) / 255;
                    dst[dst_pos + 1] = (k * g + (255 - k) * dst[dst_pos + 1]) / 255;
                    dst[dst_pos + 2] = (k * b + (255 - k) * dst[dst_pos + 2]) / 255;
                    dst[dst_pos + 3] = (k * 255 + (255 - k) * dst[dst_pos + 3]) / 255;
                    dst_pos += 4;
                }
                dst_pos += ((dst_w - x) * 4);
                src_pos += stride;
            }
        }
        
        function inside(x1, y1, w1, h1, x2, y2, w2, h2) {
            if (x1 <= x2 && y1 <= y2 && h1 >= h2 && w1 >= w2) {
                return true;
            }
            return false;
        }
        
        function clearRect(dst, dst_x, dst_y, w, h, dst_w, dst_h) {
            var dst_pos = (dst_y * dst_w * 4) + (dst_x * 4);
            
            for (var y = 0; y < h; ++y) {
                for (var x = 0; x < w; ++x) {
                    dst[dst_pos] = 0;
                    dst[dst_pos + 1] = 0;
                    dst[dst_pos + 2] = 0;
                    dst[dst_pos + 3] = 0;
                    dst_pos += 4;
                }
                dst_pos += ((dst_w - x) * 4);
            }
        }
        
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = getVideoWidth();
        canvas.height = getVideoHeight();
        canvas.style.position = 'absolute';
        overlay.appendChild(canvas);
        
        var clear = [];
        var lastTime = 0;
        var dst = new Uint8ClampedArray(canvas.width * canvas.height * 4);

        function onClockTick() {
            var currentTime = clock.currentTime;
            
            if (lastTime > currentTime) {
                return;
            }
            
            lastTime = currentTime;
            var currentTimeLong = dcodeIO.Long.fromInt(parseInt(currentTime * 1000));
            var returnRenderFrame = ass_render_frame(render, track, currentTimeLong.low, currentTimeLong.high, changed);
            
            var width = canvas.width;
            var height = canvas.height;

            if (changed != 0) {
                
                //pretty sure that there is better ways to do this.
                while(clear.length > 0) {
                    var c = clear.shift();
                    var i = false;
                    
                    for (var c2 in clear) {
                        if (inside(c[0], c[1], c[2], c[3], c2[0], c2[1], c2[2], c2[3])) {
                            i = true;
                            break;
                        }
                    }
                    
                    if (!i) {
                        clearRect(dst, c[0], c[1], c[2], c[3], width, height);
                    }
                }

                if(returnRenderFrame != 0) {
                    var img = new ASS_Image(returnRenderFrame);
                                        
                    while (img.valid) {
                        blend(dst, img, width, height);
                        
                        clear.push([img.dst_x, img.dst_y, img.w, img.h]);
                        
                        img = new ASS_Image(img.next);
                    }
                    
                    ctx.putImageData(new ImageData(dst, width, height), 0, 0);
                }
            }
        };
        
        clock.addEventListener(libjass.renderers.ClockEvent.Tick, onClockTick);
        
        player.addChild(OverlayComponent);
        
        player.on('play', function () {
            clock.play();
        });
        
        player.on('pause', function () {
            clock.pause();
        });
        
        player.on('seeking', function () {
            clock.seeking();
            lastTime = 0;
        });
        
        function updateClockRate() {
            clock.setRate(player.playbackRate() * clockRate);
        }

        updateClockRate();
        player.on('ratechange', updateClockRate);
        
        function updateDisplayArea() {
            setTimeout(function () {
                console.log(getVideoWidth(), getVideoHeight());

                var scaleX = getVideoWidth() / canvas.width;
                var scaleY = getVideoHeight() / canvas.height;
                
                var scaleToFit = Math.min(scaleX, scaleY);
                
                canvas.style.transformOrigin = '0 0';
                canvas.style.transform = 'scale(' + scaleToFit + ')';
                canvas.style.top = ((getVideoHeight() - (canvas.height * scaleToFit)) / 2) + 'px';

                //ass_set_frame_size(render, getVideoWidth(), getVideoHeight());
                //canvas.width = getVideoWidth();
                //canvas.height = getVideoHeight();
                //dst = new Uint8ClampedArray(canvas.width * canvas.height * 4);
            }, 100);
        }
        
        window.addEventListener('resize', updateDisplayArea);
        player.on('loadedmetadata', updateDisplayArea);
        player.on('resize', updateDisplayArea);
        player.on('fullscreenchange', updateDisplayArea);
        
        player.on('dispose', function () {
            clock.disable();
        });
        
        player.ready(function () {
            
        });
    }
    
    videojs.plugin('ass', vjs_ass);
}(window.videojs, window.libjass));
