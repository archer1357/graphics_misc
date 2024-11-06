#define ENABLE_SHADOWS 1
#define ENABLE_SOFT_SHADOWS 1
#define ENABLE_AO 1
#define ENABLE_TONE_MAPPING 1

#define FOV .5

#define MARCH_STEPS 250
#define MARCH_EPS .000001
#define MAX_DIST 100.0

#define NORMAL_EPS .00001

#define LIGHT_DIFFUSE vec3(1.0, 0.9, 0.8)
#define LIGHT_AMBIENT vec3(0.25, 0.25, 0.25)

#define SSDW_K 16.0
#define SSDW_EPS 0.004
#define SSDW_STEPS 160
#define SSDW_STEP_FRAC 0.45

#define AO_STEP_COUNT 10
#define AO_STEP_SIZE 0.05
#define AO_K .714
#define AO_STRENGTH 2.3

#define EXPOSURE 2.8


#define LN_2_INV 1.44269504089


const vec3 LIGHT_DIR = normalize(vec3(1.5, -2.0, -1.5));



//http://iquilezles.org/www/articles/smin/smin.htm
float smin( float a, float b, float k )
{
    float res = exp( -k*a ) + exp( -k*b );
    return -log( res )/k;
}


float sdSphere(vec3 p, vec3 c, float r)
{
    return distance(p, c) - r;
}


float sdBoxFast(vec3 p, vec3 c, vec3 s)
{
    vec3 d = abs(p - c) - s;
    return max(d.x, max(d.y, d.z));
}

float sdBox(vec3 p, vec3 c, vec3 s)
{
    vec3 d = abs(p - c) - s;
    return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}


float sgUnion(float d1, float d2)
{
    return min(d1, d2);
}


float sgUnion(float d1, float d2, float k)
{
    return smin(d1, d2, k);
}


float sgInterection(float d1, float d2)
{
    return max(d1, d2);
}


float sgInterection(float d1, float d2, float k)
{
    return -smin(-d1, -d2, k);
}


float sgDifference(float d1, float d2)
{
    return max(d1, -d2);
}


float sgDifference(float d1, float d2, float k)
{
    return -smin(-d1, d2, k);
}


float map(vec3 p)
{
    vec3 p1 = vec3(cos(iTime * 1.), sin(iTime * 1.) * 0.8 - 0.2, 0.0);
   
    float shape1_sphere = sdSphere(p, p1, .8);
    float shape1_box = sdBox(p, p1, vec3(.6));
    float shape1_cyl = length((p - p1).xy) - .3;
    
    float shape1_blend = (1.1 + cos(iTime * 2.3)) * .6;
    float shape1_outer = mix(shape1_sphere, shape1_box, shape1_blend);
    
   	float shape1 = sgDifference(shape1_outer, shape1_cyl, 8.0);
    
    float x = cos(iTime * 1.3);
    float box = sdBox(p, vec3(x * .5, 0., x * .9), vec3(.2));
    
    float shape2 = sgUnion(shape1, box, 16.0);
    
    float plane = p.y + .5;
    float ground = sgDifference(plane, shape1_outer, 8.0);

    float d = sgUnion(shape2, ground);
    
    return d;
}


/**
 * Ray march
 * 
 *     ro: ray origin
 *     rd: ray direction (normalized)
 */
vec4 march(vec3 ro, vec3 rd)
{
    vec3 p = ro; // Current position
    float td = 0.0; // Total distance traveled
    float d; // Current distance to surface
    float nsteps = 0.0; // Number of steps taken
    
    for (int i = 0; i < MARCH_STEPS; i++)
    {
        d = map(p);
        
        if (d < MARCH_EPS)
        {
            td += max(d, 0.0);
        	p = ro + td * rd;
            break;
        }
        
        td += d;
        p = ro + td * rd;
        
        if (td > MAX_DIST)
        {
            nsteps = -nsteps;
            break;
        }
        
        nsteps += 1.0;
    }
    
    return vec4(p, nsteps);
}


