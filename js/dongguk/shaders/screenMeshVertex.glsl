precision mediump float;
precision mediump int;

varying vec2 vuv;

varying vec3 eye;

void main() {

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    eye = normalize(vec3(mvPosition));

    vuv = uv;
    gl_Position = vec4(position, 1.0);

}