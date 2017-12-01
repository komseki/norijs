
varying vec2 vUv;
uniform sampler2D texture;
uniform vec3 shadowColor;

void main() {

    vec4 c = texture2D(texture, vUv);
    gl_FragColor = vec4(shadowColor, c.w);
}
