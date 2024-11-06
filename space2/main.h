
#ifdef _MSC_VER
#pragma comment(lib, "Gdi32.lib")
#pragma comment(lib, "User32.lib")
#pragma comment(lib, "Opengl32.lib")
#endif

#undef UNICODE
#define WIN32_LEAN_AND_MEAN
#define WIN32_WINNT 0x0501

#ifndef WINVER
#define WINVER 0x0501
#endif

#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <stdint.h>

#if defined(_MSC_VER)
#define snprintf _snprintf
#endif

#ifndef __cplusplus
#include <stdbool.h>
#endif



#include "math.h"
#include "drawing.h"

