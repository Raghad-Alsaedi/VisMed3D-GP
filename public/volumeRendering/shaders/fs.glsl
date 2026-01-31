#version 300 es
  precision mediump float;
    out vec4 outputColor;
    in vec3 worldPosition;
  void main() { 

    outputColor = vec4(worldPosition, 1.0);
    
  }