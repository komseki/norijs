precision mediump float;
precision mediump int;

uniform vec3 color;
uniform sampler2D texture;
uniform float maxLife;
uniform float alpha;

varying float vRotate;
varying float vLife;


void main() {

    if(vLife < 0.0) discard;

    float co = cos(vRotate);
    float si = sin(vRotate);

    vec2 rotatedUV = vec2(co * (gl_PointCoord.x - 0.5) + si * (gl_PointCoord.y - 0.5) + 0.5,
	                      co * (gl_PointCoord.y - 0.5) - si * (gl_PointCoord.x - 0.5) + 0.5);

    vec4 c = texture2D(texture, rotatedUV);

    vec3 glColor = vec3(c.x*color.x, c.y*color.y, c.z*color.z);


    float a = alpha;

    if(a <= 0.0) a = (vLife/maxLife);
    if(a <  0.0) a = 0.0;

    gl_FragColor = vec4(glColor, c.w * a);
}