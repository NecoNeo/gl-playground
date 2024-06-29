import { mat4 } from 'gl-matrix';
import { initBuffers } from './init-buffers';
import { loadTexture } from './load-texture';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const vertexShaderSrc: string = require('raw-loader!./cube.vert').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fragmentShaderSrc: string = require('raw-loader!./cube.frag').default;

function initShaderProgram(glCtx: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram | null {
  const vertexShader = loadShader(glCtx, glCtx.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(glCtx, glCtx.FRAGMENT_SHADER, fsSource);
  const shaderProgram = glCtx.createProgram();
  if (!shaderProgram || !vertexShader || !fragmentShader) throw Error('failed to create shaderProgram!');
  glCtx.attachShader(shaderProgram, vertexShader);
  glCtx.attachShader(shaderProgram, fragmentShader);
  glCtx.linkProgram(shaderProgram);
  if (!glCtx.getProgramParameter(shaderProgram, glCtx.LINK_STATUS)) {
    console.warn(`Unable to initialize the shader program: ${glCtx.getProgramInfoLog(shaderProgram)}`);
    return null;
  }
  return shaderProgram;
}

function loadShader(glCtx: WebGL2RenderingContext, type: number, source: string) {
  const shader = glCtx.createShader(type);
  if (!shader) throw Error('failed to create shader!');
  glCtx.shaderSource(shader, source);
  glCtx.compileShader(shader);
  if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
    console.warn(`An error occurred compiling the shaders: ${glCtx.getShaderInfoLog(shader)}`);
    glCtx.deleteShader(shader);
    return null;
  }
  return shader;
}

/** start gl rendering program
 * // TODO refractor with frame drawing
 */
export async function startRendering(glCtx: WebGL2RenderingContext, setFps: (fps: string) => void) {
  const shaderProgram = initShaderProgram(glCtx, vertexShaderSrc, fragmentShaderSrc);
  if (!shaderProgram) return;

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: glCtx.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: glCtx.getAttribLocation(shaderProgram, 'aVertexNormal'),
      // vertexColor: glCtx.getAttribLocation(shaderProgram, 'aVertexColor'),
      textureCoord: glCtx.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: glCtx.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: glCtx.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: glCtx.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      uSampler: glCtx.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  const buffers = initBuffers(glCtx);

  const texture = loadTexture(glCtx, './box_face.png');
  glCtx.pixelStorei(glCtx.UNPACK_FLIP_Y_WEBGL, true); // Flip image pixels into the bottom-to-top order that WebGL expects.

  // let squareRotation = 0;
  let cubeRotation = 0.0;
  let deltaTime = 0;
  let accumTime = 0;
  let frames = 0;
  let now = new Date().getTime();
  drawSceneFrame(glCtx, texture, buffers, programInfo, cubeRotation);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    drawSceneFrame(glCtx, texture, buffers, programInfo, cubeRotation);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
    const then = new Date().getTime();
    deltaTime = then - now;
    accumTime += deltaTime;
    frames++;
    now = then;
    cubeRotation += deltaTime / 1000;
    if (accumTime > 2000) {
      setFps((frames / 2).toFixed(1));
      accumTime = 0;
      frames = 0;
    }
  }
}

function drawSceneFrame(
  glCtx: WebGL2RenderingContext,
  texture: WebGLTexture,
  buffers: {
    position: WebGLBuffer;
    normal: WebGLBuffer;
    color: WebGLBuffer;
    textureCoord: WebGLBuffer;
    indices: WebGLBuffer;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  programInfo: any,
  // squareRotation: number,
  cubeRotation: number,
) {
  // referece:
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
  glCtx.clearColor(0, 0, 0, 1.0);
  glCtx.clearDepth(1.0);
  glCtx.enable(glCtx.DEPTH_TEST);
  glCtx.depthFunc(glCtx.LEQUAL);
  glCtx.clear(glCtx.COLOR_BUFFER_BIT | glCtx.DEPTH_BUFFER_BIT);

  const fieldOfView = (45 * Math.PI) / 180;
  const aspect = (glCtx.canvas as HTMLCanvasElement).clientWidth / (glCtx.canvas as HTMLCanvasElement).clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);
  // mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation, [0, 0, 1]);
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation, // amount to rotate in radians
    [0, 0, 1],
  ); // axis to rotate around (Z)
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.7, // amount to rotate in radians
    [0, 1, 0],
  ); // axis to rotate around (Y)
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.3, // amount to rotate in radians
    [1, 0, 0],
  ); // axis to rotate around (X)

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  setPositionAttribute(glCtx, buffers, programInfo);
  setNormalAttribute(glCtx, buffers, programInfo);
  // setColorAttribute(glCtx, buffers, programInfo);
  setTextureAttribute(glCtx, buffers, programInfo);

  glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, buffers.indices);

  glCtx.useProgram(programInfo.program);
  glCtx.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
  glCtx.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
  glCtx.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

  // Tell WebGL we want to affect texture unit 0
  glCtx.activeTexture(glCtx.TEXTURE0);
  // Bind the texture to texture unit 0
  glCtx.bindTexture(glCtx.TEXTURE_2D, texture);
  // Tell the shader we bound the texture to texture unit 0
  glCtx.uniform1i(programInfo.uniformLocations.uSampler, 0);

  // const offset = 0;
  // const vertexCount = 4;
  // glCtx.drawArrays(glCtx.TRIANGLE_STRIP, offset, vertexCount);
  const vertexCount = 36;
  const type = glCtx.UNSIGNED_SHORT;
  const offset = 0;
  glCtx.drawElements(glCtx.TRIANGLES, vertexCount, type, offset);
}

function setPositionAttribute(
  glCtx: WebGL2RenderingContext,
  buffers: { position: WebGLBuffer; indices: WebGLBuffer },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  programInfo: any,
) {
  // const numComponents = 2; // pull out 2 values per iteration
  // const type = glCtx.FLOAT; // the data in the buffer is 32bit floats
  // const normalize = false; // don't normalize
  // const stride = 0; // how many bytes to get from one set of values to the next
  // // 0 = use type and numComponents above
  // const offset = 0; // how many bytes inside the buffer to start from
  // glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buffers.position);
  // glCtx.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
  // glCtx.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  const numComponents = 3; // pull out 3 values per iteration
  const type = glCtx.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buffers.position);
  glCtx.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
  glCtx.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setNormalAttribute(glCtx: WebGL2RenderingContext, buffers: { normal: WebGLBuffer }, programInfo: any) {
  const numComponents = 3;
  const type = glCtx.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buffers.normal);
  glCtx.vertexAttribPointer(programInfo.attribLocations.vertexNormal, numComponents, type, normalize, stride, offset);
  glCtx.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// function setColorAttribute(glCtx: WebGL2RenderingContext, buffers: { color: WebGLBuffer }, programInfo: any) {
//   const numComponents = 4;
//   const type = glCtx.FLOAT;
//   const normalize = false;
//   const stride = 0;
//   const offset = 0;
//   glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buffers.color);
//   glCtx.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
//   glCtx.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setTextureAttribute(glCtx: WebGL2RenderingContext, buffers: { textureCoord: WebGLBuffer }, programInfo: any) {
  const num = 2; // every coordinate composed of 2 values
  const type = glCtx.FLOAT; // the data in the buffer is 32-bit float
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set to the next
  const offset = 0; // how many bytes inside the buffer to start from
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buffers.textureCoord);
  glCtx.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
  glCtx.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}
