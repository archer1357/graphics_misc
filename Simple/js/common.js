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
			
			if(typeof onStep === "function") {
				onStep(stepTime);
			}
			
            accumTime=(stepCount==5)?curTime:accumTime;
        }
        
		if(typeof onInterp === "function") {
			onInterp(stepTime,(curTime-accumTime)/stepTime);
		}
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
    fixedTimeStep(getTime(),onStep, onRun);
    
    window.requestAnimationFrame(onAnimate);
}

var canvas,gl;

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

window.onload=(()=>{
	canvas=document.getElementById('canvas');
    canvas.onselectstart=null;
    
    if(!initGL(canvas)) {
        return false;
    }
	
    if((typeof onInit != "function") || !onInit()) {
        return;
    }
    
    log('started',null,5000);
    onAnimate();
});
