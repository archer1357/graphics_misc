var canvas;
var cameraControl=createFreeLookCameraControl({"pos":[0,0,4],"yaw":0,"pitch":0,"speed":0.02,"slow":0.92,"lookSpeed":0.005});
var camera;
var getTime=(function(){var start=Date.now();return (()=>{return ((Date.now()-start)/1000)%3.402823e+38;});})();
var calcFPS=createFpsCounter();
var fixedTimeStep=createFixedTimeStep(1/60,5);

var renderer,scene;
var lights=[];

function setErrorMsg(msg) {
    var root=document.getElementById("root");
    root.innerHTML=hasError?root.innerHTML:'';
    hasError=true;
    root.innerHTML+='<pre>'+msg.replace("\n","<br/>");+'</pre>';
}

var printLog=(function(){
    var logElement;
   
    return (function(msg){
        logElement=logElement||document.getElementById("log");
        
        var m=document.createElement('span');
        m.innerHTML=msg.replace("\n","<br/>");
            
        var e=document.createElement('span');
            
        logElement.appendChild(document.createElement('br'));
        logElement.appendChild(m);
        logElement.appendChild(e);
        return (function(x){e.innerHTML=x.replace("\n","<br/>");});
   });
})();

var updateBarFps=(function(){
   var element;
   
   return (function(x){
        element=element||document.getElementById("barFps");
        element.innerHTML = x.toFixed(1)  + " fps";
   });
})();

var updateBarTime=(function(){
   var element;
   
   return (function(x){
        element=element||document.getElementById("barTime");
        element.innerHTML = x.toFixed(2);
   });
})();

function calcLightPos(a) {

    //var x=(Math.cos(a) + Math.cos(3.0*a)/3.0 + Math.sin(9.0*a)/9.0)*10.0+Math.cos(a)*8.0;
    //var z=(Math.sin(a) + Math.sin(3.0*a)/3.0+ Math.cos(9.0*a)/9.0 )*10.0+Math.sin(a)*8.0;
    
   // return [x,z];
    
    
    var r=20;
    var x=Math.cos(1*a) ;
    var y=Math.sin(1*a) ;
    
    var q=0.8;
    x=Math.max(-q,x);
    x=Math.min(q,x);
    
    y=Math.max(-q,y);
    y=Math.min(q,y);
    
    x*=r;
    y*=r;
    
    return [x,y];
    
}
function onAnimate() {
    
    //
    var width=canvas.clientWidth;
    var height=canvas.clientHeight;
    
    var aspect=width/height;
    var fovy=Math.PI/4;
    
    //
    camera.aspect = aspect;
    camera.fov=THREE.Math.radToDeg(fovy);
	camera.updateProjectionMatrix();
    //
    
    var curTime=getTime();
    
    cameraControl.update();
        
    //
    fixedTimeStep(curTime,(dt)=>{
        cameraControl.step(dt);
    },(it)=>{
        cameraControl.render(it);
    });
    
    //
    var cameraPos=cameraControl.getPos();
    var cameraRot=cameraControl.getQuat();
    
    camera.position.x = cameraPos[0];
    camera.position.y = cameraPos[1];
    camera.position.z = cameraPos[2];
    camera.quaternion.x = -cameraRot[0];
    camera.quaternion.y = -cameraRot[1];
    camera.quaternion.z = cameraRot[2];
    camera.quaternion.w = cameraRot[3];
    
    for(var i=0;i<lights.length;i++) {
        var aaa=calcLightPos(curTime*0.075+(i*2*Math.PI)/lights.length);
        lights[i].position.x=aaa[0];//Math.cos(curTime*0.5)*10;
        lights[i].position.y=4;
        lights[i].position.z=aaa[1];
      //  lights[i].color=new THREE.Color( 1, 0.8, 0.5 );
    }
    
    //
    renderer.render(scene, camera);

    //
    updateBarFps(calcFPS());
    updateBarTime(curTime);

    requestAnimFrame(onAnimate);
}


function registerInputEvents(element) {
    window.addEventListener("keydown", (function(event){
            cameraControl.keydown(event);
    }));
    
    window.addEventListener("keyup", (function(event){
            cameraControl.keyup(event);
    }));

    element.addEventListener('mousemove', function(event) {
        if(PL.isEnabled()) {
            cameraControl.mousemove(event);
        }
    }, false);

    element.addEventListener("mousedown",function(event){
        if(event.button==0){
            if(PL.isEnabled()) {
                PL.exitPointerLock();
            } else {
                PL.requestPointerLock(element);
            }
        }
    });
}

