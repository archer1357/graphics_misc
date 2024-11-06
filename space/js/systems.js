
//calculate linear thrust

addSteppedSystem(['position','velocity','thrust','facing','targetFacing'],(entities,dt)=>{
    for(var i=0;i<entities.length;i++) {
        var entity=entities[i];
  //      log(entity.facing.toFixed(5),'entity.facing');
  //      log(entity.targetFacing.toFixed(5),'entity.targetFacing');
        
        var dx=Math.cos(entity.facing);
        var dy=Math.sin(entity.facing);
        
            var px=entity.position[0]+dx*entity.dimBack;
            var py=entity.position[1]+dy*entity.dimBack;
            var vx=entity.velocity[0]-dx*dt*2000;
            var vy=entity.velocity[1]-dy*dt*2000;
            //entity.velocity[0]-entity.thrust[0]*dt*q,entity.velocity[1]-entity.thrust[1]*dt*q
        if(Math.abs(entity.facing-entity.targetFacing)<0.01) {
            //createParticle(px,py,vx,vy,2,[1,0.9,0.3]);
            
        //   entity.velocity[0]+=entity.thrust[0]*dt;
        //    entity.velocity[1]+=entity.thrust[1]*dt;
            //log("q");
            
            var q=100;
            
            
            
        } else {
            //createParticle(px,py,vx,vy,2,[1,1,1]);
        }
    }
});

//calculate linear motion

addSteppedSystem(['position','velocity'],(entities,dt)=>{
    for(var i=0;i<entities.length;i++) {
        var entity=entities[i];
        
        entity.position[0]+=entity.velocity[0]*dt;
        entity.position[1]+=entity.velocity[1]*dt;
    }
});

//calculate turning

addSteppedSystem(['facing','turnRate','targetFacing'],(entities,dt)=>{
    for(var i=0;i<entities.length;i++) {
        var entity=entities[i];
        
        var diff=clampRadiansRange(entity.targetFacing-entity.facing);
        var diffDir=Math.sign(diff);
        var diffAmount=Math.abs(diff);
        
        entity.facing=clampRadiansRange((entity.turnRate*dt>diffAmount)?entity.targetFacing:(entity.facing+diffDir*entity.turnRate*dt));
        
    }
});

//calculate nearest neighbors

addSteppedSystem(['position','nearest'],(entities,dt)=>{
    var tree = rbush(9);
    
    for(var i=0;i<entities.length;i++) {
        var entity=entities[i];
        
        
        var x=entity.position[0];
        var y=entity.position[1];
        
        tree.insert({minX:x-1,minY:y-1,maxX:x+1,maxY:y+1,entity:entity});
    }
    
    
    for(var i=0;i<entities.length;i++) {
        var entity=entities[i];
        
      
        var x=entity.position[0];
        var y=entity.position[1];
        
        //var result = tree.search({    minX: x-50,    minY: y-50,    maxX: x+50,maxY: y+50});
         
        var neighbors = knn(tree, x, y, 3,(q)=>q.entity!==entity);
        
        while(entity.nearest.length > 0) {
            entity.nearest.pop();
        }
        
        //log(result.length,"hmm");
        
        //for(var j=0;j<result.length;j++) {
        //}
     
        for(var j=0;j<neighbors.length;j++) {
            entity.nearest.push(neighbors[j].entity);
        }
  
    }
});

//flocking

//

