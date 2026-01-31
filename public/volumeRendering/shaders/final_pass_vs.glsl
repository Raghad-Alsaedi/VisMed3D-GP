#version 300 es
precision highp float;

out vec2 vPosition2D;
out vec3 vPosition3D;

uniform mat4 uMvpInverseMatrix;

const vec2 vertices[] = vec2[](
    vec2(-1, -1),
    vec2( 3, -1),
    vec2(-1,  3)
);

float uDepth=1.0;
void main() {
    vec2 position = vertices[gl_VertexID];
    vPosition2D = position * 0.5 + 0.5;
    vec4 position3D = uMvpInverseMatrix * vec4(position, uDepth , 1);
    vPosition3D = position3D.xyz / position3D.w;
    gl_Position = vec4(position, 0, 1);
}

