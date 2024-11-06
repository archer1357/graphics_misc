#version 300 es

layout(location=0) in vec2 a_pos;

out vec2 screen;

void main() {
    screen=a_pos;
    gl_Position=vec4(a_pos,0.0,1.0);
}