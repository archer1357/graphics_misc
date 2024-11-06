
function createKeyInput(element) {
    var inputs=[];
    var inputNames={};
        
    const UP=0,RELEASED=1,DOWN=2,PRESS=3;
    
    function sizeInputs(c) {
        while(inputs.length<=c) { inputs.push(UP);  }
    }

    function setInput(event,s) {
        var c=event.keyCode;
        
        sizeInputs(c);
        
        inputs[c]=(s==DOWN && inputs[c]!=DOWN)?PRESS:inputs[c];
        inputs[c]=(s==UP && inputs[c]!=UP)?RELEASED:inputs[c];
    
        inputNames[event.key.toUpperCase()]=c;
    }

    function getInput(c) {
        sizeInputs(c);
        
        if(typeof c == 'string') {
            var cc=c.toUpperCase();
            return inputs[(cc in inputNames)?inputNames[cc]:UP];
        }
        
        return inputs[c];
    }
    
    function updateAfter() {
        for(var i=0;i<inputs.length;i++) {
            inputs[i]=(inputs[i]==PRESS)?DOWN:inputs[i];
            inputs[i]=(inputs[i]==RELEASED)?UP:inputs[i];
        }
    }
    
    element.addEventListener("keypress", ((event)=>{

    }),true);
    
    element.addEventListener("keydown", ((event)=>{
        setInput(event,DOWN);
    }),true);
    
    element.addEventListener("keyup", ((event)=>{
        setInput(event,UP);
    }),true);

    return {
        down:(c)=>(getInput(c)==DOWN || getInput(c)==PRESS),
        up:(c)=>(getInput(c)==UP || getInput(c)==RELEASED),
        press:(c)=>(getInput(c)==PRESS),
        depress:(c)=>(getInput(c)==RELEASED),
        
        updateAfter: updateAfter
    };
}

function createMouseInput(element) {
    var cursor=[element.offsetWidth*0.5,element.offsetHeight*0.5];
    var move=[0,0];
    var scroll=[0,0];
    var inputs=[];
    
    const UP=0,RELEASED=1,DOWN=2,PRESS=3;
    
    function sizeInputs(c) {
        while(inputs.length<=c) { inputs.push(UP);  }
    }

    function setInput(event,s) {
        var c=event.button;
        
        sizeInputs(c);
        
        inputs[c]=(s==DOWN && inputs[c]!=DOWN)?PRESS:inputs[c];
        inputs[c]=(s==UP && inputs[c]!=UP)?RELEASED:inputs[c];
    }

    function getInput(c) {
        sizeInputs(c);
        return inputs[c];
    }
    
    function updateAfter() {
        for(var i=0;i<inputs.length;i++) {
            inputs[i]=(inputs[i]==PRESS)?DOWN:inputs[i];
            inputs[i]=(inputs[i]==RELEASED)?UP:inputs[i];
        }
        
        move[0]=move[1]=0;
        scroll[0]=scroll[1]=0;
    }
    
    element.addEventListener("mousedown", ((event)=>{
        setInput(event,DOWN);
    }),true);
    
    element.addEventListener("mouseup", ((event)=>{
        setInput(event,UP);
    }),true);
    
    element.addEventListener("mousemove", ((event)=>{
        move[0]+=event.movementX;
        move[1]+=event.movementY;
                
        cursor[0]=event.clientX-element.offsetLeft;
        cursor[1]=event.clientY-element.offsetTop;
    }));
    
    element.addEventListener("wheel", ((event)=>{
        //event.preventDefault();
        scroll[0]+=event.deltaX;
        scroll[1]+=event.deltaY;
    }),{passive: false});
    
    
    return {
        down:(c)=>(getInput(c)==DOWN || getInput(c)==PRESS),
        up:(c)=>(getInput(c)==UP || getInput(c)==RELEASED),
        press:(c)=>(getInput(c)==PRESS),
        depress:(c)=>(getInput(c)==RELEASED),
        
        cursorX:()=>cursor[0],
        cursorY:()=>cursor[1],
        moveX:()=>move[0],
        moveY:()=>move[1],
        scrollX:()=>scroll[0],
        scrollY:()=>scroll[1],
        
        updateAfter: updateAfter
    };
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

function createShadertoyMouseInput(element) {
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

function createPinchInput(element) {
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

                scroll[0]+=x*Math.abs(mx-mx2)* 2;
                scroll[1]+=t*Math.abs(my-my2)* -2;

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

function createPanInput(element) {
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

                scroll[0]+=x;
                scroll[1]+=y;
                
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

function createInputManager(canvas) {

    var keyInput=createKeyInput(window);
    var mouseInput=createMouseInput(canvas);
    
    var funcs=[];
    var vals={};
    
    function begin() {
        for(k in vals) { 
            vals[k]=0; 
        }
        
        for(var i=0;i<funcs.length;i++) {
            funcs[i]();
        }
    }
    
    function end() {
        keyInput.updateAfter();
        mouseInput.updateAfter();
    }
    
    function initVal(name) {
        if(!(name in vals)) {
            vals[name]=0;
        }
    }
    
    function addKeyDown(name, key, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=keyInput.down(key)?scale:0;});
    }
    
    function addKeyUp(name, key, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=keyInput.up(key)?scale:0;});
    }
    
    function addKeyPress(name, key, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=keyInput.press(key)?scale:0;});
    }
    
    function addKeyDepress(name, key, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=keyInput.depress(key)?scale:0;});
    }
    
    function addMouseDown(name, key, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=mouseInput.down(key)?scale:0;});
    }
    
    function addMouseUp(name, key, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=mouseInput.up(key)?scale:0;});
    }
    
    function addMousePress(name, key, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=mouseInput.press(key)?scale:0;});
    }
    
    function addMouseDepress(name, key, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=mouseInput.depress(key)?scale:0;});
    }
    
    function addMouseMoveX(name, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=mouseInput.moveX()*scale;});
    }
     
    function addMouseMoveY(name, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=mouseInput.moveY()*scale;});
    }
    
    function addMouseScrollX(name, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=mouseInput.scrollX()*scale;});
    }
     
    function addMouseScrollY(name, scale=1) {
        initVal(name); funcs.push(()=>{vals[name]+=mouseInput.scrollY()*scale;});
    }
    
    function addMouseCursorX(name) {
        initVal(name); funcs.push(()=>{vals[name]+=mouseInput.cursorX();});
    }
     
    function addMouseCursorY(name) {
        initVal(name); funcs.push(()=>{vals[name]+=mouseInput.cursorY();});
    }
    
    function getVal(...args) {
        return (args.length==1)?vals[args[0]]:args.map(x=>vals[x]);
    }
    
    return {
        "begin" : begin,
        "end" : end,
        
        "keyDown" : addKeyDown,
        "keyUp" : addKeyUp ,
        "keyPress" : addKeyPress,
        "keyDepress" : addKeyDepress,
        
        "mouseDown" : addMouseDown,
        "mouseUp" : addMouseUp,
        "mousePress" : addMousePress,
        "mouseDepress" : addMouseDepress,
        
        "mouseMoveX" : addMouseMoveX,
        "mouseMoveY" : addMouseMoveY,
        
        "mouseScrollX" : addMouseScrollX,
        "mouseScrollY" : addMouseScrollY,
        
        "mouseCursorX" : addMouseCursorX,
        "mouseCursorY" : addMouseCursorY,
        
        "get" : getVal
    };
    
}