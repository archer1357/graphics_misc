
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

function mat3_rotYX(a,b) {
    return mat3_mul_mat3(mat3_rotY(a),mat3_rotX(b));
}

function mat3_mul_mat3(a,b) {
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
}

function mat3_mul_vec3(a,b) {
    var out=[0,0,0];

    for(var i=0;i<3;i++) {
        for(var j=0;j<3;j++){
            out[i]+=a[j*3+i]*b[j];
        }
    }

    return out;
}

function mat4_mul_mat4(a,b) {
    var out=[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];

    for(var i=0;i<4;i++) {
        for(var j=0;j<4;j++){
            for(var k=0;k<4;k++){
                out[j*4+i]+=a[k*4+i]*b[j*4+k];
            }
        }
    }

    return out;
}

function mat4_ortho(left,right,bottom,top,zNear,zFar) { 
    var x=2.0/(right-left);
    var y=2.0/(top-bottom);
    var z=-2.0/(zFar-zNear);
    
    var a=-(right+left)/(right-left);
    var b=-(top+bottom)/(top-bottom);
    var c=-(zFar+zNear)/(zFar-zNear);

    return [
        x,0,0,0,
        0,y,0,0,
        0,0,z,0,
        a,b,c,1];
}

function mat4_mul_vec4(a,b) {
    var out=[0,0,0,0];
    
    for(var i=0;i<4;i++) {
        for(var j=0;j<4;j++){
            out[i]+=a[j*4+i]*b[j];
        }
    }

    return out;
}

function mat4_translate(loc) {
    return [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        loc[0],loc[1],loc[2],1
    ];
}

function mat4_scale(scale) {
    return [
        scale[0],0,0,0,
        0,scale[1],0,0,
        0,0,scale[2],0,
        0,0,0,1
    ];
}

function mat4_identity() {
    return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}

function mat4_inverse(a) {
    var a00=a[0],a01=a[1],a02=a[2],a03=a[3];
    var a10=a[4],a11=a[5],a12=a[6],a13=a[7];
    var a20=a[8],a21=a[9],a22=a[10],a23=a[11];
    var a30=a[12],a31=a[13],a32=a[14],a33=a[15];
    var b00=a00*a11-a01*a10;
    var b01=a00*a12-a02*a10;
    var b02=a00*a13-a03*a10;
    var b03=a01*a12-a02*a11;
    var b04=a01*a13-a03*a11;
    var b05=a02*a13-a03*a12;
    var b06=a20*a31-a21*a30;
    var b07=a20*a32-a22*a30;
    var b08=a20*a33-a23*a30;
    var b09=a21*a32-a22*a31;
    var b10=a21*a33-a23*a31;
    var b11=a22*a33-a23*a32;

    var det=1.0/(b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06);

    return [
        (a11*b11-a12*b10+a13*b09)*det,
        (a02*b10-a01*b11-a03*b09)*det,
        (a31*b05-a32*b04+a33*b03)*det,
        (a22*b04-a21*b05-a23*b03)*det,
        (a12*b08-a10*b11-a13*b07)*det,
        (a00*b11-a02*b08+a03*b07)*det,
        (a32*b02-a30*b05-a33*b01)*det,
        (a20*b05-a22*b02+a23*b01)*det,
        (a10*b10-a11*b08+a13*b06)*det,
        (a01*b08-a00*b10-a03*b06)*det,
        (a30*b04-a31*b02+a33*b00)*det,
        (a21*b02-a20*b04-a23*b00)*det,
        (a11*b07-a10*b09-a12*b06)*det,
        (a00*b09-a01*b07+a02*b06)*det,
        (a31*b01-a30*b03-a32*b00)*det,
        (a20*b03-a21*b01+a22*b00)*det];
}

function mat4_mul_vec3_xyz0(m,v) {
    return mat4_mul_vec4(m,[v[0],v[1],v[2],0]);
}

function mat4_mul_vec3_xyz1(m,v) {
    return mat4_mul_vec4(m,[v[0],v[1],v[2],1]);
}

function mat4_mul_vec2_xy01(m,v) {
    return mat4_mul_vec4(m,[v[0],v[1],0,1]);
}

