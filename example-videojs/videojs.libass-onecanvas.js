(function (videojs) {
	'use strict';
	
	var libassjs = function (options) {
		var player = this,
			overlay = document.createElement('div'),
			OverlayComponent = null,
			canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			lib = null,
			render = null,
			track = null,
			clock = null;
		
		if (!options.src) {
            return;
        }
		
		lib = ass_library_init();
        render = ass_renderer_init(lib);
		
		overlay.className = 'libassjs';
        OverlayComponent = {
            name: function () {
                return 'AssOverlay'
            },
            el: function () {
                return overlay;
            }
        };
		
		player.addChild(OverlayComponent);
		
		function getCurrentTime() {
            return player.currentTime();
        }
		
		function getVideoWidth() {
            return parseInt(getComputedStyle(player.el()).width, 10);
        }
		
		function getVideoHeight() {
            return parseInt(getComputedStyle(player.el()).height, 10);
        }
		
		function loadFromUrl(url, responseType='arraybuffer') {
			return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = responseType;

                xhr.onload = function(e) {
                    var responseArray = new Uint8Array(this.response);
                    resolve(responseArray);
                };
				
                xhr.send();
            });
		}
		
		function loadFont(url, fontName) {
            var fn = url.substring(url.lastIndexOf('/')+1);
			
			return loadFromUrl(url).then(function (responseArray) {
				console.log('Font ' + fn + ' loaded');
                ass_add_font(lib, fontName, responseArray, responseArray.length);
			});
        }
		
		function loadFontsAndScript(fontsUrl, scriptUrl) {
			return new Promise(function (resolve, reject) {
				var fonts = [loadFont('LiberationSans-Bold.ttf', 'Liberation Sans Bold')];
				for (var i in fontsUrl) {
					fonts.push(loadFont(fontsUrl[i][0], fontsUrl[i][1]));
				}
				
				Promise.all(fonts).then(function () {
					ass_set_fonts(render, '', 'Liberation Sans Bold', 0, null, 0);
					
					loadFromUrl(scriptUrl).then(function (responseArray) {
						console.log('Script ' + scriptUrl + ' loaded');
						track = ass_read_memory(lib, responseArray, responseArray.length, null);
						resolve();
					});
				});
			});
		}
		
		function updateDisplayArea() {
			setTimeout(function () {
				var scaleX = getVideoWidth() / canvas.width;
				var scaleY = getVideoHeight() / canvas.height;
				var scaleToFit = Math.min(scaleX, scaleY);
				
				canvas.style.transformOrigin = '0 0';
                canvas.style.transform = 'scale(' + scaleToFit + ')';
                canvas.style.top = ((getVideoHeight() - (canvas.height * scaleToFit)) / 2) + 'px';
				canvas.style.left = ((getVideoWidth() - (canvas.width * scaleToFit)) / 2) + 'px';
				canvas.style.imageRendering = 'crisp-edges';
			}, 100);
		}
		
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
                a = (color & 0xFF);
            
            var src_pos = 0;
            var dst_pos = (dst_y * dst_w * 4) + (dst_x * 4);
            
			// from https://github.com/videolan/vlc/blob/master/modules/codec/libass.c#L685
            for (var y = 0; y < h; ++y) {
                for (var x = 0; x < w; ++x) {
					var alpha = Module.HEAPU8[bitmap_ptr + src_pos + x];
                    var an = (255 - a) * alpha / 255;
					var ao = dst[dst_pos + 3];
					
					if (ao == 0) {
						dst[dst_pos] = r;
						dst[dst_pos + 1] = g;
						dst[dst_pos + 2] = b;
						dst[dst_pos + 3] = an;
					}
					else {
						dst[dst_pos + 3] = 255 - (255 - dst[dst_pos + 3]) * (255 - an) / 255;
						
						if (dst[dst_pos + 3] != 0) {
							dst[dst_pos]     = (dst[dst_pos] * ao * (255 - an) / 255 + r * an) / dst[dst_pos + 3];
							dst[dst_pos + 1] = (dst[dst_pos + 1] * ao * (255 - an) / 255 + g * an) / dst[dst_pos + 3];
							dst[dst_pos + 2] = (dst[dst_pos + 2] * ao * (255 - an) / 255 + b * an) / dst[dst_pos + 3];
						}
					}
					
                    dst_pos += 4;
                }
				
                dst_pos += ((dst_w - x) * 4);
                src_pos += stride;
            }
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
		
		function overlap(x1, y1, w1, h1, x2, y2, w2, h2) {
			var x_overlap = Math.max(0, Math.min(x1+w1, x2+w2) - Math.max(x1, x2));
			var y_overlap = Math.max(0, Math.min(y1+h1, y2+h2) - Math.max(y1, y2));
			return x_overlap != 0 || y_overlap != 0;
		}
		
		function inside(x1, y1, w1, h1, x2, y2, w2, h2) {
			if (x1 > x2 && x1+w1 < x2+w2 && y1 > y2 && y1+h1 < y2+h2) {
				return true;
			}
			return false;
		}
		
		var clear = [];
        var lastTime = 0;
        var dst = null;
		var changed = Module._malloc(4);
		
		function onClockTick() {
			if (!track) {
				return;
			}
			
			if (!dst) {
				dst = new Uint8ClampedArray(canvas.width * canvas.height * 4);
			}
			
            var currentTime = clock.currentTime;
            
            if (lastTime > currentTime) {
                return;
            }
            
            var width = canvas.width;
            var height = canvas.height;
            
            lastTime = currentTime;
            var returnRenderFrame = ass_render_frame(render, track, parseInt(currentTime * 1000), 0, changed);
            
            if (Module.HEAPU8[changed] != 0) {
                while(clear.length > 0) {
                    var c = clear.shift();
                    var i = false;
                    
                    for (var j in clear) {
                        var c2 = clear[j];
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
                        if (!img.w || !img.h) {
                            img = new ASS_Image(img.next);
                            continue;
                        }
                        
                        blend(dst, img, width, height);
                        clear.push([img.dst_x, img.dst_y, img.w, img.h]);
                        img = new ASS_Image(img.next);
                    }
                }
                
                ctx.putImageData(new ImageData(dst, width, height), 0, 0);
            }
        }
		
		loadFontsAndScript(options.fonts, options.src).then(function () {
			if (options.onFontsAndScriptLoaded) {
				options.onFontsAndScriptLoaded();
			}
		});
		
		clock = new libjass.renderers.AutoClock(getCurrentTime, 500);
		clock.addEventListener(libjass.renderers.ClockEvent.Tick, onClockTick);
		
		player.on('play', function () {
			clock.play();
		});
		
		player.on('pause', function () {
			clock.pause();
        });
		
		player.on('seeking', function () {
			lastTime = 0;
			clock.seeking();
        });
		
		player.on('ratechange', function () {
			clock.setRate(player.playbackRate());
		});
		
		player.on('loadedmetadata', updateDisplayArea);
        player.on('resize', updateDisplayArea);
        player.on('fullscreenchange', updateDisplayArea);
		
		player.on('dispose', function () {
			clock.disable();
			dst = null;
			lastTime = 0;
        });
        
        player.ready(function () {
            ass_set_frame_size(render, getVideoWidth(), getVideoHeight());
			console.log(getVideoWidth() + 'x' + getVideoHeight());
			
			canvas.width = getVideoWidth();
			canvas.height = getVideoHeight();
			canvas.style.position = 'absolute';
			overlay.appendChild(canvas);
        });
	}
	
	videojs.plugin('ass', libassjs);
}(window.videojs));