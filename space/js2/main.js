
var canvas,gl;
var squareProg,squareVao;
var particleInitProg,particleCalcProg,particleDrawProg;

var mouse,touch;
var view={x:0,y:0,zoom:2.5, zoomMax:5};
var worldCursor=glMatrix.vec3.create();


function createShip(t,x,y,vx,vy,a){
    var entity={
        position:[x,y],
        velocity:[vx,vy],
        team:t,
        nearest:[],
        facing:a,
        targetFacing:a,
        turnRate:2.5,
        thrust:[0,0],
        thrustMax:50,
        xThrustErrs:(new Array(3)).fill(0),
        yThrustErrs:(new Array(3)).fill(0),
        thrustPIDRatios:[1.01,0.1,8.8],//[1,1,20],
        dimFront:8,
        dimBack:-7,
    };
    
    
    return addEntity(entity);
}

function createParticle(x,y,vx,vy,life,col){
    var entity={
        position:[x,y],
        velocity:[vx,vy],
        col:col?col:[1,1,1],
        age:0,
        life:life
    };
    
    return addEntity(entity);
}

function initShaders() {
    createVertexShader('square',`
        #version 300 es
        layout(location=0) in vec2 a_pos;
        uniform mat4 u_viewProjMat;
        uniform mat3 u_modelMat;
        void main() {
            gl_Position=u_viewProjMat*vec4(u_modelMat*vec3(a_pos*0.5,1.0),1.0);
        }
    `);
    
    createFragmentShader('square',`
        #version 300 es
        precision highp float;
        uniform vec3 u_col;
        out vec4 outColor;
        void main() {    
           outColor=vec4(u_col,1.0);
        }
    `);

    createVertexShader('particleInit',`
        #version 300 es
        precision mediump float;
        
        layout(location=0) in vec2 a_pos;
        layout(location=1) in vec2 a_vel;
        layout(location=2) in float a_age;
        layout(location=3) in float a_life;
        
        uniform vec2 u_pos;
        uniform vec2 u_vel;
        uniform float u_age;
        uniform float u_life;
        
        out vec2 v_pos;
        out vec2 v_vel;
        out float v_age;
        out float v_life;
        
        void main() {
            v_pos=u_pos;
            v_vel=u_vel;
            v_age=u_age;
            v_life=u_life;
        }
    `);
    /*
    createVertexShader('particleCalc',`
        #version 300 es
        precision mediump float;
        
        layout(location=0) in vec2 a_pos;
        layout(location=1) in vec2 a_vel;
        layout(location=2) in float a_age;
        layout(location=3) in float a_life;
        
        uniform float u_dt;
        
        out vec2 v_pos;
        out vec2 v_vel;
        out float v_age;
        out float v_life;
        
        void main() {
            v_pos = a_pos + a_vel * u_dt;
            v_age = a_age + u_dt;
            v_life = a_life;
            v_vel = a_vel;
        }
        



        
        uniform float u_TimeDelta;
        uniform vec2 u_Gravity;
        uniform vec2 u_Origin;
        uniform float u_MinTheta;
        uniform float u_MaxTheta;
        uniform float u_MinSpeed;
        uniform float u_MaxSpeed;
        
        uniform float u_Time;

        layout(location=0) in vec2 i_Position;
        layout(location=1) in float i_Age;
        layout(location=2) in float i_Life;
        layout(location=3) in vec2 i_Velocity;

        out vec2 v_Position;
        out float v_Age;
        out float v_Life;
        out vec2 v_Velocity;

        void main() {
vec2 force = 4.0 * (2.0 * texture(u_ForceField, i_Position).rg - vec2(1.0));
  if (i_Age >= i_Life) {
    ivec2 noise_coord = ivec2(gl_VertexID % 512, gl_VertexID / 512);
    vec2 rand = texelFetch(u_RgNoise, noise_coord, 0).rg;
    float theta = u_MinTheta + rand.r*(u_MaxTheta - u_MinTheta);
    float x = cos(theta);
    float y = sin(theta);
    v_Position = u_Origin;
    v_Age = 0.0;
    v_Life = i_Life;
    v_Velocity =
      vec2(x, y) * (u_MinSpeed + rand.g * (u_MaxSpeed - u_MinSpeed));
  } else {
    v_Position = i_Position + i_Velocity * u_TimeDelta;
    v_Age = i_Age + u_TimeDelta;
    v_Life = i_Life;
    v_Velocity = i_Velocity + u_Gravity * u_TimeDelta + force * u_TimeDelta;
  }



        }
    `);

    */
    
    createFragmentShader('passthru',`
        #version 300 es
        precision mediump float;
        void main() { 
            discard; 
        }
    `);
    
    particleInitProg=createProgram('particleInit','passthru');
    squareProg=createProgram('square','square');
}

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
    
    initShaders();
    
      
    var squareVertBuf=mygl.createVertBuf(gl,Float32Array.from([-1,1,1,1,-1,-1,1,-1]));
    squareVao=mygl.createVao(gl,[0],[2],[gl.FLOAT],[0],[0],[squareVertBuf],null,[0]);
          
    return true;
}

