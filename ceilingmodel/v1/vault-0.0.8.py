#!BPY
# -*- coding: utf-8 -*-

"""
Name: 'Domical Vault 0.0.7'
Blender: 248
Group: 'Add'
Tip: 'Create a Domical Vault'
"""

#########################################################################
#							    										#
# Blender Domical Vault Script			            					#
#						            									#
# Original version:  December 2003 Neil McAllister			   			#
#							    										#
#########################################################################
# History																#
# V: 0.0.1     - 27-12-03 - First Working Version						#
# V: 0.0.1-rh  - modified by Reed Hedges								#
# V: 0.0.1-bc  - modified by Bartius Crouch								#
#		added real-time, reset, resolution, and square					#
# V: 0.0.2     - modified by Bartius Crouch								#
#		prevented over-write on re-opening by adding new vault 			#
# V: 0.0.3     - modified by Bartius Crouch								#
#		new GUI, presets, fulldome, triangles							#
# V: 0.0.4     - modified by Neil McAllister							#
#		made full vault in single mesh, fixed prediction       			#
# V: 0.0.5     - modified by Sylvain Gailloud                           #
#		adapted a parameter for Blender 2.44                   			#
# V: 0.0.6	   - modified by Bartius Crouch								#
#		removed presets, automatic vertex prediction, easier way		#
#		to handle multiple vaults										#
# V: 0.0.7     - removed copyright mark, since the new Blender version	#
#		has trouble with the encoding									#
# V: 0.0.8     - modified by Neil McAllister							#
#		extra parameters to control each arch independently, allowing	#
#		a greater variety of vaults.									#
#########################################################################

import Blender
from Blender import *
from math import *

BL_VERSION = Blender.Get('version')
if (BL_VERSION<=223):
	import Blender210

length=Blender.Draw.Create(4.0)
width=Blender.Draw.Create(4.0)
pointyl=Blender.Draw.Create(1.0)
pointyw=Blender.Draw.Create(1.0)
pointyd=Blender.Draw.Create(1.0)
resolution=Blender.Draw.Create(4)

square=Blender.Draw.Create(0)
fullvault=Blender.Draw.Create(1)
triangles=Blender.Draw.Create(1)
realtime=Blender.Draw.Create(0)

name=Blender.Draw.Create("Vault 1")
vertcount=Blender.Draw.Create("Not yet available")

