precision mediump float;
precision mediump int;

attribute vec3 velocity;
attribute float life;
attribute float size;
attribute float rotate;

uniform float win_height;
uniform float win_width;

varying float vRotate;
varying float vLife;

void main() {

    vRotate = rotate;
    vLife = life;

    float far = 5000.0;
    float near = 300.0;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    gl_PointSize = size*(300.0/(length(mvPosition.xyz)));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}