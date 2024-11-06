var mygl=mygl||{};

//

mygl.createContext=(canvas,params,onError)=>{
    onError=onError||console.log;

    canvas.addEventListener("webglcontextcreationerror",(event)=>{
        onError(String(event.statusMessage).replace(new RegExp('[,.]', 'g'),'\n'));
    }, false);

    canvas.addEventListener('webglcontextlost',(event)=>{
        onError("WebGL2 context lost.\n");
    }, false);

    try {
        return canvas.getContext("webgl2",params);
    } catch(ex) { }

    onError("Could not initialise WebGL.");
    return null;
}