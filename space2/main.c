
#include "main.h"


LRESULT CALLBACK WndProc(HWND hWnd,UINT message,WPARAM wParam,LPARAM lParam) {
    if(message==WM_DESTROY) {
        PostQuitMessage(0);
        return 0;
    }

    if(message==WM_KEYDOWN&&wParam==VK_ESCAPE) {
        PostQuitMessage(0);
        return 0;
    }

    return DefWindowProc(hWnd,message,wParam,lParam);
}

void printLastError() {
    char fMessage[256];

    FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM, NULL, GetLastError(),
                  MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),fMessage,
                  256, NULL);

    fprintf(stderr,"%s\n",fMessage);
}

bool register_class(const char *name,HINSTANCE hInstance,WNDPROC wndproc) {
    WNDCLASS wc;
    wc.style = CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc = WndProc;
    wc.cbClsExtra = 0;
    wc.cbWndExtra = 0;
    wc.hInstance = hInstance;
    wc.hIcon = LoadIcon(hInstance,IDI_APPLICATION);
    wc.hCursor = LoadCursor(NULL,IDC_ARROW);
    wc.hbrBackground = (HBRUSH) GetStockObject(GRAY_BRUSH);//COLOR_GRAYTEXT;
    wc.lpszMenuName = NULL;
    wc.lpszClassName = name;

    if(!RegisterClass(&wc)) {
        fprintf(stderr,"RegisterClass failed.\n");
        printLastError();
        return false;
    }

    return true;
}

bool unregister_class(const char *name,HINSTANCE hInstance) {
    if(TRUE!=UnregisterClass(name,hInstance)) {
        printLastError();
        return false;
    }

    return true;
}

bool create_window(const char *name,const char *caption,int width,int height,
                   HINSTANCE hInstance,HWND *hWndOut) {
    RECT wr = {0,0,width,height};
    AdjustWindowRect(&wr, WS_OVERLAPPEDWINDOW, FALSE);

    HWND hWnd = CreateWindow(name,caption,WS_OVERLAPPEDWINDOW,
                             CW_USEDEFAULT,CW_USEDEFAULT,
                             wr.right-wr.left,wr.bottom-wr.top,
                             NULL,NULL,hInstance,NULL);

    if(!hWnd) {
        fprintf(stderr,"CreateWindow failed");
        printLastError();
        return false;
    }

    ShowWindow(hWnd,SW_SHOW);

    *hWndOut=hWnd;
    return true;
}

bool initBitmap(HDC hdc,int width,int height,
                HBITMAP *pBitmap,HDC *pBitmapHdc) {

    *pBitmap = CreateCompatibleBitmap(hdc,width,height);

    if((!*pBitmap)) {
        fprintf(stderr,"CreateCompatibleBitmap failed");
        printLastError();
        return false;
    }

    *pBitmapHdc = CreateCompatibleDC(hdc);

    if((!*pBitmapHdc)) {
        fprintf(stderr,"CreateCompatibleBitmap failed");
        printLastError();
        return false;
    }

    SelectObject(*pBitmapHdc, *pBitmap);
    return true;
}

void uninitBitmap(HBITMAP bitmap,HDC bitmapHdc) {
    DeleteDC(bitmapHdc);
    DeleteObject(bitmap);
}

bool window_update(HWND hWnd) {
    while(1) {
        MSG msg;
        ZeroMemory(&msg,sizeof(MSG));

        while(PeekMessage(&msg,NULL,0,0,PM_REMOVE) && msg.message!=WM_QUIT) {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }

        if(msg.message==WM_QUIT) {
            return false;
        }

        if(IsIconic(hWnd)==FALSE) {
            break;
        }

        Sleep(1);
    }

    return true;
}

double timer() {
    FILETIME ft;
    GetSystemTimeAsFileTime(&ft);
    uint64_t cur=((uint64_t)ft.dwHighDateTime<<32)|ft.dwLowDateTime;
    static uint64_t start=0;
    if(!start) { start=cur; }
    return (double)(cur-start)/10000000.0;
}

float calcFps() {
    static int count=0;
    static float total=0.0f;
    static float last=0.0f;

    float cur=(float)timer();
    if(last==0.0f) { last=cur; }
    float dt=cur-last;

    if(dt>=1.0f) {
        total=(float)count/dt;
        count=0;
        last=cur;
    }

    count++;
    return total;
}

void drawPixels(char *pixels,int w, int h) {
    memset(pixels,255,w*h*3);

    // vec2 iResolution={(float)w,(float)h};
    // vec2 invRes={1.0f/iResolution.x,1.0f/iResolution.y};
    float iTime=(float)timer();
    float x0,y0,x1,y1;
    x0=fastcosf(iTime)*50.0;
    y0=fastsinf(iTime)*50.0;
    drawAALine(pixels,w,x0+220,y0+220 ,x0+120 ,y0+120,255,255,0) ;
    // for(x=0;x<w;x++) {
    //     for(y=0;y<h;y++) {
    //         vec2 fragCoord={(float)x,(float)y};
    //         vec2 uv = {fragCoord.x*invRes.x-0.5f,fragCoord.y*invRes.y-0.5f};

    //         float q=(iTime-(uv.y*uv.y*uv.y+uv.x*uv.x*uv.x)*25.0f);

    //         float cr=(fastcosf(0.9f+q)*0.5f+0.5f)*1.3f;
    //         float cg=(fastcosf(0.5f+q)*0.5f+0.5f)*1.3f;
    //         float cb=(fastcosf(0.1f+q)*0.5f+0.5f)*1.3f;

    //         setPixelf(pixels,x,y,w,cr,cg,cb);
    //     }
    // }
}

bool copyPixelsToBitmap(HBITMAP bitmap,int width,int height,char *pixels) {
    const BITMAPINFO bmi={{sizeof(BITMAPINFOHEADER),width,height,1,24,BI_RGB, 0,0,0,0,0},{{0,0,0,0}}};

    if(!SetDIBits(0,bitmap,0,height,(void*)pixels,&bmi,DIB_RGB_COLORS)) {
        fprintf(stderr,"SetDIBits failed.\n");
        return false;
    }

    return true;
}

int main() {
    const int width=640;
    const int height=480;

    HWND hWnd;
    HDC hdc;
    HINSTANCE hInst;

    HBITMAP bitmap;
    HDC bitmapHdc;

    char *pixels;

    //
    hInst=GetModuleHandle(0);

    //init window
    if(!register_class("app",hInst,WndProc)) {
        return 1;
    }

    if(!create_window("app","Demo",width,height,hInst,&hWnd)) {
        return 1;
    }

    //
    hdc=GetDC(hWnd);
    pixels=(char*)malloc(width*height*3);

    //
    if(!initBitmap(hdc,width,height,&bitmap,&bitmapHdc)) {
        return 1;
    }

    //update loop
    while(window_update(hWnd)) {
        drawPixels(pixels,width,height);

        if(!copyPixelsToBitmap(bitmap,width,height,pixels)) {
            return 1;
        }

        if(!BitBlt(hdc,0,0,width,height,bitmapHdc,0,0,SRCCOPY)) {
            fprintf(stderr,"BitBlt failed.\n");
            return 1;
        }

        //
        char str[32];
        snprintf(str,sizeof(str),"Demo %0.1f fps",calcFps());
        SetWindowText(hWnd,str);
    }

    //uninit bitmap
    free(pixels);
    uninitBitmap(bitmap,bitmapHdc);


    //uninit window
    DestroyWindow(hWnd);
    unregister_class("app",hInst);

    // int a=0;
    // memset(&a,255,2);
    // printf("here:%u\n",a);

    //
    return 0;
}
