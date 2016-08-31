/**
 * \brief Initialize the library.
 * \return library handle or NULL if failed
 *
 * ASS_Library *ass_library_init(void);
 */
ass_library_init = Module.cwrap('ass_library_init', 'number', []);

/**
 * \brief Finalize the library
 * \param priv library handle
 *
 * void ass_library_done(ASS_Library *priv);
 */
ass_library_done = Module.cwrap('ass_library_done', null, ['number']);

/**
 * \brief Return the version of library. This returns the value LIBASS_VERSION
 * was set to when the library was compiled.
 * \return library version
 *
 * int ass_library_version(void);
 */
ass_library_version = Module.cwrap('ass_library_version', 'number', []);

/**
 * \brief Set additional fonts directory.
 * Optional directory that will be scanned for fonts recursively.  The fonts
 * found are used for font lookup.
 * NOTE: A valid font directory is not needed to support embedded fonts.
 *
 * \param priv library handle
 * \param fonts_dir directory with additional fonts
 *
 * void ass_set_fonts_dir(ASS_Library *priv, const char *fonts_dir);
 */
ass_set_fonts_dir  = Module.cwrap('ass_set_fonts_dir', null, ['number', 'string']);

/**
 * \brief Whether fonts should be extracted from track data.
 * \param priv library handle
 * \param extract whether to extract fonts
 * 
 * void ass_set_extract_fonts(ASS_Library *priv, int extract);
 */
ass_set_extract_fonts = Module.cwrap('ass_set_extract_fonts', null, ['number', 'number']);

/**
 * \brief Register style overrides with a library instance.
 * The overrides should have the form [Style.]Param=Value, e.g.
 *   SomeStyle.Font=Arial
 *   ScaledBorderAndShadow=yes
 *
 * \param priv library handle
 * \param list NULL-terminated list of strings
 *
 * void ass_set_style_overrides(ASS_Library *priv, char **list);
 */
ass_set_style_overrides = Module.cwrap('ass_set_style_overrides', null, ['number', 'number']);

/**
 * \brief Initialize the renderer.
 * \param priv library handle
 * \return renderer handle or NULL if failed
 *
 * ASS_Renderer *ass_renderer_init(ASS_Library *);
 */
ass_renderer_init = Module.cwrap('ass_renderer_init', 'number', ['number']);

/**
 * \brief Finalize the renderer.
 * \param priv renderer handle
 *
 * void ass_renderer_done(ASS_Renderer *priv);
 */
ass_renderer_done = Module.cwrap('ass_renderer_done', null, ['number']);

/**
 * \brief Set the frame size in pixels, including margins.
 * The renderer will never return images that are outside of the frame area.
 * The value set with this function can influence the pixel aspect ratio used
 * for rendering. If the frame size doesn't equal to the video size, you may
 * have to use ass_set_pixel_aspect().
 * @see ass_set_pixel_aspect()
 * @see ass_set_margins()
 * \param priv renderer handle
 * \param w width
 * \param h height
 *
 * void ass_set_frame_size(ASS_Renderer *priv, int w, int h);
 */
ass_set_frame_size = Module.cwrap('ass_set_frame_size', null, ['number', 'number', 'number']);

/**
 * \brief Set the source image size in pixels.
 * This is used to calculate the source aspect ratio and the blur scale.
 * The source image size can be reset to default by setting w and h to 0.
 * The value set with this function can influence the pixel aspect ratio used
 * for rendering.
 * @see ass_set_pixel_aspect()
 * \param priv renderer handle
 * \param w width
 * \param h height
 * 
 * void ass_set_storage_size(ASS_Renderer *priv, int w, int h);
 */
ass_set_storage_size = Module.cwrap('ass_set_storage_size', null, ['number', 'number', 'number']);

/**
 * \brief Set frame margins.  These values may be negative if pan-and-scan
 * is used. The margins are in pixels. Each value specifies the distance from
 * the video rectangle to the renderer frame. If a given margin value is
 * positive, there will be free space between renderer frame and video area.
 * If a given margin value is negative, the frame is inside the video, i.e.
 * the video has been cropped.
 *
 * The renderer will try to keep subtitles inside the frame area. If possible,
 * text is layout so that it is inside the cropped area. Subtitle events
 * that can't be moved are cropped against the frame area.
 *
 * ass_set_use_margins() can be used to allow libass to render subtitles into
 * the empty areas if margins are positive, i.e. the video area is smaller than
 * the frame. (Traditionally, this has been used to show subtitles in
 * the bottom "black bar" between video bottom screen border when playing 16:9
 * video on a 4:3 screen.)
 *
 * When using this function, it is recommended to calculate and set your own
 * aspect ratio with ass_set_pixel_aspect(), as the defaults won't make any
 * sense.
 * @see ass_set_pixel_aspect()
 * \param priv renderer handle
 * \param t top margin
 * \param b bottom margin
 * \param l left margin
 * \param r right margin
 *
 * void ass_set_margins(ASS_Renderer *priv, int t, int b, int l, int r);
 */