function mat4_lookAt(eye,at,up) {
    var z = vec3_nor(vec3_sub_vec3(eye,at));
    var x = vec3_nor(vec3_cross(up,z));
    var y = vec3_nor(vec3_cross(z,x));
    var a=-vec3_dot(x,eye);
    var b=-vec3_dot(y,eye);
    var c=-vec3_dot(z,eye);
    return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, a,b,c,1];
}

function vec3_neg(a) {
    return [-a[0],-a[1],-a[2]];
}

function vec3_cross(a,b) {
    return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
}

function vec3_dot(a,b) {
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
}

function vec3_len(v) {
    return Math.sqrt(vec3_dot(v,v));
}

function vec3_nor(a) {
    return vec3_div_scalar(a,vec3_len(a));
}

function vec3_safe_nor(a) {
    return vec3_eq_scalar(a,0)?[0,0,0]:vec3_nor(a);
}

function vec3_eq_scalar(a,b) {
    return (a[0]==b&&a[1]==b&&a[2]==b);
}

function vec3_eq_vec3(a,b) {
    return (a[0]==b[0]&&a[1]==b[1]&&a[2]==b[2]);
}

function vec3_mul_scalar(a,b) {
    return [a[0]*b,a[1]*b,a[2]*b];
}

function vec3_mul_vec3(a,b) {
    return [a[0]*b[0],a[1]*b[1],a[2]*b[2]];
}

function vec3_div_scalar(a,b) {
    return [a[0]/b,a[1]/b,a[2]/b];
}

function vec3_div_vec3(a,b) {
    return [a[0]/b[0],a[1]/b[1],a[2]/b[2]];
}

function vec3_add_scalar(a,b) {
    return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]
}

function vec3_add_vec3(a,b) {
    return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]
}

function vec3_sub_vec3(a,b) {
    return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]
}

function vec3_lerp(x,y,a) {
    return [lerp(x[0],y[0],a),lerp(x[1],y[1],a),lerp(x[2],y[2],a)];
}

function vec3_smooth_lerp(x,y,a) {
    var b=smoothstep(0,1,a);
    return [lerp(x[0],y[0],b),lerp(x[1],y[1],b),lerp(x[2],y[2],b)];
}

function vec3_unproject(invViewProjMat,screenPos,viewport) {
    var screenPosY=viewport[3]-screenPos[1]-1;
    
    var x=((screenPos[0]-viewport[0])/viewport[2])*2 - 1;
    var y=((screenPosY-viewport[1])/viewport[3])*2 - 1;
  
    var z=screenPos[2]||0;
    var p=mat4_mul_vec4(invViewProjMat,[x,y,z,1]);
    return p.slice(0,3).map(x=>x/p[3]);
}


function vec3_project(viewProjMat, worldPos, viewport) {
    var p=mat4_mul_vec3_xyz1(viewProjMat,worldPos);
    var x=((p[0]/p[3])*0.5+0.5)*viewport[2]+viewport[0];
    var y=((p[1]/p[3])*0.5+0.5)*viewport[3]+viewport[1];
    return [x,y];
} 

function lerp(x,y,a) {
    return x*(1-a)+y*a;
}

