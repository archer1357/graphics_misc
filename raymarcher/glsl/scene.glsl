#version 300 es
#define INFINITY 3.402823e+38
precision highp float;
precision highp int;

uniform float iTime;
uniform float aspect;
uniform float fovy;
uniform vec3 viewPos;
uniform mat3 viewRot;

uniform vec3 lightPos;
uniform bool lightAnimate;

uniform sampler2D iChannel0; 

in vec2 screen;
out vec4 outColor;


uint read1u(uint i) {
#if 1
    uvec2 s=uvec2(textureSize(iChannel0,0));
    uvec2 uv=uvec2(i%s.x,i/s.x);
    vec4 tex=texelFetch(iChannel0,ivec2(uv),0);
    uvec4 bytes=uvec4(tex*255.0).abgr;
    return (bytes.r<<24)|(bytes.g<<16)|(bytes.b<<8)|bytes.a;
#else
    uint w=uint(textureSize(iChannel0,0).x);
    uint x=i%w;
    uint y=i/w;
    return texelFetch(iChannel0,ivec2(x,y),0).r;
#endif
}

float read3d(uvec3 v) {
    uvec3 s=uvec3(102u, 563u, 102u);
    uint i=v.x + v.y*s.x + v.z*s.x*s.y;
    return uintBitsToFloat(read1u(i));
}

float opS(float d1, float d2) {
    return max(-d2,d1);
}

vec2 opU(vec2 r1, vec2 r2) {
    return (r1.x<r2.x) ? r1 : r2;
}

vec3 opRep(vec3 p, vec3 c) {
    return mod(p,c)-0.5*c;
}
float sdCylinder( vec3 p, vec3 c ) {
  return length(p.xz-c.xy)-c.z;
}
//~ float sdCylinder( vec3 p, vec2 h ) {
  //~ vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  //~ return min(max(d.x,d.y),0.0) + length(max(d,0.0));
//~ }

float sdCappedCylinder( vec3 p, vec2 h ) {
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}
float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdPlane( vec3 p, vec4 n ) {
  return dot(p,n.xyz) + n.w;
}

float udPlane( vec3 p, vec4 n ) {
  return abs(sdPlane(p,n));
}

float sdHexPrism( vec3 p, vec2 h )
{
    vec3 q = abs(p);
    return max(q.z-h.y,max((q.x*0.866025+q.y*0.5),q.y)-h.x);
}

float sdTriPrism( vec3 p, vec2 h )
{
    vec3 q = abs(p);
    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}


float sdVaultedCeiling(vec3 p) {
    vec3 pColumns=p;
    float dColumns=sdBox(pColumns,vec3(4.0,2.0,4.0));
    
    vec3 pCylinderA=p;
    vec3 pCylinderB=p;
    pCylinderA.y-=-2.0;
    pCylinderB.y-=-2.0;
    
    //float dCylinderA=sdCylinder(pCylinderA.yxz, vec3(0.0,0.0,1.5));
    //float dCylinderB=sdCylinder(pCylinderB.yzx, vec3(0.0,0.0,1.5));
    
    vec2 hh=vec2(1.0,2.0);
    float dCylinderA=sdHexPrism(pCylinderA.yxz, hh );
    float dCylinderB=sdHexPrism(pCylinderB.yzx, hh );

    
    //return opS(opS(dColumns,dCylinderA),dCylinderB);
    
    //return min(dCylinderA,dCylinderB);
    
    return dCylinderA;
}

vec2 distScene(vec3 p) {
    float dGround=sdBox(p-vec3(0.0,-11.5,0.0), vec3(24.0,0.5,24.0));
   
    vec3 pVaultedCeiling=p-vec3(0.0,7.0,0.0);
    //pVaultedCeiling=opRep(pVaultedCeiling,vec3(4.0,0.0,4.0));
    
    float dVaultedCeiling=sdVaultedCeiling(pVaultedCeiling);
    
    
    vec2 rs;

    rs= vec2(dVaultedCeiling, 0.1);
   // rs=opU(rs, vec2(dVaultedCeiling,0.3));

    return rs;
}

