#version 300 es

// varying lowp vec4 vColor;
in highp vec2 vTextureCoord;
out lowp vec4 fragColor;

uniform sampler2D uSampler;

void main() {
    // gl_FragColor = vColor;
    fragColor = texture(uSampler, vTextureCoord);
}
