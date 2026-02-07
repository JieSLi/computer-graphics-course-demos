"use strict";

//
// Shaders
//
const vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec3 a_color;

uniform mat4 u_matrix;

out vec3 v_color;

void main() {
  gl_Position = u_matrix * a_position;
  v_color = a_color;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_color;
out vec4 outColor;

void main() {
  outColor = vec4(v_color, 1.0);
}
`;
