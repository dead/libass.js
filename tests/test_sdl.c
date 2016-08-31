/*
 * Copyright (C) 2006 Evgeniy Stepanov <eugeni.stepanov@gmail.com>
 * Copyright (C) 2009 Grigori Goronzy <greg@geekmind.org>
 *
 * This file is part of libass.
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include "ass/ass.h"

#include <SDL2/SDL.h>
#include <SDL2/SDL_image.h>

#include <emscripten.h>

ASS_Library *ass_library;
ASS_Renderer *ass_renderer;
static double fps = 23.976000;
SDL_Window *window;
SDL_Renderer *renderer;

ASS_Track *track;
double tm;
static double time = 200; 

void msg_callback(int level, const char *fmt, va_list va, void *data)
{
    if (level > 6)
        return;
    printf("libass: ");
    vprintf(fmt, va);
    printf("\n");
}

#define _r(c)  ((c)>>24)
#define _g(c)  (((c)>>16)&0xFF)
#define _b(c)  (((c)>>8)&0xFF)
#define _a(c)  ((c)&0xFF)

static void blend_single(SDL_Surface * frame, ASS_Image *img)
{
    int x, y;
    unsigned char opacity = 255 - _a(img->color);
    unsigned char r = _r(img->color);
    unsigned char g = _g(img->color);
    unsigned char b = _b(img->color);

    unsigned char *src;
    unsigned char *dst;

    src = img->bitmap;
    dst = frame->pixels;

    for (y = 0; y < img->h; ++y) {
        for (x = 0; x < img->w; ++x) {
            unsigned k = ((unsigned) src[x]) * opacity / 255;
            // possible endianness problems
            dst[x * 4] = (k * b + (255 - k) * dst[x * 4]) / 255;
            dst[x * 4 + 1] = (k * g + (255 - k) * dst[x * 4 + 1]) / 255;
            dst[x * 4 + 2] = (k * r + (255 - k) * dst[x * 4 + 2]) / 255;
            dst[x * 4 + 3] = k;
        }
        src += img->stride;
        dst += frame->pitch;
    }
}
/*
static void blend(image_t * frame, ASS_Image *img)
{
    int cnt = 0;
    while (img) {
        blend_single(frame, img);
        ++cnt;
        img = img->next;
    }
    printf("%d images blended\n", cnt);
}*/

void loop()
{
        int dif = 0;
        ASS_Image *img = ass_render_frame(ass_renderer, track, (int) (tm * 1000), &dif);
        tm += 1 / fps;

        if(dif == 0)
            return;


        SDL_RenderClear( renderer );
        
        while (img) {
            SDL_Surface* surface = SDL_CreateRGBSurface     (0,
                                                            img->w, 
                                                            img->h, 
                                                            32,
                                                            0x000000ff, 0x0000ff00, 0x00ff0000, 0xff000000);
            blend_single(surface, img);
            SDL_Rect dest = { img->dst_x, img->dst_y, img->w, img->h };
            SDL_Texture *tex = SDL_CreateTextureFromSurface(renderer, surface);
            SDL_RenderCopy(renderer, tex, NULL, &dest);

            SDL_DestroyTexture (tex);
            SDL_FreeSurface (surface);
            //free(img->bitmap);
            img = img->next;
            //count++;
        }

        //free(img);
        SDL_RenderPresent( renderer );

        SDL_Delay(10);
}

int main(int argc, char *argv[])
{
    /*if (argc < 3) {
        printf("usage: %s <image file> <subtitle file> <time>\n", argv[0]);
        exit(1);
    }*/

    char *subfile = "in.ass";
    double tm = 10;

    ass_library = ass_library_init();
    if (!ass_library) {
        printf("ass_library_init failed!\n");
        exit(1);
    }

    ass_set_message_cb(ass_library, msg_callback, NULL);

    ass_renderer = ass_renderer_init(ass_library);
    if (!ass_renderer) {
        printf("ass_renderer_init failed!\n");
        exit(1);
    }
    
    track = ass_read_file(ass_library, subfile, NULL);
    if (!track) {
        printf("track init failed!\n");
        return 1;
    }

    int frame_w = track->PlayResX;
    int frame_h = track->PlayResY;

    ass_set_frame_size(ass_renderer, frame_w, frame_h);
    ass_set_fonts(ass_renderer, "font.ttf", "Sans", 1, NULL, 1);
    ass_set_cache_limits(ass_renderer, 100, 1);

    SDL_Init(SDL_INIT_VIDEO);
    SDL_CreateWindowAndRenderer(frame_w, frame_h, 0, &window, &renderer);
    SDL_SetRenderDrawColor(renderer, 47, 163, 254, 255);
    
    emscripten_set_main_loop(loop, 0, 1);

    //SDL_Quit();

    //ass_free_track(track);
    //ass_renderer_done(ass_renderer);
    //ass_library_done(ass_library);

    return 0;
}
