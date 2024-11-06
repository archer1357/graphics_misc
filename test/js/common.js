
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
    var accumTime;
    var lastTime;
    
    return((curTime,stepTime,maxSteps,onStep,onInterp)=>{
        var stepCount=0;
        accumTime=accumTime||curTime;
        
        lastTime=lastTime||curTime;        
        var deltaTime=curTime-lastTime;
        lastTime=curTime;
        
        while(accumTime+stepTime <= curTime){
            stepCount+=1;
            accumTime+=stepTime;
            onStep(stepTime);
            accumTime=(stepCount>=maxSteps)?curTime:accumTime;
        }

        onInterp(stepTime,(curTime-accumTime)/stepTime,deltaTime);
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
            
            f=(x)=>{msgElement.innerHTML=((name=="")?"":(name?name+' : ':''))+x.replace('\n','<br/>')+'<br/>';};
            
            if(name || name=="") {
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

(()=>{
    var canvas;
    
    function onAnimate() {
        if(!onRun(canvas)) {
            return;
        }
        
        window.requestAnimationFrame(onAnimate);
    }

    window.onload=(()=>{
        canvas=document.getElementById('canvas');    
        canvas.onselectstart=null;

        if(!onInit(canvas)) {
            return;
        }
        
        onAnimate();
    });
})();
