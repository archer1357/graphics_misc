
function MyGraphics() {

}


MyGraphics.prototype.init=function(canvas,onError){
    this.canvas=canvas;
    
    this.gl=mygl.createContext(canvas,{
        antialias:true,
        premultipliedAlpha:false,
        alpha:false,
    },onError)
    
    if(!this.gl) {
        return false;
    }
    
    this.viewport();    
    return true;
}


MyGraphics.prototype.color_clear=function(r=1,g=1,b=1,a=1){
    var gl=this.gl;
    if(!gl) {return;}
    
    gl.clearColor(r,g,b,a);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

MyGraphics.prototype.depth_clear=function(depth=1){
    var gl=this.gl;
    if(!gl) {return;}
    
    gl.clearDepth(depth);
    gl.clear(gl.DEPTH_BUFFER_BIT);
}

MyGraphics.prototype.viewport=function(x,y,w,h){
    var gl=this.gl;
    if(!gl) {return;}

    x=(!x==undefined||x==null)?0:x;
    y=(!y==undefined||y==null)?0:y;
    w=(!w==undefined||w==null)?this.canvas.width:w;
    h=(!h==undefined||h==null)?this.canvas.height:h;
    
    gl.viewport(0,0,canvas.width,canvas.height);
}


