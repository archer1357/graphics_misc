
func boxInFrustum(frustum,bmin,bmax):
    #lighthouse3d.com/tutorials/view-frustum-culling/geometric-approach-testing-boxes-ii/
    
#    var result=true #inside
    var r=2 #inside
#
    for i in range(0,6):
        var n=frustum[i].normal*-1
        var bp=Vector3()
        bp.x=bmin.x if n.x<0 else bmax.x
        bp.y=bmin.y if n.y<0 else bmax.y
        bp.z=bmin.z if n.z<0 else bmax.z
        
        
        var bn=Vector3()
        bn.x=bmax.x if n.x<0 else bmin.x
        bn.y=bmax.y if n.y<0 else bmin.y
        bn.z=bmax.z if n.z<0 else bmin.z
        
        if n.dot(bp)+frustum[i].d < 0:
            return 0 #outside
        elif frustum[i].d+n.dot(bn) < 0: #<= ?
            r=1 #intersect

    return r
