var inputManager;
var screenSize,cursor,scrolling,zooming;
var canvas;
var scene, renderer;


var camera;

var curPosZoom=[0,0,0.35];

var cellsNum=10;
var cellsScale=10;
var cellsTotalScale=cellsNum*cellsScale;

var redMtrl, purpleMtrl;

var squareGeom;

var squareMesh,crossMesh;

var drawings=[];

function drawMesh(mesh,pos,scale) {
    mesh=mesh.clone();
    mesh.position.x=pos[0];
    mesh.position.y=0.1;
    mesh.position.z=pos[1];
    mesh.scale.x=scale[0];
    mesh.scale.z=scale[1];
    drawings.push(mesh);
}

function createLineSegMesh(verts) {
    var geometry = new THREE.Geometry();
    
    for(var i=0;i<verts.length;i++) {
        geometry.vertices.push(new THREE.Vector3(verts[i][0],0,verts[i][1]));
    }
    
    
    var material = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 3 } );
    var line = new THREE.LineSegments( geometry,  material );
    
    return line;    
}

function createLineMesh(verts) {
    var geometry = new THREE.Geometry();
    
    for(var i=0;i<verts.length;i++) {
        geometry.vertices.push(new THREE.Vector3(verts[i][0],0,verts[i][1]));
    }
    
    
    var material = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 1 } );
    var line = new THREE.Line( geometry,  material );
    
    return line;    
}

function createSquareMaterial() {
    return new THREE.ShaderMaterial({
        vertexShader :   `
            uniform float u_cellsScale;
            varying vec2 tc;
            void main() {
                tc=position.xz*0.5+0.5;
                float s=u_cellsScale*0.5;
                gl_Position=projectionMatrix*modelViewMatrix*vec4(position*s,1.0);
            }`,
        fragmentShader : `
            varying vec2 tc;
            

            void main() {
                gl_FragColor = vec4(1.0,0.0,1.0, 1.0);
            } `,
            uniforms : {
                u_cellsScale: { type: "f", value: cellsScale },
            }
    });
}

function createSquareGeometry() {

    var geometry = new THREE.Geometry();
    
    geometry.vertices.push(
        new THREE.Vector3(-1,0,-1),
        new THREE.Vector3(-1,0,1),
        new THREE.Vector3(1,0,-1),
        new THREE.Vector3(1,0,1));
    
    geometry.faces.push(new THREE.Face3(0,3,2),new THREE.Face3(0,1,3));
    
    return geometry;
}

function createBoardMaterial() {
    return new THREE.ShaderMaterial({
        vertexShader :   `
            uniform float u_cellsNum;
            uniform float u_cellsScale;
            varying vec2 tc;
            void main() {
                tc=position.xz*0.5+0.5;
                tc*=u_cellsNum;
                float s=u_cellsScale*u_cellsNum*0.5;
                //s=1.0;
                gl_Position=projectionMatrix*modelViewMatrix*vec4(position*s,1.0);
            }`,
        fragmentShader : `
            varying vec2 tc;
            
            vec3 checker(vec2 tc,vec3 c0,vec3 c1,float m) {
                vec3 a = (mod((floor(tc.x)+floor(tc.y)),2.0) == 0.0)?c0:c1;
                vec2 grid = abs(fract(tc - 0.5) - 0.5) / 0.05;
                vec3 b=vec3(min(min(grid.x, grid.y)+0.5, 1.0));
                return mix(a,b,m);
            }

            void main() {
                gl_FragColor = vec4(checker(tc,vec3(0.7,0.7,0.8),vec3(0.9,0.9,0.9),0.5), 1.0);
            } `,
            uniforms : {
                u_cellsNum: { type: "f", value: cellsNum },
                u_cellsScale: { type: "f", value: cellsScale },
            }
    });
}

function initInput() {

    inputManager.mouseMoveX("scrolling_x",-1);
    inputManager.mouseMoveY("scrolling_y",-1);
    inputManager.mouseScrollY("zooming",0.0005);

    inputManager.mousePress("start_look",2);
    inputManager.mouseDepress("stop_look",2);
    inputManager.mouseDown("look",2);

    inputManager.mousePress("click",0);
    
    inputManager.mouseCursorX("cursor_x");
    inputManager.mouseCursorY("cursor_y");
}

