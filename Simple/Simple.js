
mygl.createBuffer = function(gl,input) {
	var target_enums = {
		"ARRAY_BUFFER" : gl.ARRAY_BUFFER, 
		"ELEMENT_ARRAY_BUFFER" : gl.ELEMENT_ARRAY_BUFFER,
		"PIXEL_PACK_BUFFER" : gl.PIXEL_PACK_BUFFER, 
		"PIXEL_UNPACK_BUFFER" : gl.PIXEL_UNPACK_BUFFER,
		"COPY_READ_BUFFER" : gl.COPY_READ_BUFFER,
		"COPY_WRITE_BUFFER" : gl.COPY_WRITE_BUFFER,
		"TRANSFORM_FEEDBACK_BUFFER" : gl.TRANSFORM_FEEDBACK_BUFFER, 
		"UNIFORM_BUFFER" : gl.UNIFORM_BUFFER,
	};
	
	var usage_enums = {
		"STATIC_DRAW":gl.STATIC_DRAW,
		"STATIC_READ":gl.STATIC_READ,
		"STATIC_COPY":gl.STATIC_COPY,		
		"DYNAMIC_DRAW":gl.DYNAMIC_DRAW,
		"DYNAMIC_READ":gl.DYNAMIC_READ,
		"DYNAMIC_COPY":gl.DYNAMIC_COPY,
		"STREAM_DRAW":gl.STREAM_DRAW,
		"STREAM_READ":gl.STREAM_READ,
		"STREAM_COPY":gl.STREAM_COPY,
	};
	
	var vertexbuffer_type_enums = {
		"BYTE" : gl.BYTE,
		"SHORT" : gl.SHORT,
		"UNSIGNED_BYTE" : gl.UNSIGNED_BYTE,
		"UNSIGNED_SHORT" : gl.UNSIGNED_SHORT,
		"UNSIGNED_INT" : gl.UNSIGNED_INT,
		"FIXED" : gl.FIXED,
		"FLOAT" : gl.FLOAT
	};
	
	var indexbuffer_type_enums = {
		 "UNSIGNED_BYTE" : gl.UNSIGNED_BYTE,
		 "UNSIGNED_SHORT" : gl.UNSIGNED_SHORT,
		 "UNSIGNED_INT" : gl.UNSIGNED_INT,
	};
	
	var target = target_enums[input["target"].toUpperCase()];
	var usage = usage_enums[("usage" in input)?input["usage"].toUpperCase():"STATIC_DRAW"];
	var size = input["size"];
	var data = input["data"];
	
    var buf=gl.createBuffer();
	
	if(target==gl.ARRAY_BUFFER) {
		var attrib = input["attrib"];
		
		if(!(attrib instanceof Array)) {
			attrib = [attrib];
		}
		
		buf.attrib = [];
		
		for(var i=0;i<attrib.length;i++) {
			var type=vertexbuffer_type_enums[attrib[i]["type"].toUpperCase()];
			var size=attrib[i]["size"];
			var stride=("stride" in attrib[i])?attrib[i]["stride"]:0;
			var offset=("offset" in attrib[i])?attrib[i]["offset"]:0;
			var divisor=("divisor" in attrib[i])?attrib[i]["divisor"]:0;
			
			buf.attrib.push({"type":type,"size":size,"stride":stride,"offset":offset,"divisor":divisor});
		}
	} else if(target==gl.ELEMENT_ARRAY_BUFFER) {
		var type=indexbuffer_type_enums[input["type"].toUpperCase()];
		buf.type = type;
	}
	
    gl.bindVertexArray(null); //clear
    gl.bindBuffer(target, buf);
	
	if(data) {
		gl.bufferData(target, data,usage);
	} else {
		gl.bufferData(target, size,usage);
	}
	
    gl.bindBuffer(target, null); //clear
	
    return buf;
}


mygl.createVAO = function(gl,input) {

	var vao=gl.createVertexArray();
    gl.bindVertexArray(vao);
	
	var vertex_buffers = input["vertex_buffers"];
	
	for(var i=0;i<vertex_buffers.length;i++) {
		var buffer = vertex_buffers[i]["buffer"];
		var locations = vertex_buffers[i]["location"];
		
		if(!(locations instanceof Array)) {
			locations = [locations];
		}
		
		var attrib = buffer.attrib;
		
		gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
		
		for(var j=0;j<attrib.length;j++) {
			var type = attrib[j]["type"];
			var size=attrib[j]["size"];
			var stride=attrib[j]["stride"];
			var offset=attrib[j]["offset"];
			var divisor=attrib[j]["divisor"];
			var index = locations[j];

			gl.vertexAttribPointer(index,size,type,false,stride,offset);
			
			if(divisor!=0) {
				gl.vertexAttribDivisor(index,divisor);
			}
			
			gl.enableVertexAttribArray(index);
		}
		
	}
	
	if("index_buffer" in input) {
		var index_buffer = input["index_buffer"];
		vao.index_buffer_type = index_buffer.type;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index_buffer);
	}
	
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    
    return vao;
}

