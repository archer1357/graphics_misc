
function createMouseInput(element) {
    var out={
        //cursor:[0,0],
        cursor:[element.offsetWidth*0.5,element.offsetHeight*0.5],
        move:[0,0],
        scroll:[0,0],
        
        down:[false,false,false],
        press:[false,false,false],
        release:[false,false,false]};
    
    element.addEventListener("mousedown", ((event)=>{
        if(event.button>=0 && event.button<=2) {
            out.press[event.button]=true;
            out.down[event.button]=true;
        }
    }));
    
    element.addEventListener("mouseup", ((event)=>{
        if(event.button>=0 && event.button<=2) {
            out.release[event.button]=true;
            out.down[event.button]=false;
        }
    }));
    
    element.addEventListener("mousemove", ((event)=>{
        out.move[0]=event.movementX;
        out.move[1]=event.movementY;
                
        out.cursor[0]=event.clientX-element.offsetLeft;
        out.cursor[1]=event.clientY-element.offsetTop;
    }));
    
    element.addEventListener("wheel", ((event)=>{
        out.scroll[0]=event.deltaX;
        out.scroll[1]=event.deltaY;
    }));
    
    out.updateAfter=()=>{
        out.move[0]=out.move[1]=0;
        out.scroll[0]=out.scroll[1]=0;
        
        out.press[0]=out.press[1]=out.press[2]=false;
        out.release[0]=out.release[1]=out.release[2]=false;
    }
    
    return out;
}


function createTouchInput(element) {
    var out={
        touch:[0,0],
        pan:[0,0],
        pinch:[0,0],
        
        down:false,
        press:false,
        release:false};
        
    out.updateAfter=()=>{
        out.pan[0]=out.pan[1]=0;
        out.pinch[0]=out.pinch[1]=0;
        
        out.press=false;
        out.release=false;
    }
    
    return out;
}

function shadertoyMouseInput(element) {
    return (function(){
        var cursor=[0,0,0,0],lmb=false;
        function onStart(q){
            cursor[0]=cursor[2]=q.clientX-element.offsetLeft;
            cursor[1]=cursor[3]=element.offsetTop+element.offsetHeight-q.clientY;
        }
        function onMove(q){
            cursor[0]=q.clientX-element.offsetLeft;
            cursor[1]=element.offsetTop+element.offsetHeight-q.clientY;
        }
        function onStop(q){
            cursor[2]*=-1;
            cursor[3]*=-1;
        }
        element.addEventListener("mousedown",function(event){
            if(event.button==0){lmb=true;onStart(event);}
        });
        element.addEventListener("mousemove",function(event){
            if(lmb){onMove(event);}
        });
        window.addEventListener("mouseup",function(event){
            if(event.button==0&&lmb){lmb=false;onStop();}
        });
        element.addEventListener('touchstart',function(event){
            event.preventDefault();
            onStart(event.targetTouches[0]);
        });
        element.addEventListener('touchmove',function(event){
            event.preventDefault();
            onMove(event.targetTouches[0]);
        });
        element.addEventListener('touchend',function(event){
            event.preventDefault();
            onStop();
        });
        element.addEventListener('touchcancel',function(event){
            event.preventDefault();
            onStop();
        });
        return cursor;
    })();
}


function pinchInput(element) {
    return (function(){
        var ok=false;
        var lx,ly,lx2,ly2;
        var scroll=[0,0];

        element.addEventListener('touchmove', (function(event) {
            event.preventDefault();

            if(event.targetTouches.length == 2) {
                var mx=ok?(event.targetTouches[0].clientX-lx):0;
                var my=ok?(event.targetTouches[0].clientY-ly):0;
                var mx2=ok?(event.targetTouches[1].clientX-lx2):0;
                var my2=ok?(event.targetTouches[1].clientY-ly2):0;

                var x=0,t=0;
                x+=(mx>0 && mx2 <0)?-1:0;
                x+=(mx<0 && mx2 >0)?1:0;
                x*=(event.targetTouches[0].clientX<event.targetTouches[1].clientX)?-1:1;

                t+=(my>0 && my2 <0)?-1:0;
                t+=(my<0 && my2 >0)?1:0
                t*=(event.targetTouches[0].clientY<event.targetTouches[1].clientY)?-1:1;

                scroll[0]=x*Math.abs(mx-mx2)* 2;
                scroll[1]=t*Math.abs(my-my2)* -2;

                lx=event.targetTouches[0].clientX;
                ly=event.targetTouches[0].clientY;
                lx2=event.targetTouches[1].clientX;
                ly2=event.targetTouches[1].clientY;
                ok=true;
            }
        }));

        element.addEventListener('touchend', (function(event){ok=false;}));
        element.addEventListener('touchcancel', (function(event){ok=false;}));

        return scroll;
    })();
}

function panInput(element) {
    return (function(){
        var ok=false;
        var lx,ly,lx2,ly2;
        var scroll=[0,0];

        element.addEventListener('touchmove', (function(event) {
            event.preventDefault();

            if(event.targetTouches.length == 2) {
                var mx=ok?(event.targetTouches[0].clientX-lx):0;
                var my=ok?(event.targetTouches[0].clientY-ly):0;
                var mx2=ok?(event.targetTouches[1].clientX-lx2):0;
                var my2=ok?(event.targetTouches[1].clientY-ly2):0;

                var x=(Math.sign(mx)==Math.sign(mx2))?(mx+my)/2:0
                var y=(Math.sign(my)==Math.sign(my2))?(my+my)/2:0

                scroll[0]=x;
                scroll[1]=y;
                
                lx=event.targetTouches[0].clientX;
                ly=event.targetTouches[0].clientY;
                lx2=event.targetTouches[1].clientX;
                ly2=event.targetTouches[1].clientY;
                ok=true;
            }
        }));

        element.addEventListener('touchend', (function(event){ok=false;}));
        element.addEventListener('touchcancel', (function(event){ok=false;}));

        return scroll;
    })();
}