ass_set_margins = Module.cwrap('ass_set_margins', null, ['number', 'number', 'number', 'number', 'number']);

/**
 * \brief Whether margins should be used for placing regular events.
 * \param priv renderer handle
 * \param use whether to use the margins
 * 
 * void ass_set_use_margins(ASS_Renderer *priv, int use);
 */
ass_set_use_margins = Module.cwrap('ass_set_use_margins', null, ['number', 'number']);

/**
 * \brief Set aspect ratio parameters.
 * This calls ass_set_pixel_aspect(priv, dar / sar).
 * @deprecated New code should use ass_set_pixel_aspect().
 * \param priv renderer handle
 * \param dar display aspect ratio (DAR), prescaled for output PAR
 * \param sar storage aspect ratio (SAR)
 * 
 * void ass_set_aspect_ratio(ASS_Renderer *priv, double dar, double sar);
 */
ass_set_aspect_ratio = Module.cwrap('ass_set_aspect_ratio', null, ['number', 'number', 'number']);

/**
 * \brief Set a fixed font scaling factor.
 * \param priv renderer handle
 * \param font_scale scaling factor, default is 1.0
 *
 * void ass_set_font_scale(ASS_Renderer *priv, double font_scale);
 */
ass_set_font_scale = Module.cwrap('ass_set_font_scale', null, ['number', 'number']);

/**
 * \brief Set font hinting method.
 * \param priv renderer handle
 * \param ht hinting method
 *
 * void ass_set_hinting(ASS_Renderer *priv, ASS_Hinting ht);
 */
ass_set_hinting = Module.cwrap('ass_set_hinting', null, ['number', 'number']);

/**
 * \brief Set line spacing. Will not be scaled with frame size.
 * \param priv renderer handle
 * \param line_spacing line spacing in pixels
 *
 * void ass_set_line_spacing(ASS_Renderer *priv, double line_spacing);
 */
ass_set_line_spacing = Module.cwrap('ass_set_line_spacing', null, ['number', 'number']);

/**
 * \brief Get the list of available font providers. The output array
 * is allocated with malloc and can be released with free(). If an
 * allocation error occurs, size is set to (size_t)-1.
 * \param priv library handle
 * \param providers output, list of default providers (malloc'ed array)
 * \param size output, number of providers
 * \return list of available font providers (user owns the returned array)
 *
 * void ass_get_available_font_providers(ASS_Library *priv,
 *                                       ASS_DefaultFontProvider **providers,
 *                                       size_t *size);
 */
ass_get_available_font_providers = Module.cwrap('ass_get_available_font_providers', null, ['number', 'number', 'number']);

/**
 * \brief Set additional fonts directory.
 * Optional directory that will be scanned for fonts recursively.  The fonts
 * found are used for font lookup.
 * NOTE: A valid font directory is not needed to support embedded fonts.
 *
 * \param priv library handle
 * \param fonts_dir directory with additional fonts
 *
 * void ass_set_fonts(ASS_Renderer *priv, const char *default_font,
 *                    const char *default_family, int dfp,
 *                    const char *config, int update);
 */
ass_set_fonts = Module.cwrap('ass_set_fonts', null, ['number', 'string', 'string', 'number', 'string', 'number']);

/**
 * \brief Render a frame, producing a list of ASS_Image.
 * \param priv renderer handle
 * \param track subtitle track
 * \param now video timestamp in milliseconds
 * \param detect_change compare to the previous call and set to 1
 * if positions changed, or set to 2 if content changed.
 * 
 * ASS_Image *ass_render_frame(ASS_Renderer *priv, ASS_Track *track,
 *                             long long now, int *detect_change)
 */
ass_render_frame = Module.cwrap('ass_render_frame', 'number', ['number', 'number', 'number', 'number', 'number']);

/**
 * \brief Allocate a new empty track object.
 * \param library handle
 * \return pointer to empty track
 *
 * ASS_Track *ass_new_track(ASS_Library *);
 */
ass_new_track = Module.cwrap('ass_new_track', 'number', ['number']);

