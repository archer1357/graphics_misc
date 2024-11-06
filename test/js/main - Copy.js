
var canvas;
//var mouseInput;
//var keyInput;
var lookCamera,orbitCamera, scene, renderer;
var mesh;

//import * as mymodule from "./input2.js"

var cameraController=new CharacterController({
    accel:5,
    decel:4,
    max_speed:400,
});

var line;
var MAX_POINTS = 500;
var drawCount;

function initLine(scene,points) {
    var MAX_POINTS = 500;
    
	// geometry
	//var geometry = new THREE.BufferGeometry();
	var geometry = new THREE.Geometry();

	// attributes
	//var positions = new Float32Array( points.length * 3 ); // 3 vertices per point
	//geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    
    for(var i=0;i<points.length;i++) {
        geometry.vertices.push(points[i]);
        //positions[i*3]=points[i][0];
        //positions[i*3+1]=points[i][1];
        //positions[i*3+2]=points[i][2];
    }
    

	//geometry.setDrawRange( 0, points.length );


	var material = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 50 } );

	line = new THREE.LineSegments( geometry,  material );
	scene.add( line );
}

function initFrustumWireframe() {
}

function onInit() {
    canvas=document.getElementById('canvas');
    canvas.onselectstart=null;
    
    orbitCamera = new THREE.PerspectiveCamera( 90, canvas.width / canvas.height, 10, 100 );
    
    lookCamera = new THREE.PerspectiveCamera( 90, canvas.width / canvas.height, 1, 1000 );
    lookCamera.position.z = 5;
    scene = new THREE.Scene();
    var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
    var material = new THREE.MeshBasicMaterial( {  } );
    mesh = new THREE.Mesh( geometry, material );
    //scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { canvas: canvas,antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );

    //lookCamera.aspect = canvas.width / canvas.height;
    //lookCamera.updateProjectionMatrix();
    renderer.setSize( canvas.width, canvas.height );
    
    //lookCamera.near
    //lookCamera.far
    //lookCamera.projectionMatrix
    //lookCamera.projectionMatrixInverse
    var m=orbitCamera.projectionMatrixInverse;
    var pn0=(new THREE.Vector3(-1,-1,-1)).applyMatrix4(m);
    var pn1=(new THREE.Vector3(1,-1,-1)).applyMatrix4(m);
    var pn2=(new THREE.Vector3(1,1,-1)).applyMatrix4(m);
    var pn3=(new THREE.Vector3(-1,1,-1)).applyMatrix4(m);
    
    var pf0=(new THREE.Vector3(-1,-1,1)).applyMatrix4(m);
    var pf1=(new THREE.Vector3(1,-1,1)).applyMatrix4(m);
    var pf2=(new THREE.Vector3(1,1,1)).applyMatrix4(m);
    var pf3=(new THREE.Vector3(-1,1,1)).applyMatrix4(m);
    
    
    var cn=(new THREE.Vector3(0,0,-1)).applyMatrix4(m);
    var cf=(new THREE.Vector3(0,0,1)).applyMatrix4(m);
    
    var origin=new THREE.Vector3(0,0,0);
    
    //console.log(pn0);
   // console.log(pn1);
   // console.log(pn2);
   // console.log(pn3);
    
   // console.log(pf0);
   // console.log(pf1);
    //console.log(pf2);
    //console.log(pf3);
    
    // 
    var linePoints=[];
    linePoints.push(pn0);linePoints.push(pn1);
    linePoints.push(pn1);linePoints.push(pn2);
    linePoints.push(pn2);linePoints.push(pn3);
    linePoints.push(pn3);linePoints.push(pn0);
    

    linePoints.push(pf0);linePoints.push(pf1);
    linePoints.push(pf1);linePoints.push(pf2);
    linePoints.push(pf2);linePoints.push(pf3);
    linePoints.push(pf3);linePoints.push(pf0);
    
    
    linePoints.push(pn0);linePoints.push(pf0);
    linePoints.push(pn1);linePoints.push(pf1);
    linePoints.push(pn2);linePoints.push(pf2);
    linePoints.push(pn3);linePoints.push(pf3);
    

    linePoints.push(pn0);linePoints.push(origin);
    linePoints.push(pn1);linePoints.push(origin);
    linePoints.push(pn2);linePoints.push(origin);
    linePoints.push(pn3);linePoints.push(origin);
    
    
    
    linePoints.push(pf0);linePoints.push(pf2);
    linePoints.push(pf1);linePoints.push(pf3);
    //linePoints.push(cn);linePoints.push(cf);
    
    initLine(scene, linePoints);
    
    //
    
    //mouseInput=Input.createMouseInput(canvas);
    //keyInput=Input.createKeyInput(window);
    
    //
    Input.managerAddKeyInput(window);
    Input.managerAddMouseInput(canvas);
    
    Input.managerSetAxisKey("forward",'w',1);
    Input.managerSetAxisKey("forward",'s',-1);
    Input.managerSetAxisKey("rightward",'d',1);
    Input.managerSetAxisKey("rightward",'a',-1);
    Input.managerSetAxisKey("upward",'q',1);   
    Input.managerSetAxisKey("upward",'e',-1);     
    Input.managerSetAxisMouseMoveY("pitch",0.2);
    Input.managerSetAxisMouseMoveX("yaw",0.2);
    Input.managerSetDownMouse("look");
    
    log('started',null,5000);
    return true;
}




