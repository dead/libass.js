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
        console.log(getVideoWidth() + "x" + getVideoHeight());
        
        function loadFont(url, fontName) {
            var fn = url.substring(url.lastIndexOf('/')+1);
            console.log(fn);
            
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

        function blend(ctx, img) {
            var w = img.w,
                h = img.h,
                color = img.color,
                bitmap_ptr = img.bitmap,
                stride = img.stride,
                dst_x = img.dst_x,
                dst_y = img.dst_y;
            
            var dst = new Uint8ClampedArray(4 * w * h);
            
            var r = (color >> 24) & 0xFF,
                g = (color >> 16) & 0xFF,
                b = (color >> 8) & 0xFF,
                a = 255 - (color & 0xFF);
            
            var src_pos = 0;
            var dst_pos = 0;
            
            for (var y = 0; y < h; ++y) {
                for (var x = 0; x < w; ++x) {
                    var k = Module.HEAPU8[bitmap_ptr + src_pos + x] * a / 255;
                    dst[dst_pos]     = r;
                    dst[dst_pos + 1] = g;
                    dst[dst_pos + 2] = b;
                    dst[dst_pos + 3] = k;
                    dst_pos += 4;
                }
                src_pos += stride;
            }
            
            ctx.putImageData(new ImageData(dst, w, h), 0, 0);
        }
        
        var lastTime = 0;

        function onClockTick() {
            var currentTime = clock.currentTime;
            
            if (lastTime > currentTime) {
                return;
            }
            
            lastTime = currentTime;
            
            var currentTimeLong = dcodeIO.Long.fromInt(parseInt(clock.currentTime*1000));
            
            var returnRenderFrame = ass_render_frame(render, track, currentTimeLong.low, currentTimeLong.high, changed);

            if (changed != 0) {
                var draws = 0;
                
                if (returnRenderFrame != 0) {
                    var img = new ASS_Image(returnRenderFrame);
                    
                    while (img.valid) {
                        var canvas = overlay.childNodes[draws];
                        
                        if (!img.w || !img.h) {
                            img = new ASS_Image(img.next);
                            continue;
                        }
                        
                        if (!canvas) {
                            canvas = document.createElement('canvas');
                            overlay.appendChild(canvas);
                        }
                        
                        canvas.width = img.w;
                        canvas.height = img.h;
                        canvas.style.position = 'absolute';
                        canvas.style.left = img.dst_x + 'px';
                        canvas.style.top = img.dst_y + 'px';
                        
                        var ctx = canvas.getContext('2d');
                        blend(ctx, img);
                        
                        draws += 1;
                        
                        img = new ASS_Image(img.next);
                    }
                }
                
                while (overlay.childNodes.length > draws) {
                    var c = overlay.lastChild;
                    overlay.removeChild(c);
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
                console.log(getVideoWidth(), getVideoHeight())
                ass_set_frame_size(render, getVideoWidth(), getVideoHeight());
                
                while (overlay.childNodes.length > 0) {
                    overlay.removeChild(overlay.firstChild);
                }
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