/**
 * \brief Deallocate track and all its child objects (styles and events).
 * \param track track to deallocate
 *
 * void ass_free_track(ASS_Track *track);
 */
ass_free_track = Module.cwrap('ass_free_track', null, ['number']);

/**
 * \brief Allocate new style.
 * \param track track
 * \return newly allocated style id
 * 
 * int ass_alloc_style(ASS_Track *track);
 */
ass_alloc_style = Module.cwrap('ass_alloc_style', 'number', ['number']);

/**
 * \brief Allocate new event.
 * \param track track
 * \return newly allocated event id
 *
 * int ass_alloc_event(ASS_Track *track);
 */
ass_alloc_event = Module.cwrap('ass_alloc_event', 'number', ['number']);

/**
 * \brief Delete a style.
 * \param track track
 * \param sid style id
 * Deallocates style data. Does not modify track->n_styles.
 *
 * void ass_free_style(ASS_Track *track, int sid);
 */
ass_free_style = Module.cwrap('ass_free_style', null, ['number', 'number']);

/**
 * \brief Delete an event.
 * \param track track
 * \param eid event id
 * Deallocates event data. Does not modify track->n_events.
 *
 * void ass_free_event(ASS_Track *track, int eid);
 */
ass_free_event = Module.cwrap('ass_free_event', null, ['number', 'number']);

/**
 * \brief Parse a chunk of subtitle stream data.
 * \param track track
 * \param data string to parse
 * \param size length of data
 *
 * void ass_process_data(ASS_Track *track, char *data, int size);
 */
ass_process_data = Module.cwrap('ass_process_data', null, ['number', 'number', 'number']);

/**
 * \brief Parse Codec Private section of the subtitle stream, in Matroska
 * format.  See the Matroska specification for details.
 * \param track target track
 * \param data string to parse
 * \param size length of data
 *
 * void ass_process_codec_private(ASS_Track *track, char *data, int size);
 */
ass_process_codec_private = Module.cwrap('ass_process_codec_private', null, ['number', 'number', 'number']);

/**
 * \brief Parse a chunk of subtitle stream data. A chunk contains exactly one
 * event in Matroska format.  See the Matroska specification for details.
 * In later libass versions (since LIBASS_VERSION==0x01300001), using this
 * function means you agree not to modify events manually, or using other
 * functions manipulating the event list like ass_process_data(). If you do
 * anyway, the internal duplicate checking might break. Calling
 * ass_flush_events() is still allowed.
 * \param track track
 * \param data string to parse
 * \param size length of data
 * \param timecode starting time of the event (milliseconds)
 * \param duration duration of the event (milliseconds)
 *
 * void ass_process_chunk(ASS_Track *track, char *data, int size,
 *                        long long timecode, long long duration);
 */
ass_process_chunk = Module.cwrap('ass_process_chunk', null, ['number', 'string', 'number', 'number', 'number']);

/**
 * \brief Read subtitles from file.
 * \param library library handle
 * \param fname file name
 * \param codepage encoding (iconv format)
 * \return newly allocated track
 *
 * ASS_Track *ass_read_file(ASS_Library *library, char *fname,
 *                          char *codepage);
*/
ass_read_file = Module.cwrap('ass_read_file', 'number', ['number', 'string', 'string']);

/**
 * \brief Read subtitles from memory.
 * \param library library handle
 * \param buf pointer to subtitles text
 * \param bufsize size of buffer
 * \param codepage encoding (iconv format)
 * \return newly allocated track
 * 
 * ASS_Track *ass_read_memory(ASS_Library *library, char *buf,
 *                            size_t bufsize, char *codepage);
*/
ass_read_memory = Module.cwrap('ass_read_memory', 'number', ['number', 'string', 'number', 'string']);

/**
 * \brief Read styles from file into already initialized track.
 * \param fname file name
 * \param codepage encoding (iconv format)
 * \return 0 on success
 *
 * int ass_read_styles(ASS_Track *track, char *fname, char *codepage);
 */
ass_read_styles = Module.cwrap('ass_read_styles', 'number', ['number', 'string', 'string']);

/**
 * \brief Add a memory font.
 * \param library library handle
 * \param name attachment name
 * \param data binary font data
 * \param data_size data size
 *
 * void ass_add_font(ASS_Library *library, char *name, char *data,
 *                   int data_size);
*/
ass_add_font = Module.cwrap('ass_add_font', null, ['number', 'string', 'array', 'number']);

/**
 * \brief Remove all fonts stored in an ass_library object.
 * \param library library handle
 *
 * void ass_clear_fonts(ASS_Library *library);
 */
