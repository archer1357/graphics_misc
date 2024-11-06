#include "math.h"

float minf(float x, float y) {
  return (x<y)?x:y;
}

float maxf(float x, float y) {
  return (x>y)?x:y;
}

float clampf(float x, float minVal, float maxVal) {
  return minf(maxf(x, minVal), maxVal);
}

float fastcosf(float x) {
    //from stackoverflow.com/a/28050328
    const float tp = 1.0f/(2.0f*(float)M_PI);
    x *= tp;
    x -= 0.25f + floorf(x + 0.25f);
    x *= 16.0f * (fabsf(x) - 0.5f);
    //x += 0.225f * x * (fabsf(x) - 1.0f); //disable for more speed
    return x;
}

float fastsinf(float x) {
    return fastcosf(x+(float)M_PI_2);
}