#########################################################################
# MAIN																	#
#########################################################################
def ConstructVault(firstrun):
	global pointyl, pointyw, pointyd, length, width, resolution, triangles, fullvault, name
	if Window.EditMode(): Window.EditMode(0)
	scn = Scene.GetCurrent()
	
	if firstrun:
		me=Mesh.New(name.val)
		name = Blender.Draw.Create(me.name)
		ob = scn.objects.new(me,name.val)
	else:
		try:
			me=Mesh.Get(name.val)
		except:
			me=Mesh.New(name.val)
			ob = scn.objects.new(me, name.val)
	me.verts = None
	
	n=resolution.val
	l=length.val
	w=width.val
	pl=pointyl.val
	pw=pointyw.val
	pd=pointyd.val
	d=sqrt(l*l+w*w)
	alphal=acos(1-1/(2*pl))
	thetal=alphal/n
	alphaw=acos(1-1/(2*pw))
	thetaw=alphaw/n
	alphad=acos(1-1/(2*pd))
	thetad=alphad/n
	rl=l*pl*2
	rw=w*pw*2
	rd=d*pd*2
	
	if (fullvault.val==1):
		r=range(-n,n+1)
	else:
		r=range(0,n+1)
	
	verts = []
	for i in r:
		iabs=n-abs(i)
		isign=cmp(i,0)
		
		for j in r:
			jabs=n-abs(j)
			jsign=cmp(j,0)
			
			x=isign*(rd*cos(thetad*iabs)-rd+d)*w/d
			y=jsign*(rd*cos(thetad*jabs)-rd+d)*l/d
			
			if iabs<jabs:
				z=sqrt(rl**2-(abs(y)-l+rl)**2)-sqrt(rl**2-(abs(x)*l/w-l+rl)**2)+sqrt(rd**2-(abs(x)*d/w-d+rd)**2)
			else:
				z=sqrt(rw**2-(abs(x)-w+rw)**2)-sqrt(rw**2-(abs(y)*w/l-w+rw)**2)+sqrt(rd**2-(abs(y)*d/l-d+rd)**2)
			
			v=Mathutils.Vector(x,y,z)
			verts.append(v)
	me.verts.extend(verts)
	
	n0=len(r)
	
	faces = []
	for i in range(0,n0-1):
		for j in range(0,n0-1):
			if i==j:
				if (triangles.val==1):
					#triangles just above the middle
					f=NMesh.Face()
					f.v.append(me.verts[i*n0+j])
					f.v.append(me.verts[i*n0+j+1])
					f.v.append(me.verts[(i+1)*n0+j+1])
					faces.append(f)
					
					#triangles just below the middle
					f=NMesh.Face()
					f.v.append(me.verts[i*n0+j])
					f.v.append(me.verts[(i+1)*n0+j+1])
					f.v.append(me.verts[(i+1)*n0+j])
					faces.append(f)
				
				else:
					#no triangles, but squares around the middle
					f=NMesh.Face()
					f.v.append(me.verts[i*n0+j])
					f.v.append(me.verts[i*n0+j+1])
					f.v.append(me.verts[(i+1)*n0+j+1])
					f.v.append(me.verts[(i+1)*n0+j])
					faces.append(f)
			elif (i+j==2*n-1)&fullvault.val==1:
				if (triangles.val==1):
					#triangles just above the middle
					f=NMesh.Face()
					f.v.append(me.verts[(i+1)*n0+j])
					f.v.append(me.verts[i*n0+j+1])
					f.v.append(me.verts[(i+1)*n0+j+1])
					faces.append(f)
					
					#triangles just below the middle
					f=NMesh.Face()
					f.v.append(me.verts[i*n0+j])
					f.v.append(me.verts[i*n0+j+1])
					f.v.append(me.verts[(i+1)*n0+j])
					faces.append(f)
				
				else:
					#no triangles, but squares around the middle
					f=NMesh.Face()
					f.v.append(me.verts[i*n0+j])
					f.v.append(me.verts[i*n0+j+1])
					f.v.append(me.verts[(i+1)*n0+j+1])
					f.v.append(me.verts[(i+1)*n0+j])
					faces.append(f)
			
			else:
				#all other faces
				f=NMesh.Face()
				f.v.append(me.verts[i*n0+j])
				f.v.append(me.verts[i*n0+j+1])
				f.v.append(me.verts[(i+1)*n0+j+1])
				f.v.append(me.verts[(i+1)*n0+j])
				faces.append(f)
	me.faces.extend(faces)
	Blender.Redraw()
	CalcVertCount()

def SetAgain():
	global pointyl, pointyw, pointyd, length, width, resolution, realtime, square
	global triangles, fullvault
	
	length=Blender.Draw.Create(4.0)
	width=Blender.Draw.Create(4.0)
	pointyl=Blender.Draw.Create(1.0)
	pointyw=Blender.Draw.Create(1.0)
	pointyd=Blender.Draw.Create(1.0)
	resolution=Blender.Draw.Create(4)
	
	square=Blender.Draw.Create(0)
	fullvault=Blender.Draw.Create(1)
	triangles=Blender.Draw.Create(1)
	realtime=Blender.Draw.Create(0)
	
	ConstructVault(False)
	Blender.Draw.Redraw(1)

def CalcVertCount():
	global vertcount, resolution, fullvault
	if fullvault.val==1:
		n = resolution.val*2+1
	else:
		n = resolution.val+1
	vertcount.val = str(n*n)

def RetrieveMesh():
	global name
	if Object.GetSelected():
		sel = Object.GetSelected()[0]
		if sel.type == 'Mesh':
			name =  Draw.Create(sel.getData(True))
		else:
			Draw.PupMenu("Error%t|Selected object isn't a mesh")
	else:
		Draw.PupMenu("Error%t|No object selected")