function init() {
    canvas=document.getElementById("canvas");
    canvas.onselectstart=null;
    
    camera= new THREE.PerspectiveCamera(50, 1, 1,200);
    
    registerInputEvents(canvas);
    
    //
    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias:true});
    renderer.setSize(canvas.clientWidth,canvas.clientHeight);
   // renderer.setClearColor(new THREE.Color( 0.6, 0.65, 0.7 ));
    
    //~ renderer.toneMapping = THREE.ReinhardToneMapping;

				//~ renderer.physicallyCorrectLights = true;
				//~ renderer.gammaInput = true;
				//~ renderer.gammaOutput = true;
    
    renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
   // renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
	//~ renderer.shadowMap.type = THREE.BasicShadowMap;
    
    //~ renderer.toneMappingExposure = Math.pow( 0.68, 5.0 );
    
    
    //
    scene = new THREE.Scene();
   
    

    //
    var material = new THREE.MeshStandardMaterial({color: new THREE.Color( 1, 1, 1 ),metalness: 0.2,roughness: 0.8 });
   
    
    loadText("model/vault2.obj").then(function(str){
        var objMesh = new OBJ.Mesh(str);

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( objMesh.vertices, 3 ));
        geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( objMesh.vertexNormals, 3 ));
        
geometry.setIndex(new THREE.Uint32BufferAttribute(objMesh.indices,1));


				//~ geometry.computeBoundingSphere();
       // for(var x=-4;x<4;x++) {
       //     for(var z=-4;z<4;z++) {
                
        var mesh = new THREE.Mesh( geometry, material );
                var x=0,z=0;
                
        mesh.scale.x=mesh.scale.y=mesh.scale.z=4.0;
                mesh.position.x=x*2*4;
                mesh.position.z=z*2*4;
                mesh.castShadow = true;
                mesh.receiveShadow = true; 
        scene.add( mesh );
      //      }
      //  }
        
        
    },printLog);
    /*
    lights.push(addLight(new THREE.Color( 1, 0.2, 0.5 )));
    lights.push(addLight(new THREE.Color( 0.3,  1,0.5 )));
    lights.push(addLight(new THREE.Color(  0.8, 0.2,1 )));
    lights.push(addLight(new THREE.Color( 0.4, 0.8, 0.7 )));
    lights.push(addLight(new THREE.Color( 0.6, 1, 0.7 )));
    lights.push(addLight(new THREE.Color( 0.1, 0.7, 1 )));
    */
    
    lights.push(addLight(new THREE.Color( 1.0,0.6,0.8 )));
    lights.push(addLight(new THREE.Color( 0.6,1.0,0.8 )));
    lights.push(addLight(new THREE.Color( 1.0,0.8,0.6 )));
    
    lights.push(addLight(new THREE.Color(1,1,1 )));
    
    
   // scene.add(new THREE.AmbientLight(new THREE.Color( 0.1,0.1,0.1)));

    onAnimate();
}

function addLight(c) {
    c= c?c:(new THREE.Color( 1, 1, 1 ))
var light = new THREE.PointLight(c, 1, 45 );
    light.castShadow  = true;
     light.shadow.mapSize.width = 512*1;  // default
    light.shadow.mapSize.height = 512*1; // default
    //~ light.shadow.camera.near = 0.5;       // default
    //~ light.shadow.camera.far = 500      // default
    //~ light.shadow.bias = - 0.005; // reduces self-shadowing on double-sided objects
    //light.shadow.bias = 0.001;
//light.shadowDarkness = 0.2;
				var bulbGeometry = new THREE.SphereGeometry( 0.2, 16, 8 );
				bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );
				bulbMat = new THREE.MeshLambertMaterial( {
					emissive: c,
					emissiveIntensity: 1,
					color: c
				});
                
                var bulbMesh=new THREE.Mesh( bulbGeometry, bulbMat );
        bulbMesh.receiveShadow=false;
        bulbMesh.castShadow = false;
                
				light.add( bulbMesh );

    scene.add( light );
                
    //~ var helper = new THREE.CameraHelper( light1.shadow.camera );
    //~ scene.add( helper );
                return light;
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

