//from https://github.com/humbletim/glm-js

function glMatrix_project(out,obj, modelViewProjMat, viewport) {
    var tmp=glMatrix.vec4.fromValues(obj[0],obj[1],obj[2],1);
    glMatrix.vec4.transformMat4(tmp, tmp, modelViewProjMat);
    
    tmp[0]/=tmp[3];
    tmp[1]/=tmp[3];
    tmp[2]/=tmp[3];
    
    tmp[0]*=0.5;
    tmp[1]*=0.5;
    tmp[2]*=0.5;
    
    tmp[0]+=0.5;
    tmp[1]+=0.5;
    tmp[2]+=0.5;
    
    tmp[0]*=viewport[2];
    tmp[1]*=viewport[3];

    tmp[0]+=viewport[0];
    tmp[1]+=viewport[1];
    
    out[0]=tmp[0];
    out[1]=tmp[1];
    out[2]=tmp[2];
    return out;
} 
  
function glMatrix_unproject(out,win, invModelViewProjMat, viewport) {
    var tmp=glMatrix.vec4.fromValues(win[0],win[1],win[2],1);

    tmp[0]-=viewport[0];
    tmp[1]-=viewport[1];
    tmp[0]/=viewport[2];
    tmp[1]/=viewport[3];
    
    tmp[0]*=2;
    tmp[1]*=2;
    tmp[2]*=2;
    
    tmp[0]-=1;
    tmp[1]-=1;
    tmp[2]-=1;
    
    glMatrix.vec4.transformMat4(tmp, tmp, invModelViewProjMat);
    
    tmp[0]/=tmp[3];
    tmp[1]/=tmp[3];
    tmp[2]/=tmp[3];
    
    out[0]=tmp[0];
    out[1]=tmp[1];
    out[2]=tmp[2];
    return out;
}
