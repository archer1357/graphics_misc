function mat3_rotX(a) {
    var c=Math.cos(a);
    var s=Math.sin(a);
    return [1,0,0, 0,c,s, 0,-s,c];
}

function mat3_rotY(a) {
    var c=Math.cos(a);
    var s=Math.sin(a);
    return [c,0,-s, 0,1,0, s,0,c];
}

function mat3_mul(a,b) {
    if(b.length==9) {
        var out=new Array(9);

        for(var i=0;i<3;i++) {
          for(var j=0;j<3;j++){
            var x=0;

            for(var k=0;k<3;k++){
              x+=a[k*3+i]*b[j*3+k];
            }

            out[j*3+i]=x;
          }
        }
        
        return out;
    } else if(b.length==3) {
        var out=[0,0,0];

        for(var i=0;i<3;i++) {
            for(var j=0;j<3;j++){
                out[i]+=a[j*3+i]*b[j];
            }
        }
        
        return out;
    }    
}

function vec3_dot(a,b) {
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
}

function vec3_len(v) {
    return Math.sqrt(vec3_dot(v,v));
}

function vec3_nor(a) {
    return vec3_div(a,vec3_len(a));
}
function vec3_eq(a,b) {
    return isNaN(b)?(a[0]==b[0]&&a[1]==b[1]&&a[2]==b[2]):(a[0]==b&&a[1]==b&&a[2]==b);
}

function vec3_mul(a,b) {
    return isNaN(b)?[a[0]*b[0],a[1]*b[1],a[2]*b[2]]:[a[0]*b,a[1]*b,a[2]*b];
}

function vec3_div(a,b) {
    return isNaN(b)?[a[0]/b[0],a[1]/b[1],a[2]/b[2]]:[a[0]/b,a[1]/b,a[2]/b];
}

function vec3_add(a,b) {
    return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]
}

function vec3_lerp(x,y,a) {
    return [lerp(x[0],y[0],a),lerp(x[1],y[1],a),lerp(x[2],y[2],a)];
}

function lerp(x,y,a) {
    return x*(1-a)+y*a;
}

function clamp(x,minVal,maxVal) {
    return Math.min(Math.max(x, minVal), maxVal);
}

function smoothstep(edge0,edge1,x) {
    var t=clamp((x-edge0)/(edge1-edge0), 0,1);
    return t*t*(3-2*t);
}

function clampRadiansRange(rad) {
    return rad+((rad<-Math.PI)?Math.PI*2:0)-((rad>=Math.PI)?Math.PI*2:0);
}


function leastSquaresLine3(xs,ys,n) {
  var sumX=0,sumX2=0,sumY=0,sumXY=0;

    
  //for(var i=n-1;i>=0;i--)
  for(var i=0;i<n;i++)
  {
      var x=xs[i];
      var y=ys[i];

      
    sumX+=x;
    sumX2+=x*x;
    sumY+=y;
    sumXY+=x*y;
  }

  // www.efunda.com/math/leastsquares/lstsqr1dcurve.cfm
  var m=(n*sumXY-sumX*sumY)/(n*sumX2-sumX*sumX);
  // b=(sumY*sumX2-sumX*sumXY)/(n*sumX2-sumX*sumX);

  // youtu.be/1pawL_5QYxE
  //var b=(sumY-m*sumX)/n;

  //
  //return {gradient:m,intercept:b};
  return m;
}


function leastSquaresLine(space,ys) {
    //var sumX=ys.reduce((t,y)=>t+space);
    //var sumX2=ys.reduce((t,y)=>t+space*space);
    
    var sumX=0,sumX2=0,sumY=0,sumXY=0;
    var x=0;
    
    for(var i=0;i<ys.length;i++) {
        var y=ys[i];

        sumX+=x;
        sumX2+=x*x;
        sumY+=y;
        sumXY+=x*y;
    
        x+=space;
    }

  // www.efunda.com/math/leastsquares/lstsqr1dcurve.cfm
  return (ys.length*sumXY-sumX*sumY)/(ys.length*sumX2-sumX*sumX);
}

function trapezoidRule(space,ys) {
    var s=ys[0]+ys[ys.length-1];
    
    for(var i=1;i<ys.length-1;i++) {
        s+=2*ys[i];
    }
    
    var b=space*ys.length;
    var n=ys.length-1;
    return (b/(2*n))*s;
}

function trapezoidRule2(space,ys) {
    return ((space*ys.length)/(2*(ys.length-1)))*(ys[0]+ys.slice(1,ys.length-1).reduce((b,a)=>b+2*a)+ys[ys.length-1]);
}


function vec2_length(a,b) {
    return Math.sqrt(a*a+b*b);
}

function vec2_vecmin(out,v,m) {
    var len=vec2_length(v[0],v[1]);
    var tmp=v.slice();
    
    if(len>0) {
        tmp[0]/=len;
        tmp[1]/=len;
        len=Math.min(len,m);
        tmp[0]*=len;
        tmp[1]*=len;
    }
    
    out[0]=tmp[0];
    out[1]=tmp[1];
    
    return out;
}


function pidController(dt,errs) {
    var P=errs[0];
    var I=trapezoidRule(dt,errs);
    var D=-leastSquaresLine(dt,errs);
    return [P,I,D];
}
