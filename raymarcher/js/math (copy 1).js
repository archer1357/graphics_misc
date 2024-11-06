var vec3=vec3||{};
var vec4=vec4||{};
var mat3=mat3||{};
var mat4=mat4||{};

vec3.add=(a,b)=>{
    if(Array.isArray(b)) {
        return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
    } else {
        return [a[0]+b,a[1]+b,a[2]+b];
    }
}

vec4.add=(a,b)=>{
    if(Array.isArray(b)) {
        return [a[0]+b[0],a[1]+b[1],a[2]+b[2],a[3]+b[3]];
    } else {
        return [a[0]+b,a[1]+b,a[2]+b,a[3]+b];
    }
}

vec3.sub=(a,b)=>{
    if(Array.isArray(b)) {
        return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
    } else {
        return [a[0]-b,a[1]-b,a[2]-b];
    }
}

vec4.sub=(a,b)=>{
    if(Array.isArray(b)) {
        return [a[0]-b[0],a[1]-b[1],a[2]-b[2],a[3]-b[3]];
    } else {
        return [a[0]-b,a[1]-b,a[2]-b,a[3]-b];
    }
}

vec3.mul=(a,b)=>{
    if(Array.isArray(b)) {
        return [a[0]*b[0],a[1]*b[1],a[2]*b[2]];
    } else {
        return [a[0]*b,a[1]*b,a[2]*b];
    }
}

vec4.mul=(a,b)=>{
    if(Array.isArray(b)) {
        return [a[0]*b[0],a[1]*b[1],a[2]*b[2],a[3]*b[3]];
    } else {
        return [a[0]*b,a[1]*b,a[2]*b,a[3]*b];
    }
}

vec3.div=(a,b)=>{
    if(Array.isArray(b)) {
        return [a[0]/b[0],a[1]/b[1],a[2]/b[2]];
    } else {
        return [a[0]/b,a[1]/b,a[2]/b];
    }
}

vec4.mul=(a,b)=>{
    if(Array.isArray(b)) {
        return [a[0]/b[0],a[1]/b[1],a[2]/b[2],a[3]/b[3]];
    } else {
        return [a[0]/b,a[1]/b,a[2]/b,a[3]/b];
    }
}

vec3.dot=(a,b)=>{
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
}

vec4.dot=(a,b)=>{
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];
}

vec3.length=(a)=>{
    return Math.sqrt(vec3.dot(a,a));
}

vec3.normal=(a)=>{
    return vec3.mul(a,1/vec3.length(a));
}

vec3.cross=(a)=>{
    return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
}

vec3.to_x0z=(a)=>{
    return [a[0],0,a[2]];
}

vec3.equal=(a,b)=>{
    if(Array.isArray(b)) {
        return a[0]==b[0] && a[1]==b[1] && a[2]==b[2];
    } else {
        return a[0]==b && a[1]==b && a[2]==b;
    }
}

vec4.equal=(a,b)=>{
    if(Array.isArray(b)) {
        return a[0]==b[0] && a[1]==b[1] && a[2]==b[2] && a[3]==b[3];
    } else {
        return a[0]==b && a[1]==b && a[2]==b && a[3]==b;
    }
}

mat3.identity=()=> {
    return [1,0,0, 0,1,0, 0,0,1];
}

mat4.identity=()=>{
    return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}

mat3.to_col=(a,col)=>{
    return a.slice(col*3,(col+1)*3);
}

mat4.to_col=(a,col)=>{
    return a.slice(col*4,(col+1)*4);
}

