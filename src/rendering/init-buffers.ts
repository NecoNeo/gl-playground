function initBuffers(glCtx: WebGL2RenderingContext) {
  const positionBuffer = initPositionBuffer(glCtx);
  if (!positionBuffer) throw Error('initPositionBuffer failed');

  return {
    position: positionBuffer,
  };
}

function initPositionBuffer(glCtx: WebGL2RenderingContext) {
  const positionBuffer = glCtx.createBuffer();
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, positionBuffer);
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(positions), glCtx.STATIC_DRAW);
  return positionBuffer;
}

export { initBuffers };
