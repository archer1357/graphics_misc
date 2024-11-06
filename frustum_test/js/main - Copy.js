
var gfx=new MyGraphics();
var canvas;//,gl;
var mouse;

function initGL(canvas) {
    if(!(gl=mygl.createContext(canvas,{
        antialias:true,
        premultipliedAlpha:false,
        alpha:false,
    },(err)=>{
        canvas.parentNode.innerHTML=err;
    }))){
        return false;
    }
    
   
    return true;
}

function onInit() {
    canvas=document.getElementById('canvas');
    canvas.onselectstart=null;
    
    //if(!initGL(canvas)) {
    //    return false;
    //}
    
    if(!gfx.init(canvas,(err)=>{canvas.parentNode.innerHTML=err;})) {
        return false;
    }
    
    //console.log(gfx)
    mouse=createMouseInput(canvas);
    log('started',null,5000);
    return true;
}


function onStep(dt) {
    return true;

}

function onRender(dt,it) {

    //proj
    var projMat=glMatrix.mat4.create();
    glMatrix.mat4.perspective(projMat, Math.PI/2, canvas.width/canvas.height, 1, 100);
    
    //view
    var viewMat=glMatrix.mat4.create();
    glMatrix.mat4.identity(viewMat);
  
    //viewProj
    var viewProjMat=glMatrix.mat4.create();
    glMatrix.mat4.mul(viewProjMat,projMat,viewMat);
    
    //invViewProj
    var invViewProjMat=glMatrix.mat4.create();
    glMatrix.mat4.invert(invViewProjMat,viewProjMat);
    
  
    
    //clear
    gfx.color_clear(1,1,0,1);
    
    //
    return true;
}

function onRun() {
    //.map(x=>x.toFixed(1))
    log([mouse.cursor[0],canvas.height-mouse.cursor[1]],'mouse pos');
   
    log(mouse.move,'mouse move');
    log(mouse.down[0],'mouse left');
    
    //
    if(mouse.press[0]) {
        canvas.requestPointerLock();
    }
    
    if(mouse.release[0]) {
        document.exitPointerLock();
    }
    
    
    //
    fixedTimeStep(getTime(),onStep,onRender);
    
    //
    mouse.updateAfter();
    
    //
    log(calcFPS().toFixed(1),'fps');
    return true;
}