function vector(size) {
    if(size<2 || size>4) {
        return;
    }
    
    this.data=new Array(size).fill(0);
    
    Object.defineProperties(this,{
        "x":{"get":()=>this.data[0],"set":(x)=>{this.data[0]=x;}},
        "y":{"get":()=>this.data[1],"set":(y)=>{this.data[1]=y;}},
        "z":{"get":()=>this.data[2],"set":(z)=>{this.data[2]=z;}},
        "w":{"get":()=>this.data[3],"set":(w)=>{this.data[3]=w;}},
        "0":{"get":()=>this.data[0],"set":(x)=>{this.data[0]=x;}},
        "1":{"get":()=>this.data[1],"set":(y)=>{this.data[1]=y;}},
        "2":{"get":()=>this.data[2],"set":(z)=>{this.data[2]=z;}},
        "3":{"get":()=>this.data[3],"set":(w)=>{this.data[3]=w;}},
        "xy" :{"get":()=>vector.create([this.x,this.y]),
                     "set":(a)=>{this.x=a[0];this.y=a[1];}},
        "xyz" :{"get":()=>vector.create([this.x,this.y,this.z]),
                     "set":(a)=>{this.x=a[0];this.y=a[1];this.z=a[2];}},
        "xyzw" :{"get":()=>vector.create([this.x,this.y,this.z,this.w]),
                      "set":(a)=>{this.x=a[0];this.y=a[1];this.z=a[2];this.w=a[3];}},
                      
        
        "_0yz":{"get":()=>vector.create([0,this.y,this.z])},
        "_xy0":{"get":()=>vector.create([this.x,this.y,0])},
        "_x0z":{"get":()=>vector.create([this.x,0,this.z])},
        "_xyz0":{"get":()=>vector.create([this.x,this.y,this.z,0])},
        "_xyz1":{"get":()=>vector.create([this.x,this.y,this.z,1])},
    });
}

vector.create = function(q) {
    if(typeof q == 'number') {
        return new vector(q);
    } else if(Array.isArray(q) && q.length>=2 && q.length<=4) {
        var v=new vector(q.length);
        v.data=q.slice();
        return v;
    }
}

vector.prototype.mul = function(q) {
    if(typeof q == 'number') {
        var bla=this.data.map((x)=>x*q);
        return vector.create(bla);
    } else if(q instanceof vector && this.data.length==q.data.length){
        return vector.create(this.data.map((x,i)=>x*q.data[i]));
    } else if(Array.isArray(q) && this.data.length==q.length) {
        return vector.create(this.data.map((x,i)=>x*q[i]));
    }
}

vector.prototype.div = function(q) {
    if(typeof q == 'number') {
        return vector.create(this.data.map(x=>x/q));
    } else if(q instanceof vector && this.data.length==q.data.length){
        return vector.create(this.data.map((x,i)=>x/q.data[i]));
    } else if(Array.isArray(q) && this.data.length==q.length) {
        return vector.create(this.data.map((x,i)=>x/q[i]));
    }
}

vector.prototype.add = function(q) {
    if(typeof q == 'number') {
        return vector.create(this.data.map(x=>x+q));
    } else if(q instanceof vector && this.data.length==q.data.length){
        return vector.create(this.data.map((x,i)=>x+q.data[i]));
    } else if(Array.isArray(q) && this.data.length==q.length) {
        return vector.create(this.data.map((x,i)=>x+q[i]));
    }
}

vector.prototype.sub = function(q) {
    if(typeof q == 'number') {
        return vector.create(this.data.map(x=>x-q));
    } else if(q instanceof vector && this.data.length==q.data.length){
        return vector.create(this.data.map((x,i)=>x-q.data[i]));
    } else if(Array.isArray(q) && this.data.length==q.length) {
        return vector.create(this.data.map((x,i)=>x-q[i]));
    }
}

vector.prototype.dot = function(q) {
    if(q instanceof vector && this.data.length==q.data.length){
        return this.data.map((x,i)=>x*q.data[i]).reduce((x,y) => x+y, 0);
    } else if(Array.isArray(q) && this.data.length==q.length) {
        return this.data.map((x,i)=>x*q[i]).reduce((x,y) => x+y, 0);
    }
}

vector.prototype.cross = function(q) {
    if(q instanceof vector && this.data.length==q.data.length && this.data.length==3){
        var a=this.data;
        var b=q.data;
        return vector.create([a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]);
    } else if(Array.isArray(q) && this.data.length==q.length && this.data.length==3) {
        var a=this.data;
        var b=q;
        return vector.create([a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]);
    }
}

