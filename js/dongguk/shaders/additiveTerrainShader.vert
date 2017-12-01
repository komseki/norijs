precision mediump float;
precision mediump int;

//attribute vec3 position;
//attribute vec3 normal;
//attribute vec2 uv;

varying vec2  vertTex;
varying vec3  nor;
varying float height;


void main() {

	vertTex = uv;
	nor = normal;
	height = position.y;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}