#########################################################################
# GUI																	#
#########################################################################
def drawUI():
	global pointyl, pointyw, pointyd, length, width, resolution, realtime, square
	global triangles, fullvault, vertcount, name
	BGL.glColor3f(0.0,0.0,0.0)	# outer edge:	black
	BGL.glRectf(0,0,342,363)
	BGL.glColor3f(0.8,0.8,0.8)	# title:		light grey
	BGL.glRectf(2,2,340,360)
	BGL.glColor3f(0.0,0.0,0.0)	# first edge:	black
	BGL.glRectf(0,0,342,328)
	BGL.glColor3f(0.7,0.8,0.7)	# mesh sets:	light green
	BGL.glRectf(2,2,340,326)
	BGL.glColor3f(0.0,0.0,0.0)	# second edge:	black
	BGL.glRectf(0,0,342,131)
	BGL.glColor3f(0.7,0.7,0.7)	# update sets:	grey
	BGL.glRectf(2,2,340,129)
	BGL.glColor3f(0.0,0.0,0.0)	# third edge:	black
	BGL.glRectf(0,0,342,40)
	BGL.glColor3f(0.7,0.7,0.7)	# exit/reset:	grey
	BGL.glRectf(2,2,340,38)
	
	BGL.glColor3f(0.9,0.0,0.0)
	BGL.glRasterPos2d(10, 345)
	Blender.Draw.Text("Blender Domical Vault Script")
	BGL.glColor3f(0.7,0.0,0.0)
	BGL.glRasterPos2d(10, 332)
	Blender.Draw.Text("Original by: Neil McAllister, DEC 2003")
	
	length=Blender.Draw.Slider("Length ", 61,10, 295, 250, 20, length.val, 0, 100, 1,"Length of the mesh")
	width=Blender.Draw.Slider("Width ", 62, 10, 270, 250, 20, width.val, 0, 100, 1, "Width of the mesh")
	pointyl=Blender.Draw.Slider("Pointiness (length)", 2, 10, 245, 325, 20, pointyl.val, 0.25, 4, 1, "Pointiness of the mesh")
	pointyw=Blender.Draw.Slider("Pointiness (width)", 2, 10, 220, 325, 20, pointyw.val, 0.25, 4, 1, "Pointiness of the mesh")
	pointyd=Blender.Draw.Slider("Pointiness (diagonal)", 2, 10, 195, 325, 20, pointyd.val, 0.25, 4, 1, "Pointiness of the mesh")
	resolution=Blender.Draw.Slider("Resolution ", 2, 10, 170, 250, 20, resolution.val, 2,64,1, "Higher resolution = more vertices")
	square=Blender.Draw.Toggle("Square", 6, 265, 295, 50, 20, square.val, "Make the mesh square")
	fullvault=Blender.Draw.Toggle("Full dome", 2, 10, 140, 60, 20, fullvault.val, "Quarter vault vs. full vault")
	triangles=Blender.Draw.Toggle("Triangles", 2, 90, 140, 60, 20, triangles.val, "Should there be triangles in the mesh?")

	name=Blender.Draw.String("Name: ", 7, 10, 100, 250, 20, name.val,99, "Enter the name of the new vault")
	vertcount=Blender.Draw.String("Number of vertices: ", 7, 10, 75, 250, 20, vertcount.val, 99, "(Predicted) number of vertices in the mesh")
	Blender.Draw.Button("Select",8,265,100,50,20,"Work on the in the 3D-view selected mesh")
	Blender.Draw.Button("Update", 3, 10, 50, 60, 20, "Update the mesh")
	realtime=Blender.Draw.Toggle("Real-time", 5, 90, 50, 60, 20, realtime.val, "Update the mesh in real-time")
	
	Blender.Draw.Button("Reset", 4, 10, 10, 40, 20, "Reset the values")
	Blender.Draw.Button("Exit", 1, 90, 10, 40, 20, "Exit, doesn't delete the mesh")

def event(evt, val):
	if (evt== Blender.Draw.QKEY and not val):
		Blender.Draw.Exit()

def bevent(evt):
	global length, width, realtime, square, name
	if (evt== 1):   			# Exit button
		Blender.Draw.Exit()
	elif (evt== 2): 			# Slider & triangles button
		if(realtime.val == 1):
			ConstructVault(False)
		CalcVertCount()
		Blender.Draw.Redraw(1)
	elif (evt == 3):  			# Update button
		ConstructVault(False)
		Blender.Draw.Redraw(1)
	elif (evt == 4):			# Reset button
		SetAgain()
	elif (evt == 5):			# Real-time button
		ConstructVault(False)
		Blender.Draw.Redraw(1)
	elif (evt == 6):			# Square button
		if(square.val == 1):
			width = length
		if(realtime.val == 1):
			ConstructVault(False)
		Blender.Draw.Redraw(1)
	elif (evt == 61):			# Square: length slider changed
		if(square.val == 1):
			width = length
		if(realtime.val == 1):
			ConstructVault(False)
		Blender.Draw.Redraw(1)
	elif (evt == 62):			# Square: width slider changed
		if(square.val == 1):
			length = width
		if(realtime.val == 1):
			ConstructVault(False)
		Blender.Draw.Redraw(1)
	elif (evt == 8):			# Work on the in the 3D-view selected mesh
		RetrieveMesh()
		Blender.Draw.Redraw(1)

ConstructVault(True)
CalcVertCount()
Blender.Draw.Register(drawUI, event, bevent)