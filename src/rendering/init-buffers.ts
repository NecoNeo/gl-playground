function initBuffers(glCtx: WebGL2RenderingContext) {
  return {
    position: initPositionBuffer(glCtx),
    color: initColorBuffer(glCtx),
  };
}

function initPositionBuffer(glCtx: WebGL2RenderingContext) {
  const positionBuffer = glCtx.createBuffer();
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, positionBuffer);
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(positions), glCtx.STATIC_DRAW);
  if (!positionBuffer) throw Error('initPositionBuffer failed');
  return positionBuffer;
}

function initColorBuffer(glCtx: WebGL2RenderingContext) {
  const colors = [
    1.0,
    1.0,
    1.0,
    1.0, // white
    1.0,
    0.0,
    0.0,
    1.0, // red
    0.0,
    1.0,
    0.0,
    1.0, // green
    0.0,
    0.0,
    1.0,
    1.0, // blue
  ];
  const colorBuffer = glCtx.createBuffer();
  if (!colorBuffer) throw Error('create color buffer failed');
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, colorBuffer);
  glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(colors), glCtx.STATIC_DRAW);
  return colorBuffer;
}

export { initBuffers };
