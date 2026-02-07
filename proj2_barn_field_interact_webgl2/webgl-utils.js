"use strict";

//
// WebGL Utility Functions
//
let gl, program, positionLocation, colorLocation, matrixLocation;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Error linking program:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function createMeshVAO(mesh) {
  if (!gl) {
    console.error("WebGL context not initialized");
    return null;
  }
  
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.colors, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);

  return {
    vao: vao,
    numElements: mesh.numElements
  };
}

function drawMesh(meshVAO, worldMatrix, viewProjMatrix) {
  if (!gl) return;
  const matrix = m4.multiply(viewProjMatrix, worldMatrix);
  gl.uniformMatrix4fv(matrixLocation, false, matrix);
  gl.bindVertexArray(meshVAO.vao);
  gl.drawElements(gl.TRIANGLES, meshVAO.numElements, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArray(null);
}

function initWebGL(canvasElement) {
  gl = canvasElement.getContext("webgl2");
  if (!gl) {
    console.error("WebGL2 not supported");
    return false;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    return false;
  }

  positionLocation = gl.getAttribLocation(program, "a_position");
  colorLocation = gl.getAttribLocation(program, "a_color");
  matrixLocation = gl.getUniformLocation(program, "u_matrix");

  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  return true;
}

function getGL() {
  return gl;
}

function getCanvas() {
  return gl ? gl.canvas : null;
}
