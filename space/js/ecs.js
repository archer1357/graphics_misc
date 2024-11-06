
var entities={};
var systems=[];

function doesEntityHasSystemComponents(entity,system) {
    var count=0;
        
    for(var j=0;j<system.components.length;j++) {
        var component=system.components[j];
        
        if(component in entity) {
            count++;
        }
    }
    
    return count==system.components.length;
}

function removeEntities(entities) {
    var i=0;
    
    while(i<entities.length) {
        if(entities[i].remove) {
            entities[i]=entities[entities.length-1];
            entities.pop();
        }
        
        i++;
    }
}

function addSystem(components,steppped,rendered,callback) {
    var system={
        callback : callback,
        components : components,
        entities : [],
        stepped : steppped,
        rendered : rendered,
    };
    
    systems.push(system);
    
    //for(var i=0;i<entities.length;i++) {
    //    var entity=entities[i];
        
    //    if(doesEntityHasSystemComponents(entity,system)) {
    //        system.entities.push(entity);
    //    }
        
    //}
}

function addEntity(entity) {
    //entities.push(entity);
    
    for(var i=0;i<systems.length;i++) {
        var system=systems[i];
        
        if(doesEntityHasSystemComponents(entity,system)) {
            system.entities.push(entity);
        }
    }
    
    entity.remove=false;
    return entity;
}

function addSteppedSystem(components,callback) {
    addSystem(components,true,false,callback);
}

function addRenderedSystem(components,callback) {
    addSystem(components,false,true,callback);
}

function updateSteppedSystems(dt) {
    for(var i=0;i<systems.length;i++) {
        if(systems[i].stepped) {
            systems[i].callback(systems[i].entities,dt);
            //systems[i].callback(entities,dt);
        }
        
        removeEntities(systems[i].entities);
    }
    
}

function updateRenderedSystems(dt,it) {
    for(var i=0;i<systems.length;i++) {
        if(systems[i].rendered) {
            systems[i].callback(systems[i].entities,dt,it);
            //systems[i].callback(entities,dt,it);
        }
        
        removeEntities(systems[i].entities);
    }
    
}

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