mygl.createShader=(gl,type,src,onError,onSuccess)=>{
    var shader=gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        onError(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    if(onSuccess) {
        onSuccess(shader);
    }

    return shader;
}

mygl.createProgram=(gl,vs,fs,beforeLinkCallback,onError,onSuccess)=>{
    var prog=gl.createProgram();
    gl.attachShader(prog,vs);
    gl.attachShader(prog,fs);
    
    if(beforeLinkCallback) {
        beforeLinkCallback(prog);
    }
    
    gl.linkProgram(prog);

    if(!gl.getProgramParameter(prog,gl.LINK_STATUS)) {
        onError(gl.getProgramInfoLog(prog));
        gl.deleteProgram(prog);
        return null;
    }
    
    if(onSuccess) {
        onSuccess(prog);
    }
    
    return prog;
}



var shaders={};

function createVertexShader(name,src) {
    var k=name+'_vs';
    
    shaders[k]=mygl.createShader(gl,gl.VERTEX_SHADER,src.trim(),(x)=>{
        log(k+':\n'+x);
    });
}

function createFragmentShader(name,src) {
    var k=name+'_fs';
    
    shaders[k]=mygl.createShader(gl,gl.FRAGMENT_SHADER,src.trim(),(x)=>{
        log(k+':\n'+x);
    });
}

function createProgram(vsName,fsName,beforeLink) {
    var k=vsName+' '+fsName;
    var vs=shaders[vsName+'_vs'];
    var fs=shaders[fsName+'_fs'];
    
    if(!vs || !fs) {
        return null;
    }
    
    return mygl.createProgram(gl,vs,fs,beforeLink,(x)=>{
        log(k+':\n'+x);
    });
}

var program;

function onInit() {
	log("hello");
    createVertexShader('square',`
        #version 300 es
        
        layout (location=0) in vec4 position;
        layout (location=1) in vec3 color;
        
        out vec3 vColor;

        void main() {

            vColor = color;
            gl_Position = position;
        }
    `);
    
    createFragmentShader('square',`
        #version 300 es
        precision highp float;
        
        in vec3 vColor;
        layout (location=0) out vec4 fragColor;
		
		
		//layout(binding = 0) uniform sampler2D u_colMap;

        void main() {
            fragColor = vec4(vColor, 1.0);
        }
`,(err)=>{log(err);});


    program=createProgram('square','square');
   

        gl.useProgram(program);

        /////////////////////
        // SET UP GEOMETRY
        /////////////////////
		
		var positionAndColorBuffer = mygl.createBuffer(gl,{
			"target":"array_buffer",
			"usage":"static_draw",
			"data":new Float32Array([ -0.5,-0.5,0.0, 1.0,0.0,0.0,   0.5,-0.5,0.0, 0.0,1.0,0.0,   0.0,0.5,0.0, 0.0,0.0,1.0]),		
			"attrib" : [
				{"type":"float","size":3,"stride":6*4,"offset":0,"divisor":0},
				{"type":"float","size":3,"stride":6*4,"offset":3*4,"divisor":0}
			]
		});
        

		var positionBuffer = mygl.createBuffer(gl,{
			"target":"array_buffer",
			"usage":"static_draw",
			"data":new Float32Array([-0.5,-0.5,0.0,0.5,-0.5,0.0,0.0,0.5,0.0]),
			"attrib" : {"type":"float","size":3},
		});

		var colorBuffer = mygl.createBuffer(gl,{
			"target":"array_buffer",
			"usage":"static_draw",
			"data":new Float32Array([1.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,1.0]),
			"attrib" : {"type":"float","size":3},
		});
		
		var indexBuffer = mygl.createBuffer(gl,{
			"target" : "element_array_buffer",
			"usage" : "static_draw",
			"data" : new Uint32Array([0,1,2]),
			"type" : "unsigned_int",
		});
		//
		
		var triangleVao2=mygl.createVAO(gl,{
			"vertex_buffers" : [{ "buffer" : positionAndColorBuffer, "location" : [0,1] }],
			"index_buffer" : indexBuffer
		});
		
		var triangleVao=mygl.createVAO(gl,{
			"vertex_buffers" : [
				{ "buffer" : positionBuffer, "location" : 0}, 
				{ "buffer" : colorBuffer, "location" : 1}
			],
			"index_buffer" : indexBuffer
		});
		
		gl.bindVertexArray(triangleVao);
	

        ////////////////
        // DRAW
        ////////////////
       
       
    return true;
}


function onStep(dt) {
}


function onRun(dt,it) {//canvas,gl,dt,it

    
    //
    
	
    //viewport
    gl.viewport(0,0,canvas.width,canvas.height);
    
    //clear
    gl.clearColor(0.2,0.3,0.5,1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    
	//gl.drawArrays(gl.TRIANGLES, 0, 3);
	 gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_INT, 0);

    //
    log(calcFPS().toFixed(1),'fps');
}