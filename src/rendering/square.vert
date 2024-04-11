attribute vec4 aVertexPosition;
uniform mat4 viewModelMatrix;
uniform mat4 projectionMatrix;

void main() {
    gl_Position = projectionMatrix * viewModelMatrix * aVertexPosition;
}
