(function (videojs, libjass) {
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
			clock = null,
			AssButton = null,
			AssButtonInstance = null,
			OverlayComponent = null,
			VjsButton = null;
		
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
				console.log(getVideoWidth() + 'x' + getVideoHeight());
				ass_set_frame_size(render, getVideoWidth(), getVideoHeight());
				
				while (overlay.childNodes.length > 0) {
                    overlay.removeChild(overlay.firstChild);
                }
			}, 100);
		}
		
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
		var changed = Module._malloc(4);
		
		function onClockTick() {
			if (!track) {
				return;
			}
			
            var currentTime = clock.currentTime;
            
            if (lastTime > currentTime) {
                return;
            }
            
            lastTime = currentTime;
            var returnRenderFrame = ass_render_frame(render, track, parseInt(currentTime * 1000), 0, changed);
            
            if (Module.HEAPU8[changed] != 0) {
				var draws = 0;
				
                if(returnRenderFrame != 0) {
                    var img = new ASS_Image(returnRenderFrame);
                    
                    while (img.valid) {
                        if (!img.w || !img.h) {
                            img = new ASS_Image(img.next);
                            continue;
                        }
						
						var canvas = overlay.childNodes[draws];
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
						
                        img = new ASS_Image(img.next);
						draws += 1;
                    }
                }
                
                while (overlay.childNodes.length > draws) {
                    var c = overlay.lastChild;
                    overlay.removeChild(c);
                }
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
			lastTime = 0;
        });
        
		    // Visibility Toggle Button
    if (!options.hasOwnProperty('button') || options.button) {
      VjsButton = videojs.getComponent('Button');
      AssButton = videojs.extend(VjsButton, {
        constructor: function (player, options) {
          options.name = options.name || 'assToggleButton';
          VjsButton.call(this, player, options);
		  this.controlText('Subtitle ASS');
        },
        buildCSSClass: function () {
          var classes = VjsButton.prototype.buildCSSClass.call(this);
          return 'vjs-subtitles-button ' + classes;
        },
        handleClick: function () {
          if (!this.hasClass('inactive')) {
            this.addClass('inactive');
            overlay.style.visibility = "hidden";
          } else {
            this.removeClass('inactive');
            overlay.style.visibility = "visible";
          }
        }
      });

      player.ready(function () {
            ass_set_frame_size(render, getVideoWidth(), getVideoHeight());
			console.log(getVideoWidth() + 'x' + getVideoHeight());
        AssButtonInstance = new AssButton(player, options);
        player.controlBar.addChild(AssButtonInstance);
        player.controlBar.el().insertBefore(
          AssButtonInstance.el(),
          player.controlBar.getChild('customControlSpacer').el().nextSibling
        );
      });
    }
  }
	
	videojs.plugin('ass', libassjs);
}(window.videojs, window.libjass));
