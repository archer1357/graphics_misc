
function CharacterController(settings) {
    this.settings={
        accel:settings.accel||1,
        decel:settings.decel||1,
        max_speed:settings.max_speed||1,
    };

    this.pitch=0;
    this.yaw=0;
    this.vel=[0,0,0];
}

CharacterController.prototype.movePitch=function(p){
    this.pitch+=p;
    this.pitch=clamp(this.pitch,-Math.PI/2,Math.PI/2);
}

CharacterController.prototype.moveYaw=function(y){
    this.yaw+=y;
}

CharacterController.prototype.calcVel=function(dir,dt){
    
    dir=vec3_eq(dir,0)?[0,0,0]:vec3_nor(dir);
    
    var yawMat=mat3_rotY(this.yaw);
    var pitchMat=mat3_rotX(this.pitch);
    var yawPitchMat=mat3_mul(yawMat,pitchMat);
    
    dir=mat3_mul(yawPitchMat,dir);

    var target=vec3_mul(dir,this.settings.max_speed);
    
    
    
    var hvel=this.vel.slice();//[this.vel[0],0,this.vel[2]];//this.vel[1]
 
    var accel;
    
    if(vec3_dot(dir,hvel) > 0) {
        accel = this.settings.accel;
    } else {
        accel = this.settings.decel;
    }
    

    hvel=vec3_lerp(hvel,target,accel*dt);
    
 
    
    this.vel = hvel;
    
    dir=[0,0,0];
}