ass_clear_fonts = Module.cwrap('ass_clear_fonts', null, ['number']);

/**
 * \brief Calculates timeshift from now to the start of some other subtitle
 * event, depending on movement parameter.
 * \param track subtitle track
 * \param now current time in milliseconds
 * \param movement how many events to skip from the one currently displayed
 * +2 means "the one after the next", -1 means "previous"
 * \return timeshift in milliseconds
 *
 * long long ass_step_sub(ASS_Track *track, long long now, int movement);
 */
ass_step_sub = Module.cwrap('ass_step_sub', 'number', ['number', 'number', 'number', 'number']);

/**
 * \brief Explicitly process style overrides for a track.
 * \param track track handle
 * 
 * void ass_process_force_style(ASS_Track *track);
 */
ass_process_force_style = Module.cwrap('ass_process_force_style', null, ['number']);

/**
 * \brief Register a callback for debug/info messages.
 * If a callback is registered, it is called for every message emitted by
 * libass.  The callback receives a format string and a list of arguments,
 * to be used for the printf family of functions. Additionally, a log level
 * from 0 (FATAL errors) to 7 (verbose DEBUG) is passed.  Usually, level 5
 * should be used by applications.
 * If no callback is set, all messages level < 5 are printed to stderr,
 * prefixed with [ass].
 *
 * \param priv library handle
 * \param msg_cb pointer to callback function
 * \param data additional data, will be passed to callback
 *
 * void ass_set_message_cb(ASS_Library *priv, void (*msg_cb)
 *                        (int level, const char *fmt, va_list args, void *data),
 *                        void *data);
 */
//ass_set_message_cb = Module.cwrap('ass_set_message_cb', null, ['number', 'number', 'number', 'number']);

/**
 * \brief This is a stub and does nothing. Old documentation: Update/build font
 * cache.  This needs to be called if it was disabled when ass_set_fonts was set.
 *
 * \param priv renderer handle
 * \return success
 *
 * int ass_fonts_update(ASS_Renderer *priv);
 */
ass_fonts_update = Module.cwrap('ass_fonts_update', 'number', ['number']);

/**
 * \brief Set hard cache limits.  Do not set, or set to zero, for reasonable
 * defaults.
 *
 * \param priv renderer handle
 * \param glyph_max maximum number of cached glyphs
 * \param bitmap_max_size maximum bitmap cache size (in MB)
 *
 * void ass_set_cache_limits(ASS_Renderer *priv, int glyph_max,
 *                           int bitmap_max_size);
 */
ass_set_cache_limits = Module.cwrap('ass_set_cache_limits', null, ['number', 'number', 'number']);

/**
 * \brief Parse a chunk of subtitle stream data. A chunk contains exactly one
 * event in Matroska format.  See the Matroska specification for details.
 * In later libass versions (since LIBASS_VERSION==0x01300001), using this
 * function means you agree not to modify events manually, or using other
 * functions manipulating the event list like ass_process_data(). If you do
 * anyway, the internal duplicate checking might break. Calling
 * ass_flush_events() is still allowed.
 * \param track track
 * \param data string to parse
 * \param size length of data
 * \param timecode starting time of the event (milliseconds)
 * \param duration duration of the event (milliseconds)
 * 
 * void ass_process_chunk(ASS_Track *track, char *data, int size,
 *                        long long timecode, long long duration);
 */
ass_flush_events = Module.cwrap('ass_flush_events', null, ['number', 'string', 'number', 'number', 'number']);

/**
 * \brief Set shaping level. This is merely a hint, the renderer will use
 * whatever is available if the request cannot be fulfilled.
 * \param level shaping level
 *
 * void ass_set_shaper(ASS_Renderer *priv, ASS_ShapingLevel level);
 */
ass_set_shaper = Module.cwrap('ass_set_shaper', null, ['number', 'number']);

/**
 * \brief Set vertical line position.
 * \param priv renderer handle
 * \param line_position vertical line position of subtitles in percent
 * (0-100: 0 = on the bottom (default), 100 = on top)
 *
 * void ass_set_line_position(ASS_Renderer *priv, double line_position);
 */
ass_set_line_position = Module.cwrap('ass_set_line_position', null, ['number', 'number']);

/**
 * \brief Set the frame size in pixels, including margins.
 * The renderer will never return images that are outside of the frame area.
 * The value set with this function can influence the pixel aspect ratio used
 * for rendering. If the frame size doesn't equal to the video size, you may
 * have to use ass_set_pixel_aspect().
 * @see ass_set_pixel_aspect()
 * @see ass_set_margins()
 * \param priv renderer handle
 * \param w width
 * \param h height
 *
 * void ass_set_frame_size(ASS_Renderer *priv, int w, int h);
 */
