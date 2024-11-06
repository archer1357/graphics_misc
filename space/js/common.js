
var shaders={};

function createVertexShader(name,src) {
    var k=name+'_vs';
    
    shaders[k]=mygl.createShader(gl,gl.VERTEX_SHADER,src.trim(),(x)=>{
        log(k+':\n'+x);
    });
}

function createFragmentShader(name,src) {
    var k=name+'_fs';
    
    shaders[k]=mygl.createShader(gl,gl.FRAGMENT_SHADER,src.trim(),(x)=>{
        log(k+':\n'+x);
    });
}

function createProgram(vsName,fsName,beforeLink) {
    var k=vsName+' '+fsName;
    var vs=shaders[vsName+'_vs'];
    var fs=shaders[fsName+'_fs'];
    
    if(!vs || !fs) {
        return null;
    }
    
    return mygl.createProgram(gl,vs,fs,beforeLink,(x)=>{
        log(k+':\n'+x);
    });
}

var getTime=(()=>{
    var start;
    
    return(()=>{
        start=start||Date.now();
        return((Date.now()-start)/1000)%3.402823e+38;
    });
})();

var calcFPS=(()=>{
    var count=0,avg=0.0,last=0.0;
    
    return(()=>{
        var cur=Date.now()/1000.0;
        last=(last==0.0)?cur:last;
        var dt=cur-last;
        
        if(dt>=1.0){
            avg=count/dt;
            count=0;
            last=cur;
        }
        
        count++;
        return avg;
    });
})();

var fixedTimeStep=(()=>{
    var stepTime=1.0/60.0,accumTime;
    
    return((curTime,onStep,onInterp)=>{
        var stepCount=0;accumTime=accumTime||curTime;
        
        while(accumTime+stepTime <= curTime){
            stepCount+=1;
            accumTime+=stepTime;
            onStep(stepTime);
            accumTime=(stepCount==5)?curTime:accumTime;
        }
        
        onInterp(stepTime,(curTime-accumTime)/stepTime);
    });
})();

var log=(function(){
    var logs={},logElement;
   
    return (function(msg,name,timeout=0){
        logElement=logElement||document.getElementById('log');
        
        var f;
        
        if(name!=null && name in logs) {
            f=logs[name];
        } else {
            var msgElement=document.createElement('span');
            logElement.appendChild(msgElement);

            if(timeout!=0) {
                window.setTimeout(()=>{
                    if(name) {
                        delete logs[name];
                    }
                    
                    logElement.removeChild(msgElement);
                }, timeout);
            }
            
            f=(x)=>{msgElement.innerHTML=(name?name+' : ':'')+x.replace('\n','<br/>')+'<br/>';};
            
            if(name) {
                logs[name]=f;
            }
        }
        
        
        f(''+msg);
        
        return f;
   });
})();

window.onresize=(()=>{
    window.scrollTo(0,0);
});

function onAnimate() {
    if(!onRun()) {
        return;
    }
    
    window.requestAnimationFrame(onAnimate);
}

function onLoad() {
    if(!onInit()) {
        return;
    }
    
    onAnimate();
}

window.onload=onLoad;