function onStep(dt) {

    var move=[
        Input.managerAxis("rightward"),
        Input.managerAxis("upward"),
        -Input.managerAxis("forward")];
    
    cameraController.calcVel(move,dt);
    
    var translation=new THREE.Vector3();
    translation.fromArray(cameraController.vel);
    translation.multiplyScalar(dt);
    lookCamera.position.add(translation);
    
    orbitCamera.position.subVectors(new THREE.Vector3(0,0,50),lookCamera.position);
    orbitCamera.lookAt(lookCamera.position);
    return true;

}

function onRender(dt,it) {
    //const MOUSE_SENSITIVITY = 0.2

    if(Input.managerDown("look")) {
        cameraController.movePitch(Input.managerAxis("pitch")*dt);
        cameraController.moveYaw(Input.managerAxis("yaw")*dt);
    }
    
    //
    //if(mouseInput.down(0)) {
    //    cameraController.movePitch(mouseInput.moveY()* MOUSE_SENSITIVITY*-dt);
    //    cameraController.moveYaw(mouseInput.moveX()* MOUSE_SENSITIVITY*-1*dt);
    //}
    
    var lookVec = new THREE.Vector3( 0, 0, -1 );
    lookVec.applyAxisAngle (new THREE.Vector3( 1, 0, 0 ),cameraController.pitch ) ;
    lookVec.applyAxisAngle (new THREE.Vector3( 0, 1, 0 ),cameraController.yaw ) ;
    
    var atPos= new THREE.Vector3();
    atPos.addVectors ( lookCamera.position, lookVec );
    lookCamera.lookAt(atPos);
    
    
    //mesh.rotation.x += 0.005;
    //mesh.rotation.y += 0.01;
    var camera=lookCamera;//orbitCamera;
    renderer.render( scene, camera );
    //
    return true;
}

function onRun() {
    //.map(x=>x.toFixed(1))
    //log([mouseInput.cursorX(),canvas.height-mouseInput.cursorY()],'mouseInput pos');
   
    //log([mouseInput.moveX(),mouseInput.moveY()],'mouse move');
    //log(mouseInput.down(0),'mouse left');
    
    //
    //if(mouseInput.press(0)) {
    //    canvas.requestPointerLock();
    //}
    
    //if(mouseInput.depress(0)) {
    //    document.exitPointerLock();
    //}
    
    
    
    
    //
    
    Input.managerBegin();
    

    if(Input.managerPress("look")) {
        canvas.requestPointerLock();
    }
    
    if(Input.managerDepress("look")) {
        document.exitPointerLock();
    }   
    
    fixedTimeStep(getTime(),onStep,onRender);
    
    Input.managerEnd();
    
    //
    //mouseInput.updateAfter();
    //keyInput.updateAfter();
    //
    log(calcFPS().toFixed(1),'fps');
    return true;
}