float softShadow(vec3 ro, vec3 rd)
{
    float td = 0.0; // Total distance traveled
    float d; // Current distance to surface
    float value = 1.0;
    float f;
    
    for (int i = 0; i < SSDW_STEPS; i++)
    {
        f = td / SSDW_K;

        d = map(ro + td * rd) + 0.5 * f;
        
        if (d < SSDW_EPS)
        	return 0.0;
        
        if (td > MAX_DIST)
        	break;
        
        value = min(value, d / f);
        
        td += d * SSDW_STEP_FRAC;
    }
    
    return value;
}


float calcAO(vec3 ro, vec3 rd)
{
    float td = 0.0; // Total distance traveled
    float d; // Current distance to surface
    float sum = 0.0;
    float r = 1.0;
    
    for (int i = 0; i < AO_STEP_COUNT; i++)
    {
        td += AO_STEP_SIZE;
        r *= AO_K;

        d = map(ro + td * rd);
        
        sum += r * max(td - d, 0.0);
    }
    
    return max(1.0 - AO_STRENGTH * sum * (1.0 - AO_K) / AO_K, 0.0);
}


vec3 calcNormal(vec3 p)
{
    return normalize(vec3( map(p + vec3(NORMAL_EPS, 0.0, 0.0)) - map(p - vec3(NORMAL_EPS, 0.0, 0.0)),
                           map(p + vec3(0.0, NORMAL_EPS, 0.0)) - map(p - vec3(0.0, NORMAL_EPS, 0.0)),
                           map(p + vec3(0.0, 0.0, NORMAL_EPS)) - map(p - vec3(0.0, 0.0, NORMAL_EPS))
                         ));
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Screen coordinates: origin in center of window, y range is (-1, 1)
	vec2 uv = ((2.0 * fragCoord.xy) - iResolution.xy) / iResolution.y;
    
    // Ray origin in world coordinates
    vec3 ro = vec3(0.0, 0.0, -2.5);
    
    // Unit vector of ray direction in world coordinates
    vec3 rd = normalize(vec3(uv * FOV, 1.0));
    
    // Ray march, get intersection point and number of steps
    vec4 m = march(ro, rd);
    vec3 p = m.xyz;
    float nsteps = abs(m.w);
    
    
    // Color value of the pixel
    vec3 col;
    
    // Stopped at epsilon or max iterations - consider it an intersection
    if (m.w >= 0.0)
    {
        // Calculate normal
        vec3 n = calcNormal(p);
        
        // Lambertian diffuse reflectance term
        vec3 ambient = LIGHT_AMBIENT;
        float diffuse = max(-dot(n, LIGHT_DIR), 0.0);
        
        // Calculate shadows
        #if ENABLE_SHADOWS
        
            // Only if diffuse term was positive
            if (diffuse > 0.0)
            {
        
                // Cool soft shadows
                #if ENABLE_SOFT_SHADOWS
                    diffuse *= softShadow(p + 2.0 * SSDW_EPS * n, -LIGHT_DIR);

                // Boring hard shadows
                #else
                    // Ray march towards light
                    vec4 lm = march(p + 2.0 * MARCH_EPS * n, -LIGHT_DIR);

                    // If doesn't escape to infinity, remove lighting value
                    if (lm.w >= 0.0)
                        diffuse = 0.0;

                #endif
    		}

        #endif
        
        
        // Calculate ambient occlusion
        #ifdef ENABLE_AO
        
        	ambient *= calcAO(p, n);
        
        #endif
        

       	// Color from lighting values
        col = clamp(ambient + diffuse * LIGHT_DIFFUSE, vec3(0.0), vec3(1.0));

    }
    // Stopped at max distance
    else
    {
        col = mix(texture(iChannel0, 4.0 * uv / (length(uv) + 2.0)).xyz, vec3(.15), .9);
    }
    
    // If ended loop at max number of steps
    if (false && abs(nsteps) >= float(MARCH_STEPS))
    {
        col.r = mix(col.r, 1.0, .8);
    }
    
    // Tone mapping
    #if ENABLE_TONE_MAPPING
    
    	col = 1.0 - LN_2_INV * log(exp(EXPOSURE * -col) + 1.0);
    
    #endif
    
    // Fragment with color and 1.0 alpha
	fragColor = vec4(col, 1.0);
}