addSteppedSystem(['position','targetFacing','thrust','xThrustErrs','yThrustErrs','thrustPIDRatios','thrustMax'],(entities,dt)=>{
    
    for(var i=0;i<entities.length;i++) {
        var entity=entities[i];
        
        var xDiff=worldCursor[0]-entity.position[0];
        var yDiff=worldCursor[1]-entity.position[1];
        var bearing=Math.atan2(yDiff,xDiff);


        arrayShiftInsert(entity.xThrustErrs,xDiff);
        arrayShiftInsert(entity.yThrustErrs,yDiff);
        
        
        var xPID=pidController(dt,entity.xThrustErrs);
        var yPID=pidController(dt,entity.yThrustErrs);
    
        entity.thrust[0]=vec3_dot(xPID,entity.thrustPIDRatios);
        entity.thrust[1]=vec3_dot(yPID,entity.thrustPIDRatios);
        
       vec2_vecmin(entity.thrust,entity.thrust,entity.thrustMax);

       if(i==0) {
            log((bearing*(180/Math.PI)).toFixed(1),'bearing');
        
            log(entity.xThrustErrs.map(x=>x.toFixed(2)),'entity.xThrustErrs');
            log(entity.yThrustErrs.map(x=>x.toFixed(2)),'entity.yThrustErrs');
            
            log([xPID[0],yPID[0]].map(x=>x.toFixed(2)),"P");
            log([xPID[1],yPID[1]].map(x=>x.toFixed(2)),"I");
            log([xPID[2],yPID[2]].map(x=>x.toFixed(2)),"D");
              log(entity.thrust.map(x=>x.toFixed(2)),'entity[0].thrust');
              log(vec2_length(entity.thrust[0],entity.thrust[1]).toFixed(2),'entity[0].thrustSpeed');
              log(vec2_length(entity.velocity[0],entity.velocity[1]).toFixed(2),'entity[0].speed');
       }
       

   
        entity.targetFacing=Math.atan2(entity.thrust[1],entity.thrust[0]);
        
    }
});


addSteppedSystem(['age','life'],(entities,dt)=>{
    for(var i=0;i<entities.length;i++) {
        var entity=entities[i];
        
        if(entity.age<entity.life) {
            entity.age+=dt;
        } else {
            entity.remove=true;
        }
    }
});

//

function transformInit(modelMat,p,a) {
    glMatrix.mat3.identity(modelMat);
    glMatrix.mat3.translate(modelMat,modelMat, p);
    glMatrix.mat3.rotate(modelMat,modelMat, a);
}

function transformLine(modelMat,a,b,thickness) {
    var d=[b[0]-a[0],b[1]-a[1]];
    var mid=[a[0]+d[0]*0.5,a[1]+d[1]*0.5];
    var angle=Math.atan(d[1]/d[0]);
    var len=Math.sqrt(d[0]*d[0]+d[1]*d[1]);
    
    //~ log(d,'_d');
    //~ log(len,'_len');
    
    //~ log(mid,'_mid');
    //~ log(angle,'_angle');

    glMatrix.mat3.translate(modelMat,modelMat, mid);
    glMatrix.mat3.rotate(modelMat,modelMat, angle);
    glMatrix.mat3.scale(modelMat,modelMat, [len,thickness]);
    
}

function drawLine(gl,prog,modelMat,col) {
    mygl.setUniform(gl,gl.uniformMatrix3fv,"u_modelMat",false,modelMat);
    mygl.setUniform(gl,gl.uniform3fv,"u_col",col);
    mygl.applyUniforms(gl,prog);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0,4);
}


//render ships

/*
addRenderedSystem(['position','angle'],(entities,dt,it)=>{
    if(!gl || !prog || !vao) {return;}
    
    gl.useProgram(prog);
    gl.bindVertexArray(vao);

     mygl.setDrawStates(gl,true,{
        "depth_test":false,
    });
    
    var modelMat=glMatrix.mat3.create();
    
    
    for(var i=0;i<entities.length;i++) {
        var entity=entities[i];
        
        if(!("position" in entity) ||
            !("velocity" in entity) ||
            !("angle" in entity)
        ) { continue; }
        
        var angle=entity.angle;
        var x=entity.position[0]+entity.velocity[0]*dt*it;
        var y=entity.position[1]+entity.velocity[1]*dt*it;
   
        //main
        glMatrix.mat3.identity(modelMat);
        glMatrix.mat3.translate(modelMat,modelMat, entity.position);
        glMatrix.mat3.scale(modelMat,modelMat,[10,10]);
        
        mygl.uniformMatrix3fv(gl,"u_modelMat",false,modelMat);
        mygl.uniform3fv(gl,"u_col",[0.5,0.9,1]);
        mygl.uniformsApply(gl,prog);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0,4);
    
    }
});
*/


