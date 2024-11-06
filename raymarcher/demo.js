var canvas,gl;
var sceneProg,fxaaProg,sdfTex;
var myMenu;
               
var camera=createFreeLookCameraControl({
    "pos":[0,5,4],
    "yaw":0,
    "pitch":0,
    "speed":20,
    "slow":20,
    "lookSpeed":0.005
});

var getTime=(()=>{var start=Date.now();return (()=>((Date.now()-start)/1000)%3.402823e+38);})();

var calcFPS=createFpsCounter();
var fixedTimeStep=createFixedTimeStep(1/1000,11115);

function setErrorMsg(msg) {
    var root=document.getElementById("root");
    root.innerHTML=hasError?root.innerHTML:'';
    hasError=true;
    root.innerHTML+='<pre>'+msg.replace("\n","<br/>");+'</pre>';
}

var addLog=(function(){
    var logElement; return (function(msg){
        logElement=logElement||document.getElementById("log");
        var m=document.createElement('span');
        m.innerHTML=msg.replace("\n","<br/>");
        var e=document.createElement('span');
        logElement.appendChild(document.createElement('br'));
        logElement.appendChild(m);
        logElement.appendChild(e);
        return (function bla(x){e.innerHTML=x.replace("\n","<br/>");return bla});
   });
})();

var updateBarFps=(function(){
   var element; return (function(x){
        element=element||document.getElementById("barFps");
        element.innerHTML = x.toFixed(1)  + " fps";
   });
})();

var updateBarTime=(function(){
   var element; return (function(x){
        element=element||document.getElementById("barTime");
        element.innerHTML = x.toFixed(2);
   });
})();

function onAnimate() {
    var resScale=1.0;
    var width=Math.floor(canvas.offsetWidth*resScale);
    var height=Math.floor(canvas.offsetHeight*resScale);
    
    var aspect=width/height;
    var fovy=Math.PI/4;
    
    
    //canvas.width=width;
    //canvas.height=height;
    
    var curTime=getTime();
    
    camera.update();
    
    //
    fixedTimeStep(curTime,(dt)=>{
        camera.step(dt);
    },(dt,it)=>{
        camera.render(dt,it);
    });
   
    //
    gl.viewport(0, 0, width,height);
    
    //
    gl.useProgram(sceneProg);
    
    uniform1f(gl,"iTime",curTime);
    uniform1f(gl,"aspect",aspect);
    uniform1f(gl,"fovy",fovy);
    uniform1i(gl,"iChannel0",0);
    
    uniform3fv(gl,"viewPos",camera.getPos());
    uniformMatrix3fv(gl,"viewRot",false,camera.getRot());
    
    //gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sdfTex);
    
    uniformsApply(gl,sceneProg);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    
    //gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, 0);
    //gl.useProgram(fxaaProg);
    //uniformsApply(gl,fxaaProg);
    //gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

    //
     
    updateBarFps(calcFPS());
    updateBarTime(curTime);

    requestAnimFrame(onAnimate);
}

function registerInputEvents(element) {
    (function(){
        //var lmb=false;

        window.addEventListener("keydown", (function(event){
                camera.keydown(event);
        }));
        
        window.addEventListener("keyup", (function(event){
                camera.keyup(event);
        }));

        element.addEventListener('mousemove', function(event) {
            if(PL.isEnabled()) { //|| (!PL.isSupported && lmb)
                camera.mousemove(event);
            }
        }, false);

        element.addEventListener("mousedown",function(event){
            if(event.button==0){
                //lmb=true;PL.requestPointerLock(element);
                
                if(PL.isEnabled()) {
                    PL.exitPointerLock();
                } else {
                    PL.requestPointerLock(element);
                }
            }
        });

        window.addEventListener("mouseup",function(event){
            //if(event.button==0&&lmb){ lmb=false; PL.exitPointerLock();}
        });
    })();
}

function initGui() {
    myMenu = {"lightAnimate":true,"lightPosX":0,"lightPosY":0,"lightPosZ":-1};
    
    var gui = new dat.GUI();
    gui.add(myMenu, 'lightAnimate');
    gui.add(myMenu, 'lightPosX', -20, 20).name('lightPosX').step(0.1);
    gui.add(myMenu, 'lightPosY', -20, 20).name('lightPosY').step(0.1);
    gui.add(myMenu, 'lightPosZ', -20, 20).name('lightPosZ').step(0.1);
}

function init() {
    canvas=document.getElementById("canvas");
    canvas.onselectstart=null;
    gl=createGLContext(canvas,{});

    if(!gl) { return; }
    
    registerInputEvents(canvas);
    

    //
    initGui();
    
    //
    createBindScreenGeometry(gl);
    
    var sceneProgPromise=getProgram(gl,"glsl/screen.glsl","glsl/scene.glsl");
    var fxaaProgPromise=getProgram(gl,"glsl/screen.glsl","glsl/fxaa.glsl");
    var sdfPromise=loadTexture2d(gl,"vault4.png",gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,true,false,false);
    
    sceneProgPromise.then((prog)=>{sceneProg=prog;},addLog);
    fxaaProgPromise.then((prog)=>{fxaaProg=prog;},addLog);
    sdfPromise.then((tex)=>{sdfTex=tex;},addLog);
    
    gl.enable(gl.CULL_FACE);
    
    Promise.all([sceneProgPromise,fxaaProgPromise,sdfPromise]).then((x)=>{
        onAnimate();
    });
}

window.onload=init;

window.onresize=(function(){window.scrollTo(0,0);});

window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (function(c,e){window.setTimeout(c,1000/60)});

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

