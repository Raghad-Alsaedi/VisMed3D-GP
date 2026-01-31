#version 300 es
precision mediump float;

// 3D vertex position
in vec3 vertexPosition;


out vec3 worldPosition;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main() {
    worldPosition=vertexPosition;
    // Apply the camera and perspective transformation
    gl_Position = projectionMatrix * viewMatrix  * modelMatrix* vec4(vertexPosition, 1.0);
}