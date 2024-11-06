

function palette(t,a,b,c,d) {
    return [0,1,2].map(i=>a[i]+b[i]*Math.cos(6.28318*(c[i]*t+d[i])));
}


function arrayShiftInsert(a,v) {
    for(var i=1;i<a.length;i++) {
        a[i]=a[i-1];
    }
    
    a[0]=v;
}