addRenderedSystem(['position','velocity','col','age','life'],(entities,dt,it)=>{
    if(!squareProg || !squareVao) {return;}

    gl.useProgram(squareProg);
    gl.bindVertexArray(squareVao);

     mygl.setDrawStates(gl,true,{
        "depth_test":false,
    });
    
    var modelMat=glMatrix.mat3.create();
    
    for(var i=0;i<entities.length;i++) {
        var entity=entities[i];

        var x=entity.position[0]+entity.velocity[0]*dt*it;
        var y=entity.position[1]+entity.velocity[1]*dt*it;
        
        var t=1-entity.age/entity.life;
        
        var cc=palette(t,[1,0.5,0.4],[1,0.5,0.5],[0.6,0.6,0.6],[0.6,0.6,0.6]);
        
        // 
        glMatrix.mat3.identity(modelMat);
        glMatrix.mat3.translate(modelMat,modelMat, entity.position);
        glMatrix.mat3.scale(modelMat,modelMat, [2,2]);
        
        mygl.setUniform(gl,gl.uniformMatrix3fv,"u_modelMat",false,modelMat);
        mygl.setUniform(gl,gl.uniform3fv,"u_col",cc);//entity.col.map(x=>x*(1-t))
        mygl.applyUniforms(gl,squareProg);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0,4);
        
    }
});

addRenderedSystem(['position','facing','velocity'],(entities,dt,it)=>{
    if(!squareProg || !squareVao) {return;}

    gl.useProgram(squareProg);
    gl.bindVertexArray(squareVao);

     mygl.setDrawStates(gl,true,{
        "depth_test":false,
    });
    
    var modelMat=glMatrix.mat3.create();
    
    for(var i=0;i<entities.length;i++) {
        var entity=entities[i];
       
        var angle=entity.facing;
        var x=entity.position[0]+entity.velocity[0]*dt*it;
        var y=entity.position[1]+entity.velocity[1]*dt*it;
                
        
        //main
        transformInit(modelMat,[x,y],angle);
        transformLine(modelMat,[-5,0],[entity.dimFront,0],4);
        drawLine(gl,squareProg,modelMat,[0.5,0.5,0.5]);

        //back
        transformInit(modelMat,[x,y],angle);
        transformLine(modelMat,[-5,0],[entity.dimBack,0],4);
        drawLine(gl,squareProg,modelMat,[0.7,0.7,0.7]);
    }
});


/*

   

        
        //thrust
        if(entity.thrust>0) {
            transformInit(modelMat,[x,y],angle);
            transformLine(modelMat,[-4,0],[-4-4,0],3);
            drawLine(gl,prog,modelMat,[0.4,0.9,1]);
        }
        
        //other thrust col
        var col2=[0.5,0.9,1];
        var thickness2=1;
        var length2=5;
        var frontPos=7;
        var backPos=-3;
        
        //reverse thrust
        if(entity.thrust<0) {
            transformInit(modelMat,[x,y],angle);
            transformLine(modelMat,[8,0],[8+length2,0],thickness2);
            drawLine(gl,prog,modelMat,col2);
        }

        //left rear thrust
        
        if(entity.turn>0 || entity.strafe<0) {
            transformInit(modelMat,[x,y],angle);
            transformLine(modelMat,[backPos,1.75],[backPos,1.75+length2],thickness2);
            drawLine(gl,prog,modelMat,col2);
        }
        
        //left front thrust
        if(entity.turn<0 || entity.strafe<0) {
            transformInit(modelMat,[x,y],angle);
            transformLine(modelMat,[frontPos,1.75],[frontPos,1.75+length2],thickness2);
            drawLine(gl,prog,modelMat,col2);
        }
        
        //right rear thrust
        if(entity.turn<0 || entity.strafe>0) {
            transformInit(modelMat,[x,y],angle);
            transformLine(modelMat,[backPos,-1.75],[backPos,-1.75-length2],thickness2);
            drawLine(gl,prog,modelMat,col2);
        }
        
        //right front thrust
        if(entity.turn>0 || entity.strafe>0) {
            transformInit(modelMat,[x,y],angle);
            transformLine(modelMat,[frontPos,-1.75],[frontPos,-1.75-length2],thickness2);
            drawLine(gl,prog,modelMat,col2);
        }

        //
        //[1,1,0.5]

*/