function smooth_lerp(x,y,a) {
    return lerp(x,y,smoothstep(0,1,a));
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

function vec2_to_vec3_xy0(a) {
    return [a[0],a[1],0];
}

function vec2_to_vec3_x0y(a) {
    return [a[0],0,a[1]];
}

function vec2_to_vec3_x0ny(a) {
    return [a[0],0,-a[1]];
}

function vec2_mul_scalar(a,b) {
    return [a[0]*b,a[1]*b];
}

function vec2_div_scalar(a,b) {
    return [a[0]/b,a[1]/b];
}

function vec2_mul_vec2(a,b) {
    return [a[0]*b[0],a[1]*b[1]];
}

function vec2_div_vec2(a,b) {
    return [a[0]/b[0],a[1]/b[1]];
}

function vec2_sub_vec2(a,b) {
    return [a[0]-b[0],a[1]-b[1]];
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

function topViewCalcProjMat(zoom,screenSize) {
    var right=screenSize[0]*0.5*zoom;
    var top=screenSize[1]*0.5*zoom;
    return mat4_ortho(-right,right,-top,top,-1,1);
}

function topViewUpdate(curPosZoom,moving,zooming,cursor,screenSize,zoomRange) {

    var oldZoom=curPosZoom[2];
    curPosZoom[2]+=zooming;
    curPosZoom[2]=Math.min(Math.max(curPosZoom[2], zoomRange[0]), zoomRange[1]);
    var zoomDif=curPosZoom[2]-oldZoom;
    
    //if(mouse.down[0]) {
        curPosZoom[0]+=moving[0]*curPosZoom[2]; 
        curPosZoom[1]+=moving[1]*curPosZoom[2]; 
    //}
    
    //curPosZoom[0]+=touch.pan[0]*curPosZoom[2];
    //curPosZoom[1]+=touch.pan[1]*curPosZoom[2];

    curPosZoom[0]-=(cursor[0]-screenSize[0]*0.5)*zoomDif;
    curPosZoom[1]-=(cursor[1]-screenSize[1]*0.5)*zoomDif;

}
/*{
   var oldZoom=view.zoom;
    view.zoom+=mouse.scroll[1]*0.001;
    view.zoom=Math.min(Math.max(view.zoom, 1), view.zoomMax);
    var zoomDif=view.zoom-oldZoom;
    
    if(mouse.down[0]) {
        view.x+=mouse.move[0]*view.zoom;
        view.y+=mouse.move[1]*view.zoom;
    }

    view.x+=(mouse.cursor[0]-canvas.width*0.5)*zoomDif;
    view.y+=(mouse.cursor[1]-canvas.height*0.5)*zoomDif;

    glMatrix.mat4.ortho(projMat,-canvas.width*0.5*view.zoom,canvas.width*0.5*view.zoom,-canvas.height*0.5*view.zoom,canvas.height*0.5*view.zoom,-1,1);
    glMatrix.mat4.translate(viewMat,viewMat,[view.x,-view.y,0]);
  
 }*/

function smoothVelCalc(lastVel,moveDir,stepTime,accelRate,decelRate,maxSpeed) {
    var accel=(vec3_dot(moveDir,lastVel) > 0)?accelRate:decelRate;
    var target=vec3_mul_scalar(moveDir,maxSpeed);
    return vec3_lerp(lastVel,target,accel*stepTime);
}

function smoothMovementCalc(
    pos,nextPos,vel,
    moveDir,stepTime,
    accelRate, decelRate, maxSpeed) {

    var vel2=smoothVelCalc(vel, moveDir, stepTime, accelRate, decelRate, maxSpeed);    
    var nextVel2=smoothVelCalc(vel2, moveDir, stepTime, accelRate, decelRate,maxSpeed);
 
    var pos2 = vec3_add_vec3(pos, vec3_mul_scalar(vel2, stepTime));
    var nextPos2 = vec3_add_vec3(pos2, vec3_mul_scalar(nextVel2, stepTime));
        
    for(var i=0;i<3;i++) {
        vel[i]=vel2[i];
        pos[i]=pos2[i];
        nextPos[i]=nextPos2[i];
    }
}

    //proj
    //var projMat=glMatrix.mat4.create();
    //glMatrix.mat4.ortho(projMat,-screenSize[0]*0.5*curPosZoom[2],screenSize[0]*0.5*curPosZoom[2],-screenSize[1]*0.5*curPosZoom[2],screenSize[1]*0.5*curPosZoom[2],-1,1);
   
    //view
    //var viewMat=glMatrix.mat4.create();
    //glMatrix.mat4.translate(viewMat,viewMat,[curPosZoom[0],-curPosZoom[1],0]);
    //glMatrix.mat4.scale(viewMat,viewMat,[3,3,1]);
  
    //viewProj
    //var viewProjMat=glMatrix.mat4.create();
    //glMatrix.mat4.mul(viewProjMat,projMat,viewMat);
    
    //invViewProj
    //var invViewProjMat=glMatrix.mat4.create();
    //glMatrix.mat4.invert(invViewProjMat,viewProjMat);
    
    //cursorWorldPos
    //glMatrix_unproject(worldCursor,[cursorX,screenSize[1]-cursorY,0], invViewProjMat, [0,0,screenSize[0],screenSize[1]]);
    //log(worldCursor.slice(0,2).map(x=>Math.floor(x)),'cursor => world');
    