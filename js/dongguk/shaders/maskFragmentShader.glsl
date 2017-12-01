precision mediump float;
precision mediump int;

uniform vec3 color;
uniform sampler2D texture;
uniform float maxLife;
uniform float alpha;

varying float vRotate;
varying float vLife;

varying vec3 eye;
varying float dist;

 void main() {

     if(vLife < 0.0) discard;

     float len = length(vec2(gl_PointCoord.x-0.5, gl_PointCoord.y-0.5));

     if(len > 0.5) discard;

     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
 }