function initGraphics() {

    
    redMtrl = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 1 } );
    purpleMtrl = new THREE.LineBasicMaterial( { color: 0xff55aa, linewidth: 1 } );
    

    squareGeom=createSquareGeometry();
    
    
    boardMesh=new THREE.Mesh(squareGeom, createBoardMaterial());
    boardMesh.frustumCulled=false;
    //boardMesh.scale.x=cellsTotalScale*0.5;
    //boardMesh.scale.y=cellsTotalScale*0.5;
    //boardMesh.scale.z=cellsTotalScale*0.5;
    
    scene.add(boardMesh);
    

    squareMesh=createLineMesh([[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]]);

    //scene.add(squareMesh);

    /*
    crossMesh=createLineSegMesh([[-1,-1],[1,1],[-1,1],[1,-1]]);
    scene.add(crossMesh);
    crossMesh.scale.x=2;
    crossMesh.scale.y=2;
    crossMesh.scale.z=2;
    crossMesh.position.y=0.1;*/
    
    

    squareMesh.scale.x=2;
    squareMesh.scale.y=2;
    squareMesh.scale.z=2;
    squareMesh.position.y=0.1;
    
    var squareMat=createSquareMaterial();
    
    crossMesh=new THREE.Mesh(squareGeom, squareMat);

    crossMesh.position.y=0.1;
    
    scene.add(crossMesh);


}



function onInit(inCanvas) {
    //
    canvas=inCanvas;
    canvas.oncontextmenu = (e)=>{e.preventDefault();};

    //
    inputManager=createInputManager(canvas);
    initInput();

    //
    renderer = new THREE.WebGLRenderer( { canvas: canvas,antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( canvas.width, canvas.height );

    //
    
    scene = new THREE.Scene();
    
    //
    
    initGraphics();

    //
    log('started',null,5000);
    
    //
    return true;
}


function onStep(stepTime) {

}

function onResize(w,h) {
}

function updateTopViewCamera() {
    topViewUpdate(curPosZoom,scrolling,zooming,cursor,screenSize,[0.05,5]);
    
    camera = camera||new THREE.OrthographicCamera( -1, 1, 1, -1, -1, 1 );

    camera.right=screenSize[0]*0.5*curPosZoom[2];
    camera.left=-camera.right;
    camera.top=screenSize[1]*0.5*curPosZoom[2];
    camera.bottom=-camera.top;
    camera.near=-1;
    camera.far=1;
    camera.updateProjectionMatrix();

    camera.position.x=curPosZoom[0];
    camera.position.y=1;
    camera.position.z=curPosZoom[1];

    camera.up=new THREE.Vector3(0,0,-1);
    camera.lookAt(new THREE.Vector3(camera.position.x,camera.position.y-1,camera.position.z));
}

function screenToWorld(p) {
    var s2w=new THREE.Vector3((p[0]/screenSize[0])*2-1,((screenSize[1]-p[1]-1)/screenSize[1])*2-1,0);
    s2w.unproject( camera );
    return s2w.toArray();
}

function worldToScreen(p) {
    var w2s=new THREE.Vector3(p[0],p[1],p[2]);
    w2s.project( camera );
    w2s.x=(w2s.x*0.5+0.5)*screenSize[0];
    w2s.y=(w2s.y*0.5+0.5)*screenSize[1];
    return [w2s.x,w2s.y];
}

function onUpdate(stepTime,interpTime,deltaTime) {

    if(inputManager.get("start_look")) {
        canvas.requestPointerLock();
    }

    if(inputManager.get("stop_look")) {
        document.exitPointerLock();
    }
    
    updateTopViewCamera();

    var s2w=screenToWorld(cursor);
    var w2s=worldToScreen(s2w);
    drawMesh(crossMesh,[s2w[0],s2w[2]],[1,1])

    
    log(s2w.map(x=>Math.floor(x)),"s2w0");
    log(w2s.map(x=>Math.floor(x)),"w2s0");
    
    log([camera.position.x,camera.position.y,camera.position.z],"camera pos");
    
    
    for(var i=0;i<drawings.length;i++) {
        scene.add(drawings[i]);
    }
    
    renderer.render( scene, camera );
    renderer.clearDepth();
    
    for(var i=0;i<drawings.length;i++) {
        scene.remove(drawings[i]);
    }
    
    drawings=[];

}

function onRun() {

    //
    inputManager.begin();
    
    scrolling=inputManager.get("look")?inputManager.get("scrolling_x","scrolling_y"):[0,0];
    zooming=inputManager.get("zooming");
    screenSize=[canvas.width,canvas.height];
    cursor=inputManager.get("cursor_x","cursor_y").map(x=>Math.max(0,x));

    //cursor[1]=screenSize[1]-cursor[1]-1;
    log(cursor,"cursor");

    fixedTimeStep(getTime(),1/60,5,(stepTime)=>{
        onStep(stepTime);
    },(stepTime,interpTime,deltaTime)=>{
        onUpdate(stepTime,interpTime,deltaTime);
    });

    inputManager.end();

    //
    log(calcFPS().toFixed(1),'fps');
    return true;
}
