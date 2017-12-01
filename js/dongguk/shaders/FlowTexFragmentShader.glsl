precision mediump float;
precision mediump int;

uniform sampler2D texture;

varying vec2 vertTex;
varying float vertAlpha;

void main() {

    vec4 c = texture2D(texture, vertTex);

    gl_FragColor = c;
    gl_FragColor.w *= vertAlpha;
}