vector.prototype.length = function() {
    return Math.sqrt(this.dot(this));
}

vector.prototype.normal = function() {
    var len=this.length();
    return (len==0)?vector.create(this.data.length):this.mul(1/len);
}

vector.prototype.clone = function() {
    return vector.create(this.data);
}

vector.prototype.toArray = function() {
    return this.data.slice();
}

function matrix(rows,cols) {
    cols=cols||rows;
    
    if(rows<2 || rows>4 || cols <2 || rows>4) {
        return;
    }
    
    this.data=new Array(rows*cols).fill(0);
    this.rows=rows;
    this.cols=cols;
    
    Object.defineProperties(this,{
        "0":{"get":()=>this.data[0],"set":(x)=>{this.data[0]=x;}},
        "1":{"get":()=>this.data[1],"set":(x)=>{this.data[1]=x;}},
        "2":{"get":()=>this.data[2],"set":(x)=>{this.data[2]=x;}},
        "3":{"get":()=>this.data[3],"set":(x)=>{this.data[3]=x;}},
        "4":{"get":()=>this.data[4],"set":(x)=>{this.data[4]=x;}},
        "5":{"get":()=>this.data[5],"set":(x)=>{this.data[5]=x;}},
        "6":{"get":()=>this.data[6],"set":(x)=>{this.data[6]=x;}},
        "7":{"get":()=>this.data[7],"set":(x)=>{this.data[7]=x;}},
        "8":{"get":()=>this.data[8],"set":(x)=>{this.data[8]=x;}},
        "9":{"get":()=>this.data[9],"set":(x)=>{this.data[9]=x;}},
        "10":{"get":()=>this.data[10],"set":(x)=>{this.data[10]=x;}},
        "11":{"get":()=>this.data[11],"set":(x)=>{this.data[11]=x;}},
        "12":{"get":()=>this.data[12],"set":(x)=>{this.data[12]=x;}},
        "13":{"get":()=>this.data[13],"set":(x)=>{this.data[13]=x;}},
        "14":{"get":()=>this.data[14],"set":(x)=>{this.data[14]=x;}},
        "15":{"get":()=>this.data[15],"set":(x)=>{this.data[15]=x;}},
        
        
    });
}

matrix.create = function(rows,cols,vals) {
    vals=vals||cols;
    cols=cols||rows;
    
    if(vals.length!=rows*cols) {
        return;
    }
    
    var m=matrix(rows,cols);
    
    if(m==undefined) {
        return;
    }
    
    m.data=vals.slice();
    return m;
}

matrix.identity = function(size) {
    if(size==2||size==3||size==4) {
        var m=new matrix(size);
        
        for(var i=0;i<size;i++) {
            m.data[i+i*size]=1;
        }
        
        return m;
    }
}


matrix.prototype.transpose = function() {
}

matrix.prototype.inverse = function() {
}

matrix.prototype.mul = function(q) {
    //~ if(typeof q == 'number') {
        //~ var bla=this.data.map((x)=>x*q);
        //~ return vector.create(bla);
    //~ } else if(q instanceof vector && this.data.length==q.data.length){
        //~ return vector.create(this.data.map((x,i)=>x*q.data[i]));
    //~ } else if(Array.isArray(q) && this.data.length==q.length) {
        //~ return vector.create(this.data.map((x,i)=>x*q[i]));
    //~ }
    
    //- mul (matrix,array,vector,scalar)
}

matrix.prototype.div = function(a) {

}

matrix.prototype.add = function(a) {
    //- add (matrix,array)

}

matrix.prototype.sub = function(a) {
    
//- sub (matrix,array)

}

matrix.prototype.toSize = function(rows,cols) {
    
}

matrix.prototype.toArray = function() {
    return this.data.slice();
}

matrix.prototype.clone = function() {
    return matrix.create(this.rows,this.cols,this.data);
}

matrix.prototype.col = function(c) {
    return vector.create(this.data.slice(c*this.cols,(c+1)*this.cols));
}

matrix.prototype.row = function(r) {
    
}


function lerp( x, y, a) {
    return x*(1.0-a)+y*a;
}
