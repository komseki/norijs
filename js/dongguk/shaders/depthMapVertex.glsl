precision mediump float;
precision mediump int;

attribute float life;
attribute float size;
attribute float rotate;

varying float vRotate;
varying float vLife;

varying vec3 eye;
varying float dist;

void main() {

    vRotate = rotate;
    vLife = life;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    eye = normalize(vec3(mvPosition));

    gl_PointSize = size*(300.0/(length(mvPosition.xyz)));

    dist = length(mvPosition.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}