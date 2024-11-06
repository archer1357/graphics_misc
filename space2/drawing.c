#include "drawing.h"

inline void setPixel(char *pixels,int p, int x,int y,char r,char g,char b) {
    int i=(x+y*p)*3;
    pixels[i+2]=r;
    pixels[i+1]=g;
    pixels[i+0]=b;
}

#include <stdio.h>
inline void setPixelf(char *pixels,int p, int x,int y,float r,float g,float b) {
    // printf("pixel %i %i\n",x,y);
    int i=(x+y*p)*3;
    pixels[i+2]=(char)(clampf(r,0.0f,1.0f)*255.0f);
    pixels[i+1]=(char)(clampf(g,0.0f,1.0f)*255.0f);
    pixels[i+0]=(char)(clampf(b,0.0f,1.0f)*255.0f);
}


// swaps two numbers
void swap(int* a , int*b)
{
    int temp = *a;
    *a = *b;
    *b = temp;
}

// returns absolute value of number
float absolute(float x )
{
    if (x < 0) return -x;
    else return x;
}

//returns integer part of a floating point number
int iPartOfNumber(float x)
{
    return (int)x;
}

//rounds off a number
int roundNumber(float x)
{
    return iPartOfNumber(x + 0.5) ;
}

//returns fractional part of a number
float fPartOfNumber(float x)
{
    if (x>0) return x - iPartOfNumber(x);
    else return x - (iPartOfNumber(x)+1);

}

//returns 1 - fractional part of number
float rfPartOfNumber(float x)
{
    return 1 - fPartOfNumber(x);
}

// draws a pixel on screen of given brightness
// 0<=brightness<=1. We can use your own library
// to draw on screen
// void drawPixel( int x , int y , float brightness)
// {
//     int c = 255*brightness;
//     // SDL_SetRenderDrawColor(pRenderer, c, c, c, 255);
//     // SDL_RenderDrawPoint(pRenderer, x, y);
// }

void drawAALine(char *pixels,int p,int x0 , int y0 , int x1 , int y1,char r,char g,char b) {
    float rf=(float)r/255.0f;
    float gf=(float)g/255.0f;
    float bf=(float)b/255.0f;

    int steep = absolute(y1 - y0) > absolute(x1 - x0) ;

    // swap the co-ordinates if slope > 1 or we
    // draw backwards
    if (steep) {
        swap(&x0 , &y0);
        swap(&x1 , &y1);
    }

    if (x0 > x1) {
        swap(&x0 ,&x1);
        swap(&y0 ,&y1);
    }

    //compute the slope
    float dx = x1-x0;
    float dy = y1-y0;
    float gradient = dy/dx;

    if (dx == 0.0) {
        gradient = 1;
    }

    int xpxl1 = x0;
    int xpxl2 = x1;
    float intersectY = y0;
    // setPixel(char *pixels,int p, int x,int y,char r,char g,char b)
    // drawPixel( int x , int y , float brightness)
    // main loop
    if (steep) {
        int x;
        for (x = xpxl1 ; x <=xpxl2 ; x++) {
            // pixel coverage is determined by fractional
            // part of y co-ordinate
            float qqq=rfPartOfNumber(intersectY);
            float sss=fPartOfNumber(intersectY);
            int xxx=iPartOfNumber(intersectY);
            int yyy=x;
            setPixelf(pixels,p,
                      xxx,
                      yyy,
                      rf*qqq,gf*qqq,bf*qqq);
            setPixelf(pixels,p,
                      xxx-1,
                      yyy,
                      rf*sss,gf*sss,bf*sss);

            // drawPixel(
            //           iPartOfNumber(intersectY),
            //           x,
            //           rfPartOfNumber(intersectY)
            //           );
            // drawPixel(
            //           iPartOfNumber(intersectY)-1,
            //           x,
            //           fPartOfNumber(intersectY)
            //           );
            intersectY += gradient;
        }
    } else {
        int x;
        for (x = xpxl1 ; x <=xpxl2 ; x++) {
            // pixel coverage is determined by fractional
            // part of y co-ordinate
            int yyy=iPartOfNumber(intersectY);
            float qqq=rfPartOfNumber(intersectY);
            float sss=fPartOfNumber(intersectY);

             setPixelf(pixels,p,
                      x,
                      yyy,
                      rf*qqq,gf*qqq,bf*qqq);

             setPixelf(pixels,p,
                      x,
                      yyy-1,
                      rf*sss,gf*sss,bf*sss);

            // drawPixel(
            //           x,
            //           iPartOfNumber(intersectY),
            //           rfPartOfNumber(intersectY)
            //           );
            // drawPixel(
            //           x,
            //           iPartOfNumber(intersectY)-1,
            //           fPartOfNumber(intersectY)
            //           );
            intersectY += gradient;
        }
    }

}
