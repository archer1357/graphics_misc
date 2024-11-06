
var canvas,gl;
var squareProg,squareVao;
var particleUpdateProg,particleRenderProg,particleRender2Prog;
var particleUpdateBufs=new Array(2),particleUpdateVaos=new Array(4);

var particlesMaxNum=111024;
var stateRead=0;
var stateWrite=1;

var mouse;
var view={x:0,y:0,zoom:2.5, zoomMax:5};
var worldCursor=glMatrix.vec3.create();

var force_field_texture=null,rg_noise_texture=null;

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

    createVertexShader('particleUpdate',`
        #version 300 es
        precision mediump float;

uniform sampler2D u_RgNoise;
uniform sampler2D u_ForceField;


        
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

    createFragmentShader('passthru',`
        #version 300 es
        precision mediump float;
        in float v_Age;
        void main() { discard; }
    `);
    
    createVertexShader('particleRender',`
        #version 300 es
        precision mediump float;
        layout(location=0) in vec2 i_Position;

        void main() {
            gl_PointSize = 1.0;
            gl_Position = vec4(i_Position, 0.0, 1.0);
        }
    `);
  
    createFragmentShader('particleRender',`
        #version 300 es
        precision mediump float;
        uniform vec3 u_col2;

        out vec4 o_FragColor;

        void main() {
          o_FragColor = vec4(u_col2,1.0);
        }
    `);
    
    createVertexShader('particleRender2',`
        #version 300 es
        precision mediump float;
        layout(location=0) in vec2 i_Position;
        
        layout(location=1) in float i_Age;
        layout(location=2) in float i_Life;
        
        layout(location=4) in vec2 i_Coord;

        out float v_Age;
        out float v_Life;

        void main() {
                    
            v_Age = i_Age;
            v_Life = i_Life;

            float s= 5.0;//1.0 + 6.0 * (1.0 - i_Age/i_Life);

            //gl_PointSize = s;
            gl_PointSize = 1.0;
            gl_Position = vec4(i_Position+i_Coord*s*0.001, 0.0, 1.0);
        }
    `);
  
    createFragmentShader('particleRender2',`
        #version 300 es
        precision mediump float;
        uniform vec3 u_col;
        
                
        in float v_Age;
        in float v_Life;

        // From http://iquilezles.org/www/articles/palettes/palettes.htm 
        vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
            return a + b*cos( 6.28318*(c*t+d) ); 
        }


        out vec4 o_FragColor;

        void main() {
            float t =  v_Age/v_Life;
            o_FragColor = vec4(
            palette(t,
                    vec3(0.5,0.5,0.5),
                    vec3(0.5,0.5,0.5),
                    vec3(1.0,0.7,0.4),
                    vec3(0.0,0.15,0.20)),
                    1.0 - t);


          //o_FragColor = vec4(u_col,1.0);
        }
    `);
        
    squareProg=createProgram('square','square');
    
    particleUpdateProg=createProgram('particleUpdate','passthru',(p)=>{
        gl.transformFeedbackVaryings(p,["v_Position","v_Age","v_Life","v_Velocity"],gl.INTERLEAVED_ATTRIBS);
    });
 
    particleRenderProg=createProgram('particleRender','particleRender');
    particleRender2Prog=createProgram('particleRender2','particleRender2');
    
}

function randomRGData(size_x, size_y) {
  var d = [];
  for (var i = 0; i < size_x * size_y; ++i) {
    d.push(Math.random() * 255.0);
    d.push(Math.random() * 255.0);
  }
  return new Uint8Array(d);
}

function randomPerlinData(w,h) {
    noise.seed(Math.random());
  var d = [];

  for (var i = 0; i < w * h; ++i) {
    var x=i%w;
    var y=Math.floor(i/w);
    //for (var x = 0; x < w; x++) {
      //for (var y = 0; y < h; y++) {
        // All noise functions return values in the range of -1 to 1.

        // noise.simplex2 and noise.perlin2 for 2d noise
  
        // ... or noise.simplex3 and noise.perlin3:
        //var value = noise.simplex3(x / 100, y / 100, time);

        d.push(Math.abs(noise.simplex2(x / 100, y / 100)) * 256); // Or whatever. Open demo.html to see it used with canvas.
        d.push(Math.abs(noise.simplex2(x / 100, (y+h) / 100)) * 256);
      //}
    //}
  }
  return new Uint8Array(d);
}

function initialParticleData(num_parts, min_age, max_age) {
  var data = [];
  for (var i = 0; i < num_parts; ++i) {
    data.push(0.0);
    data.push(0.0);
    var life = min_age + Math.random() * (max_age - min_age);
    data.push(life + 1);
    data.push(life);
    data.push(0.0);
    data.push(0.0);
  }
  return data;
}

function loadTextures() {
    rg_noise_texture = gl.createTexture();
    
    gl.bindTexture(gl.TEXTURE_2D, rg_noise_texture);
    gl.texImage2D(gl.TEXTURE_2D,
                0, 
                gl.RG8,
                512, 512,
                0,
                gl.RG,
                gl.UNSIGNED_BYTE,
                randomRGData(512, 512));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    
        force_field_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, force_field_texture);
        gl.texImage2D(gl.TEXTURE_2D, 
            0, 
            gl.RG8, 
            512,512,
            0,
            gl.RG, 
            gl.UNSIGNED_BYTE, 
            randomPerlinData(512,512));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        /*
    var force_field_image = new Image();
    force_field_image.src = rg_perlin;
    force_field_image.onload = function () {
        force_field_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, force_field_texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, gl.RGB, gl.UNSIGNED_BYTE, force_field_image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        console.log("aaa");
            
    };*/
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
  
    //mygl.createProgram(gl,'square','square').then((p)=>{squareProg=p;},log);
    
  

    //
    var squareVertBuf=mygl.createVertBuf(gl,Float32Array.from([-1,1,1,1,-1,-1,1,-1]));
    squareVao=mygl.createVao(gl,[0],[2],[gl.FLOAT],null,null,[squareVertBuf]);
    
    //
    var particleSize=2+1+1+2;
    
    //particleUpdateBufs[0]=mygl.createVertBuf(gl,new Float32Array(particlesMaxNum*particleSize));
    //particleUpdateBufs[1]=mygl.createVertBuf(gl,new Float32Array(particlesMaxNum*particleSize
 
    var num_particles=particlesMaxNum;
    var particle_birth_rate=0.01;
    var min_age=0.1 ;
    var max_age=1.5; 

    var min_theta=-Math.PI;//Math.PI/2.0 - 0.4;
    var max_theta=Math.PI;//Math.PI/2.0 + 0.4;
    var min_speed=0.5;
    var max_speed=0.8;
    var gravity=[0.0, -0.8];
      

    mygl.setUniform(gl,gl.uniform3fv,"u_col2",[0.8,1.0,0.7]);
    
    mygl.setUniform(gl,gl.uniform2fv,"u_Gravity",[gravity[0], gravity[1]]);
    mygl.setUniform(gl,gl.uniform2f,"u_Origin",0,0);
    mygl.setUniform(gl,gl.uniform1f,"u_MinTheta",min_theta);
    mygl.setUniform(gl,gl.uniform1f,"u_MaxTheta",max_theta);
    mygl.setUniform(gl,gl.uniform1f,"u_MinSpeed",min_speed);
    mygl.setUniform(gl,gl.uniform1f,"u_MaxSpeed",max_speed);
    
    
    var spriteVertBuf=mygl.createVertBuf(gl,Float32Array.from([-1,1,1,1,-1,-1,1,-1]))
    //var spriteVertBuf=mygl.createVertBuf(gl,new Float32Array([1,1, -1,1, -1,-1, 1,1, -1,-1, 1,-1]));
    var particlesData=new Float32Array(initialParticleData(num_particles, min_age, max_age));


    particleUpdateBufs[0]=mygl.createVertBuf(gl,particlesData,gl.STREAM_DRAW);
    particleUpdateBufs[1]=mygl.createVertBuf(gl,particlesData,gl.STREAM_DRAW);
   
    //particleUpdateBufs[0]=mygl.createVertBuf(gl,new Float32Array(particlesMaxNum*particleSize),gl.STREAM_DRAW);
    //particleUpdateBufs[1]=mygl.createVertBuf(gl,new Float32Array(particlesMaxNum*particleSize),gl.STREAM_DRAW);

    particleUpdateVaos[0]=mygl.createVao(gl,
        [0,1,2,3], //loc
        [2,1,1,2], //len
        [gl.FLOAT,gl.FLOAT,gl.FLOAT,gl.FLOAT], //type
        (new Array(4)).fill(particleSize*4), //stride
        [0,2,3,4].map(x=>x*4), //offsets
        [particleUpdateBufs[0],null,null,null]); //vertbuf
        
    particleUpdateVaos[1]=mygl.createVao(gl,
        [0,1,2,3],
        [2,1,1,2],
        [gl.FLOAT,gl.FLOAT,gl.FLOAT,gl.FLOAT],
        (new Array(4)).fill(particleSize*4), //stride
        [0,2,3,4].map(x=>x*4),
        [particleUpdateBufs[1],null,null,null]);

    /*
    particleUpdateVaos[2]=mygl.createVao(gl,
        [0],
        [2],
        [gl.FLOAT],
        [particleSize*4],
        [0].map(x=>x*4),
        [particleUpdateBufs[0]]);
        
    particleUpdateVaos[3]=mygl.createVao(gl,
        [0],
        [2],
        [gl.FLOAT],
        [particleSize*4],
        [0].map(x=>x*4),
        [particleUpdateBufs[1]]);
        */
        

    particleUpdateVaos[2]=mygl.createVao(gl,
        [0,1,2, 4],
        [2,1,1, 2],
        [gl.FLOAT,gl.FLOAT,gl.FLOAT,gl.FLOAT],
        [particleSize*4,particleSize*4,particleSize*4,0],
        [0,2,3,0].map(x=>x*4),
        [particleUpdateBufs[0],null,null,spriteVertBuf],
        null,
        [1,1,1,0]);
        
    particleUpdateVaos[3]=mygl.createVao(gl,
        [0,1,2, 4],
        [2,1,1, 2],
        [gl.FLOAT,gl.FLOAT,gl.FLOAT,gl.FLOAT],
        [particleSize*4,particleSize*4,particleSize*4,0],
        [0,2,3,0].map(x=>x*4),
        [particleUpdateBufs[1],null,null,spriteVertBuf],
        null,
        [1,1,1,0]);
        
    //
    
    mygl.setUniform(gl,gl.uniform1i,"u_RgNoise",0);
    mygl.setUniform(gl,gl.uniform1i,"u_ForceField",1);

    //
    loadTextures();
    
    //
    return true;
}

function onInit() {
    canvas=document.getElementById('canvas');
    canvas.onselectstart=null;
    
    if(!initGL(canvas)) {
        return false;
    }
    
    mouse=createMouseInput(canvas);
    
  

    log('started',null,5000);
    return true;
}


function onStep(dt) {

    return true;

}

function renderMouseCursor() {
    if(!gl || !squareProg || !squareVao) {return;}
    
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

function renderParticles(dt,it) {
    if(!particleUpdateProg || !particleRenderProg) {
        return;
    }
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, rg_noise_texture);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, force_field_texture);
    
    mygl.setUniform(gl,gl.uniform1f,'u_TimeDelta',dt);
    mygl.setUniform(gl,gl.uniform1f,'u_TotalTime',getTime());
 
    //
    gl.useProgram(particleUpdateProg);

    mygl.applyUniforms(gl,particleUpdateProg);
    
    mygl.setDrawStates(gl,true,{
        rasterizer_discard : true,
    });
    
    //stateRead=0;
    //stateWrite=1;

    log(stateRead,'stateRead');
    log(stateWrite,'stateWrite');
    //log(particleUpdateVaos[stateRead],'particleUpdateVaos[stateRead]');
    //log(particleUpdateBufs[stateWrite],'particleUpdateBufs[stateWrite]');
    //log(particleUpdateVaos[stateRead + 2],'particleUpdateVaos[stateRead + 2]');
    //log(particleUpdateBufs[stateRead]!=particleUpdateBufs[stateWrite], "b?");
    //log(particleUpdateVaos[stateRead]!=particleUpdateVaos[stateWrite], "v?");
    
    gl.bindVertexArray(particleUpdateVaos[stateRead]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, particleUpdateBufs[stateWrite]);
    
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, particlesMaxNum);
    gl.endTransformFeedback();
  
    //
    gl.useProgram(particleRender2Prog);

    mygl.applyUniforms(gl,particleRender2Prog);
    
    mygl.setDrawStates(gl,true,{
        blend : true,
        //depth_test:false,
        blend_src : gl.SRC_ALPHA,
        blend_dst : gl.ONE_MINUS_SRC_ALPHA,
        //"color_writemask":[true,false,true,true]
    });
    
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    gl.bindVertexArray(particleUpdateVaos[stateRead + 2]);
    //gl.drawArrays(gl.POINTS, 0, particlesMaxNum);
    
    //gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, particlesMaxNum);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, particlesMaxNum);

    //
    //var tmp = stateRead;
    //stateRead = stateWrite;
    //stateWrite = tmp;
    
    //console.log(stateRead + ' ' + stateWrite);
    stateRead=(stateRead+1)%2;
    stateWrite=(stateWrite+1)%2;
    
    return true;
}

function onRender(dt,it) {
    var oldZoom=view.zoom;
    view.zoom+=mouse.scroll[1]*0.001;
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
    
   
    
    //set uniforms
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_viewProjMat",false,viewProjMat);

    //viewport
    gl.viewport(0,0,canvas.width,canvas.height);
    
    //clear
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    
    //
    
    //
    mygl.setUniform(gl,gl.uniform1f,"u_Time",getTime());
    
    //
    if(!renderParticles(dt,it)) {return false;}
    
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
    
    //
    log(calcFPS().toFixed(1),'fps');
    return true;
}
