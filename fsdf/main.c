#include "main_win32.h"


PFNWGLCREATECONTEXTATTRIBSARBPROC wglCreateContextAttribsARB;
PFNWGLSWAPINTERVALEXTPROC wglSwapIntervalEXT;

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
    DWORD err=GetLastError();

    if(0==FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM,NULL,err,MAKELANGID(LANG_NEUTRAL,SUBLANG_DEFAULT),fMessage,256,NULL)) {
        ERROR_MSG("FormatMessage '%u'.\n",err);
    } else {
        fprintf(stderr,"%s\n",fMessage);
    }
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

    if(0==RegisterClass(&wc)) {
        ERROR_MSG("RegisterClass");
        printLastError();
        return false;
    }

    return true;
}

bool unregister_class(const char *name,HINSTANCE hInst) {
    if(FALSE==UnregisterClass(name,hInst)) {
        ERROR_MSG("UnregisterClass");
        printLastError();
        return false;
    }

    return true;
}

bool create_window(const char *name,const char *caption,int width,int height,
                   HINSTANCE hInst,HWND *hWndOut) {
    RECT rect = {0,0,width,height};
    AdjustWindowRect(&rect, WS_OVERLAPPEDWINDOW, FALSE);

    int w= rect.right-rect.left;
    int h=rect.bottom-rect.top;

    HWND hWnd = CreateWindow(name,caption,WS_OVERLAPPEDWINDOW,CW_USEDEFAULT,CW_USEDEFAULT,w,h,NULL,NULL,hInst,NULL);

    if(!hWnd) {
        ERROR_MSG("CreateWindow");
        printLastError();
        return false;
    }

    ShowWindow(hWnd,SW_SHOW);

    *hWndOut=hWnd;
    return true;
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

bool set_old_gl_pixel_format(HDC hdc) {
    int iPixelFormat;
    PIXELFORMATDESCRIPTOR pfd;

    //pixel format desc
    ZeroMemory(&pfd,sizeof(PIXELFORMATDESCRIPTOR));
    pfd.nSize = sizeof(pfd);
    pfd.nVersion = 1;
    pfd.dwFlags = PFD_DRAW_TO_WINDOW|PFD_SUPPORT_OPENGL|
        PFD_GENERIC_ACCELERATED|PFD_DOUBLEBUFFER;
    pfd.iPixelType = PFD_TYPE_RGBA;
    pfd.cColorBits = 24;
    pfd.cRedBits = pfd.cGreenBits = pfd.cBlueBits = 8;
    pfd.cDepthBits = 32;
    pfd.cStencilBits=8;

    //choose pixel format
    iPixelFormat = ChoosePixelFormat(hdc,&pfd);

    if(iPixelFormat == 0) {
        ERROR_MSG("ChoosePixelFormat");
        printLastError();
        return false;
    }

    //set pixel format
    if(FALSE == SetPixelFormat(hdc,iPixelFormat,&pfd)) {
        ERROR_MSG("SetPixelFormat");
        printLastError();
        return false;
    }

    //
    return true;
}

void uninit_window(HWND hWnd, HINSTANCE hInst) {
    if(FALSE==DestroyWindow(hWnd)) {
        ERROR_MSG("DestroyWindow");
    }

    unregister_class("app",hInst);
}


bool init_old_gl(HDC hdc) {
    HGLRC hglrc;

    //create context
    hglrc=wglCreateContext(hdc);

    if(!hglrc) {
        ERROR_MSG("wglCreateContext");
        printLastError();
        return false;
    }

    //set context
    if(wglMakeCurrent(hdc,hglrc)==FALSE) {
        ERROR_MSG("wglMakeCurrent");
        printLastError();
        return false;
    }

    //print version
    // fprintf(stdout,"GL %s\n",glGetString(GL_VERSION));

    //get wglCreateContextAttribsARB
    wglCreateContextAttribsARB=(PFNWGLCREATECONTEXTATTRIBSARBPROC)
        wglGetProcAddress("wglCreateContextAttribsARB");

    if(!wglCreateContextAttribsARB) {
        ERROR_MSG("wglGetProcAddress 'wglCreateContextAttribsARB'");
        return false;
    }

    //get wglSwapIntervalEXT
    wglSwapIntervalEXT=(PFNWGLSWAPINTERVALEXTPROC)
        wglGetProcAddress("wglSwapIntervalEXT");

    if(!wglSwapIntervalEXT) {
        ERROR_MSG("wglGetProcAddress 'wglSwapIntervalEXT'");
        return false;
    }

    //delete context
    if(wglDeleteContext(hglrc)==FALSE) {
        ERROR_MSG("wglDeleteContext");
        printLastError();
        return false;
    }

    //
    return true;
}

bool init_gl_context(HDC hdc,int major,int minor,bool core,HGLRC *hglrcOut) {

    int attribs[] ={
        WGL_CONTEXT_MAJOR_VERSION_ARB,major,
        WGL_CONTEXT_MINOR_VERSION_ARB,minor,
        WGL_CONTEXT_FLAGS_ARB,0,
        WGL_CONTEXT_PROFILE_MASK_ARB,core?
        WGL_CONTEXT_CORE_PROFILE_BIT_ARB:
        WGL_CONTEXT_COMPATIBILITY_PROFILE_BIT_ARB,
        0};

    //create context
    *hglrcOut=wglCreateContextAttribsARB(hdc,0,attribs);

    if(!(*hglrcOut)) {
        fprintf(stderr,"gl context %i.%i unsupported.\n",major,minor);
        return false;
    }

    //set context
    if(wglMakeCurrent(hdc,*hglrcOut)==FALSE) {
        ERROR_MSG("wglMakeCurrent");
        printLastError();
        return false;
    }

    //
    return true;
}

bool get_a_gl_context(HDC hdc) {
    HGLRC hglrc=0;

    if(!init_gl_context(hdc,4,6,false,&hglrc) &&
       !init_gl_context(hdc,4,5,false,&hglrc) &&
       !init_gl_context(hdc,4,4,false,&hglrc) &&
       !init_gl_context(hdc,4,3,false,&hglrc) &&
       !init_gl_context(hdc,4,2,false,&hglrc) &&
       !init_gl_context(hdc,4,1,false,&hglrc) &&
       !init_gl_context(hdc,4,0,false,&hglrc) &&
       !init_gl_context(hdc,3,3,false,&hglrc) &&
       !init_gl_context(hdc,3,2,false,&hglrc) &&
       !init_gl_context(hdc,3,1,false,&hglrc) &&
       !init_gl_context(hdc,3,0,false,&hglrc) &&
       !init_gl_context(hdc,2,1,false,&hglrc) &&
       !init_gl_context(hdc,2,0,false,&hglrc)) {
        ERROR_MSG("Unable to create gl context");
        return false;
    }

    //print version
    fprintf(stdout,"GL %s\n",glGetString(GL_VERSION));

    //
    return true;
}

int main() {
    const int width=800;
    const int height=600;

    HWND hWnd;

    HINSTANCE hInst=GetModuleHandle(0);
    HGLRC hglrc=0;

    //init window
    if(!register_class("app",hInst,WndProc)) {
        return 1;
    }

    if(!create_window("app","Demo",width,height,hInst,&hWnd)) {
        return 1;
    }

    //
    HDC hdc=GetDC(hWnd);

    //
    if(!set_old_gl_pixel_format(hdc)) {
        uninit_window(hWnd,hInst);
        return 1;
    }

    if(!init_old_gl(hdc)) {
        uninit_window(hWnd,hInst);
        return 1;
    }

    //
    if(!get_a_gl_context(hdc)) {
        uninit_window(hWnd,hInst);
        return 1;
    }

    //update loop
    while(window_update(hWnd)) {

    }

    //
    uninit_window(hWnd,hInst);

    //
    return 0;
}