float rand(vec2 coordinate) {
    return fract(sin(dot(coordinate.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 castRay( in vec3 ro, in vec3 rd ) {
    float t=0.0;
    float d=0.0;
    const float maxSteps=48.0;
    
    for(float i = 1.0; i <= maxSteps; ++i)

    {
        vec3 p = ro + rd * t;
        vec2 rs=distScene(p);
        d = rs.x;
        float q=0.01;
        
        if(d < q ) {
            return vec2(rs.y,t);
        }

        t += d;
    }

    return vec2(0.0,0.0);
}



vec3 getNormal(vec3 p) {
    float h = 0.0001;
    vec3 n;
    n.x=distScene(p+vec3(h,0.0,0.0)).x-distScene(p-vec3(h,0.0,0.0)).x;
    n.y=distScene(p+vec3(0.0,h,0.0)).x-distScene(p-vec3(0.0,h,0.0)).x;
    n.z=distScene(p+vec3(0.0,0.0,h)).x-distScene(p-vec3(0.0,0.0,h)).x;
    
    //~ n=normalize(n);
    
    //~ float bla=128.0;
    //~ n=floor(n*bla)/bla;
    //~ n=normalize(n);
    return n;
}


#define AO_STEP_COUNT 5
#define AO_STEP_SIZE 0.05
#define AO_K .714
#define AO_STRENGTH 2.3

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

        d = distScene(ro + td * rd).x;
        
        sum += r * max(td - d, 0.0);
    }
    
    return max(1.0 - AO_STRENGTH * sum * (1.0 - AO_K) / AO_K, 0.0);
}

float ambOccl(vec3 p, vec3 n) {
  //shadertoy.com/view/4ssGzS
  float step = 0.1;
  float ao = 0.0;
  float dist;
  
  for(float i=1.0;i<=5.0;i++) {
    dist = step*i;
    ao += max(0.0, (dist - distScene(p + n * dist).x) / dist);  
  }
  
  return 1.0 - ao * 0.1;
}

//~ #define AO_SAMPLES 25
//~ #define AO_STRENGTH 2.0

//~ float occlusion(vec3 ro, vec3 rd){
    //~ float k = 1.0;
    //~ float d = 0.0;
    //~ float occ = 0.0;
    //~ for(int i = 0; i < AO_SAMPLES; i++){
        //~ d = distScene(ro + 0.1 * k * rd).x;
        //~ occ += 1.0 / pow(2.0, k) * (k * 0.1 - d);
        //~ k += 1.0;
    //~ }
    //~ return 1.0 - clamp(AO_STRENGTH * occ, 0.0, 1.0);
//~ }

vec3 calcPtLightCol(vec3 P,vec3 N,vec3 lPos,vec3 lAtten,vec3 mCol,vec3 lCol,float shininess,float strength) {
    vec3 L=lPos.xyz-P;
    float lDist=length(L);
    L=L/lDist;
    
    vec2 rs=castRay(P+L*0.1,L);

    if(rs.y>0.0 && rs.x < lDist) {
        return vec3(0.0);
    }
    
    
    float atten = 1.0/dot(lAtten,vec3(1.0,lDist,lDist*lDist));
    vec3 R=reflect(-L,N);
    float NdotL = max(0.0,dot(N,L));
    float NdotR = max(0.0, dot(N,R));
    float spec = (NdotL > 0.0)?pow(NdotR,shininess*128.0)*strength:0.0;
    float diffuse=NdotL;
    return lCol*(mCol*diffuse+spec)*atten;
}

float hash(vec3 p)  // replace this by something better
{
    p  = fract( p*0.3183099+.1 );
	p *= 17.0;
    return fract( p.x*p.y*p.z*(p.x+p.y+p.z) );
}

float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
	
    return mix(mix(mix( hash(p+vec3(0,0,0)), 
                        hash(p+vec3(1,0,0)),f.x),
                   mix( hash(p+vec3(0,1,0)), 
                        hash(p+vec3(1,1,0)),f.x),f.y),
               mix(mix( hash(p+vec3(0,0,1)), 
                        hash(p+vec3(1,0,1)),f.x),
                   mix( hash(p+vec3(0,1,1)), 
                        hash(p+vec3(1,1,1)),f.x),f.y),f.z);
}

vec3 render(vec3 ro,vec3 rd) {
    vec3 col;
    vec2 rs=castRay(ro,rd);
    float t = rs.y;

    if(rs.x!=0.0) {
        vec3 p = ro + t*rd;
        vec3 n = getNormal(p);
        col=vec3(1.0);
        //col*=ambOccl(p,n);
        col*=calcAO(p,n);
        vec3 pp=floor(p*10000.0)/10000.0;
        //col*=clamp(noise(pp*1000.0),0.8,1.0);
        
        vec3 lightPos=vec3(0.0,0.0,0.0);
        lightPos.x=cos(iTime*0.5)*10.0;
        lightPos.z=sin(iTime*0.5)*10.0;
        
        col*=normalize(n)*0.5+0.5;
        
        
        //col*=calcPtLightCol(p,n,lightPos,vec3(0.9,0.01,0.001),col,vec3(1.0),0.1,0.1);
        //col+=vec3(0.2);
    } else {
        col= vec3(0.1);
    }

    return col;
}

void main(){
    vec3 primary=normalize(vec3(screen.x*aspect,screen.y,-1.0/tan(fovy*0.5)));
    vec3 rd=normalize(viewRot*primary);
    vec3 ro=viewPos;

    vec3 c=render(ro,rd);
    outColor=vec4(c,1.0);
}
