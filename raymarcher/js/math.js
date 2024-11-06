var vec3=vec3||{};
var vec4=vec4||{};
var mat3=mat3||{};
var mat4=mat4||{};

vec3.add=(...args)=>{
    var result=[0,0,0];

    for(var i=0;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(3)).fill(args[i]);
        result.forEach((x,j)=>{result[j]+=arg[j]});
    }
    
    return result;
}

vec4.add=(...args)=>{
    var result=[0,0,0,0];
    
    for(var i=0;i<args.length;i++) {
        var arg=Array.isArray(arg)?args[i]:(new Array(4)).fill(args[i]);
        result.forEach((x,j)=>{result[j]+=arg[j]});
    }
    
    return result;
}

vec3.sub=(...args)=>{
    var result=Array.isArray(args[0])?args[0].slice():(new Array(3)).fill(args[0]);
    
    if(args.length==1) {
        result.forEach((x,i)=>{result[i]=-x});
    }
   
    for(var i=1;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(3)).fill(args[i]);
        result.forEach((x,j)=>{result[j]-=arg[j]});
    }
    
    return result;
}

vec4.sub=(...args)=>{
    var result=Array.isArray(args[0])?args[0].slice():(new Array(4)).fill(args[0]);
    
    if(args.length==1) {
        result.forEach((x,i)=>{result[i]=-x});
    }
   
    for(var i=1;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(4)).fill(args[i]);
        result.forEach((x,j)=>{result[j]-=arg[j]});
    }
    
    return result;
}

vec3.mul=(...args)=>{
    var result=[1,1,1];

    for(var i=0;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(3)).fill(args[i]);
        result.forEach((x,j)=>{result[j]*=arg[j]});
    }
    
    return result;
}

vec4.mul=(...args)=>{
    var result=[1,1,1,1];
    
    for(var i=0;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(4)).fill(args[i]);
        result.forEach((x,j)=>{result[j]*=arg[j]});
    }
    
    return result;
}

vec3.div=(...args)=>{
    var result=Array.isArray(args[0])?args[0].slice():(new Array(3)).fill(args[0]);
       
    for(var i=1;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(3)).fill(args[i]);
        result.forEach((x,j)=>{result[j]/=arg[j]});
    }
    
    return result;
}

vec4.div=(...args)=>{
    var result=Array.isArray(args[0])?args[0].slice():(new Array(4)).fill(args[0]);
       
    for(var i=1;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(4)).fill(args[i]);
        result.forEach((x,j)=>{result[j]/=arg[j]});
    }
    
    return result;
}

vec3.dot=(a,b)=>{
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
}

vec4.dot=(a,b)=>{
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];
}

vec3.length=(a)=>{
    return Math.sqrt(vec3.dot(a,a));
}

vec3.normal=(a)=>{
    return vec3.mul(a,1/vec3.length(a));
}

vec3.cross=(a,b)=>{
    return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
}

vec3.to_x0z=(a)=>{
    return [a[0],0,a[2]];
}

vec3.eq=(a,b)=>{
    if(Array.isArray(b)) {
        return a[0]==b[0] && a[1]==b[1] && a[2]==b[2];
    } else {
        return a[0]==b && a[1]==b && a[2]==b;
    }
}

vec4.eq=(a,b)=>{
    if(Array.isArray(b)) {
        return a[0]==b[0] && a[1]==b[1] && a[2]==b[2] && a[3]==b[3];
    } else {
        return a[0]==b && a[1]==b && a[2]==b && a[3]==b;
    }
}

mat3.identity=()=> {
    return [1,0,0, 0,1,0, 0,0,1];
}

mat4.identity=()=>{
    return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}

mat3.to_col=(a,col)=>{
    return a.slice(col*3,(col+1)*3);
}

mat4.to_col=(a,col)=>{
    return a.slice(col*4,(col+1)*4);
}

function lerp(x,y,a) {
    return x*(1.0-a)+y*a;
}

vec3.interp=(x,y,a)=>{
    a=Array.isArray(a)?a:(new Array(3)).fill(a);
    return [0,1,2].map((i)=>lerp(x[i],y[i],a[i]))
}
