
function CharacterController(settings) {
    this.accelRate = settings.accel||1;
    this.decelRate = settings.decel||this.accelRate;
    this.max_speed = settings.speed||1;
    
    this.pitch=settings.pitch||0;
    this.yaw=settings.yaw||0;
    
    this.vel=[0,0,0];
    this.pos2=[0,0,0];
    this.pos=settings.pos.slice()||[0,0,0];

}

CharacterController.prototype.movePitch=function(p){
    this.pitch=clamp(this.pitch+p,-1.57,1.57);
}

CharacterController.prototype.moveYaw=function(y){
    this.yaw+=y;
}



CharacterController.prototype.calcStep=function(moveDir,stepTime){
      var moveDir2=mat3_mul_vec3(mat3_rotY(this.yaw), vec3_safe_nor(moveDir));

    firstPersonCalc(
        this.pos,this.pos2,this.vel,
        moveDir2,stepTime,
        this.accelRate, this.decelRate, this.max_speed);
    
    //move_dir=mat3_mul_vec3(mat3_rotY(this.yaw),vec3_eq_scalar(move_dir,0)?[0,0,0]:vec3_nor(move_dir));
    
//    this.vel=smoothVelCalc(this.vel, move_dir, stepTime, this.accelRate,this.decelRate,this.max_speed);    
   // var vel2=smoothVelCalc(this.vel, move_dir, stepTime, this.accelRate,this.decelRate,this.max_speed);
 
    //this.pos = vec3_add_vec3(this.pos, vec3_mul_scalar(this.vel, stepTime));
   // this.pos2 = vec3_add_vec3(this.pos, vec3_mul_scalar(vel2, stepTime));
}


/*
function firstPersonControllerCalc(
    moveDir,stepTime,
    pos,vel,yawPitch,
    accelRate,decelRate,maxSpeed) {

    var moveDir2=mat3_mul_vec3(mat3_rotY(yawPitch[0]),vec3_eq_scalar(moveDir,0)?[0,0,0]:vec3_nor(moveDir));
    
    var accel=firstPersonCalcAccel(this.vel,move_dir,accelRate,decelRate);
    this.vel=firstPersonCalcVel(this.vel,accel,moveDir2,maxSpeed,stepTime);
    
    var accelNext=firstPersonCalcAccel(this.vel,moveDir2,accelRate,decelRate);
    var velNext=firstPersonCalcVel(this.vel,accelNext,moveDir2,maxSpeed,stepTime) ;

    this.pos = vec3_add_vec3(this.pos, vec3_mul_scalar(this.vel, stepTime));
    this.posNext = vec3_add_vec3(this.pos, vec3_mul_scalar(velNext, stepTime));
}*/
//function firstPersonCalcAccel(vel,moveDir,accelRate,decelRate) {
 //   return (vec3_dot(moveDir,vel) > 0)?accelRate:decelRate;
//}
    //return vec3_lerp(lastVel,target,smoothstep(0,1,accel*stepTime));
    //var accel=firstPersonCalcAccel(this.vel,move_dir,this.accelRate,this.decelRate);
    //this.vel=firstPersonCalcVel(this.vel,accel,move_dir,this.max_speed,stepTime);
    
    //var accel2=firstPersonCalcAccel(this.vel,move_dir,this.accelRate,this.decelRate);
    //var vel2=firstPersonCalcVel(this.vel,accel2,move_dir,this.max_speed,stepTime) ;
    

    //this.target=vec3_mul_scalar(move_dir,this.max_speed);
   // this.accel=(vec3_dot(move_dir,this.vel) > 0)?this.accelRate:this.decelRate;
    //this.vel=vec3_lerp(this.vel,this.target,accel*stepTime);
   // this.springPos = vec3_lerp(this.pos,pos2,interpTime);
    //this.interpPos = vec3_add_vec3(this.pos, vec3_mul_scalar(this.vel, dt*interpTime));
    
    ///////var accel2=firstPersonCalcAccel(this.vel,this.moveDir,this.accelRate,this.decelRate);
    
    //////var vel2=firstPersonCalcVel(this.vel,accel2,this.moveDir,this.max_speed,stepTime) ;
    //var vel2=vec3_lerp(this.vel,this.target,accel2*stepTime);//interpTime
    ///////var pos2=vec3_add_vec3(this.pos, vec3_mul_scalar(vel2, stepTime));//interpTime
    //this.interpPos = pos2;//
    //
    
    // this.interpPos=this.pos;
   // console.log(this.pos + " " + this.interpPos);