function onInit() {
    canvas=document.getElementById('canvas');
    canvas.onselectstart=null;
    
    if(!initGL(canvas)) {
        return false;
    }
    
    mouse=createMouseInput(canvas);
    touch=createTouchInput(canvas);
    
    
    for(var i=0;i<45;i++) {
        var x=(Math.random()-0.5)*400;
        var y=(Math.random()-0.5)*400;

        var a=Math.random()*Math.PI*2;
        
        var speed=0;//5+Math.random()*35;
        var vx=Math.cos(a)*speed;
        var vy=Math.sin(a)*speed;
        
        createShip(0,x,y,vx,vy,a);
    }
    
    
        //createShip(entities,0,0,0,0,0,0);
        

    log('started',null,5000);
    return true;
}


function onStep(dt) {
    updateSteppedSystems(dt);
    return true;

}

function renderMouseCursor() {
    if(!squareProg || !squareVao) {return;}
    

    gl.useProgram(squareProg);
    gl.bindVertexArray(squareVao);

     mygl.setDrawStates(gl,true,{
        "depth_test":false,
    });
    
    var modelMat=glMatrix.mat3.create();
    
    glMatrix.mat3.identity(modelMat);
    glMatrix.mat3.translate(modelMat,modelMat, worldCursor);
    glMatrix.mat3.scale(modelMat,modelMat, [10,10]);
    
    mygl.setUniform(gl,gl.uniformMatrix3fv,"u_modelMat",false,modelMat);
    mygl.setUniform(gl,gl.uniform3fv,"u_col",[1,1,1]);

    mygl.applyUniforms(gl,squareProg);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0,4);
}

function onRender(dt,it) {
    var oldZoom=view.zoom;
    view.zoom+=mouse.scroll[1]*0.001;//+(touch.pinch[0]+touch.pinch[1])*0.1;
    view.zoom=Math.min(Math.max(view.zoom, 1), view.zoomMax);
    var zoomDif=view.zoom-oldZoom;
    
    if(mouse.down[0]) {
        view.x+=mouse.move[0]*view.zoom;
        view.y+=mouse.move[1]*view.zoom;
    }
    
    //view.x+=touch.pan[0]*view.zoom;
    //view.y+=touch.pan[1]*view.zoom;

    view.x+=(mouse.cursor[0]-canvas.width*0.5)*zoomDif;
    view.y+=(mouse.cursor[1]-canvas.height*0.5)*zoomDif;

    //proj
    var projMat=glMatrix.mat4.create();
    glMatrix.mat4.ortho(projMat,-canvas.width*0.5*view.zoom,canvas.width*0.5*view.zoom,-canvas.height*0.5*view.zoom,canvas.height*0.5*view.zoom,-1,1);
   
    //view
    var viewMat=glMatrix.mat4.create();
    glMatrix.mat4.translate(viewMat,viewMat,[view.x,-view.y,0]);
    glMatrix.mat4.scale(viewMat,viewMat,[3,3,1]);
  
    //viewProj
    var viewProjMat=glMatrix.mat4.create();
    glMatrix.mat4.mul(viewProjMat,projMat,viewMat);
    
    //invViewProj
    var invViewProjMat=glMatrix.mat4.create();
    glMatrix.mat4.invert(invViewProjMat,viewProjMat);
    
    //cursorWorldPos
    glMatrix_unproject(worldCursor,[mouse.cursor[0],canvas.height-mouse.cursor[1],0], invViewProjMat, [0,0,canvas.width,canvas.height]);
    log(worldCursor.slice(0,2).map(x=>Math.floor(x)),'cursor => world');
    
    //shipScreenPos test
    var u=glMatrix.vec3.create();
    //glMatrix_project(u,[entities[0].position[0],entities[0].position[1],0], viewProjMat, [0,0,canvas.width,canvas.height]);
    
    //log(u.map(x=>Math.floor(x)),'ship => screen');
    //log(entities[0].position.map(x=>x.toFixed(1)),'ship');
    
    //set uniforms
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_viewProjMat",false,viewProjMat);

    //viewport
    gl.viewport(0,0,canvas.width,canvas.height);
    
    //clear
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    
    //
    updateRenderedSystems(dt,it);
    
    //
    renderMouseCursor();
    
    //
    return true;
}

function onRun() {
    //.map(x=>x.toFixed(1))
    log([mouse.cursor[0],canvas.height-mouse.cursor[1]],'mouse pos');
    log(view.zoom.toFixed(1),'zoom');
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
    touch.updateAfter();
    
    //
    log(calcFPS().toFixed(1),'fps');
    return true;
}
