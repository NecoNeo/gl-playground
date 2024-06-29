#version 300 es

// varying lowp vec4 vColor;
in highp vec2 vTextureCoord;
in highp vec3 vLighting;
out lowp vec4 fragColor;

uniform sampler2D uSampler;

void main() {
    // gl_FragColor = vColor;
    highp vec4 texelColor = texture(uSampler, vTextureCoord);
    fragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
}