ass_set_pixel_aspect = Module.cwrap('ass_set_pixel_aspect', null, ['number', 'number', 'number']);

/**
 * \brief Set selective style override mode.
 * If enabled, the renderer attempts to override the ASS script's styling of
 * normal subtitles, without affecting explicitly positioned text. If an event
 * looks like a normal subtitle, parts of the font style are copied from the
 * user style set with ass_set_selective_style_override().
 * Warning: the heuristic used for deciding when to override the style is rather
 *          rough, and enabling this option can lead to incorrectly rendered
 *          subtitles. Since the ASS format doesn't have any support for
 *          allowing end-users to customize subtitle styling, this feature can
 *          only be implemented on "best effort" basis, and has to rely on
 *          heuristics that can easily break.
 * \param priv renderer handle
 * \param bits bit mask comprised of ASS_OverrideBits values.
 *
 * void ass_set_selective_style_override_enabled(ASS_Renderer *priv, int bits);
 */
ass_set_selective_style_override_enabled = Module.cwrap('ass_set_selective_style_override_enabled', null, ['number', 'number']);

/**
 * \brief Set style for selective style override.
 * See ass_set_selective_style_override_enabled().
 * \param style style settings to use if override is enabled. Applications
 * should initialize it with {0} before setting fields. Strings will be copied
 * by the function.
 *
 * void ass_set_selective_style_override(ASS_Renderer *priv, ASS_Style *style);
 */
ass_set_selective_style_override = Module.cwrap('ass_set_selective_style_override', null, ['number', 'number']);

/**
 * \brief Set whether the ReadOrder field when processing a packet with
 * ass_process_chunk() should be used for eliminating duplicates.
 * \param check_readorder 0 means do not try to eliminate duplicates; 1 means
 * use the ReadOrder field embedded in the packet as unique identifier, and
 * discard the packet if there was already a packet with the same ReadOrder.
 * Other values are undefined.
 * If this function is not called, the default value is 1.
 *
 * void ass_set_check_readorder(ASS_Track *track, int check_readorder);
 */
ass_set_check_readorder = Module.cwrap('ass_set_check_readorder', null, ['number', 'number']);

function ASS_Image(ptr) {
    this.ptr = ptr;
}

Object.defineProperty(ASS_Image.prototype, 'valid', {
    get: function() { return (this.ptr != 0); }
});

Object.defineProperty(ASS_Image.prototype, 'w', {
    get: function() { return Module.getValue(this.ptr + 0, 'i32'); },
    set: function(newvalue) { Module.setValue(this.ptr + 0, newvalue, 'i32'); }
});

Object.defineProperty(ASS_Image.prototype, 'h', {
    get: function() { return Module.getValue(this.ptr + 4, 'i32'); },
    set: function(newvalue) { Module.setValue(this.ptr + 4, newvalue, 'i32'); }
});

Object.defineProperty(ASS_Image.prototype, 'stride', {
    get: function() { return Module.getValue(this.ptr + 8, 'i32'); },
    set: function(newvalue) { Module.setValue(this.ptr + 8, newvalue, 'i32'); }
});

Object.defineProperty(ASS_Image.prototype, 'bitmap', {
    get: function() { return Module.getValue(this.ptr + 12, '*') },
    set: function(newvalue) { Module.setValue(this.ptr + 12, '*') }
});
Object.defineProperty(ASS_Image.prototype, 'color', {
    get: function() { return Module.getValue(this.ptr + 16, 'i32'); },
    set: function(newvalue) { Module.setValue(this.ptr + 16, newvalue, 'i32'); }
});

Object.defineProperty(ASS_Image.prototype, 'dst_x', {
    get: function() { return Module.getValue(this.ptr + 20, 'i32'); },
    set: function(newvalue) { Module.setValue(this.ptr + 20, newvalue, 'i32'); }
});

Object.defineProperty(ASS_Image.prototype, 'dst_y', {
    get: function() { return Module.getValue(this.ptr + 24, 'i32'); },
    set: function(newvalue) { Module.setValue(this.ptr + 24, newvalue, 'i32'); }
});

Object.defineProperty(ASS_Image.prototype, 'next', {
    get: function() { return Module.getValue(this.ptr + 28, '*') },
    set: function(newvalue) { Module.setValue(this.ptr + 28, '*') }
});
