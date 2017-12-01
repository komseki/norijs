precision mediump float;
precision mediump int;

attribute float alpha;

uniform float time;
uniform float velocity;

varying vec2 vertTex;
varying float vertAlpha;

void main() {

    float dev= uv.x + time * velocity;

    vertTex = vec2(dev, uv.y);
    vertAlpha = alpha;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}