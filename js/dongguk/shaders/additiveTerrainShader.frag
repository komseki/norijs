
uniform sampler2D texture;
uniform sampler2D texture2;

uniform vec3 color;

varying vec2  vertTex;
varying vec3  nor;
varying float height;


void main() {

	vec4 c0 = texture2D(texture, vertTex);
    vec4 c1 = texture2D(texture2, vertTex);


    float d0 = dot(vec3(0.0, 1.0, 0.0), nor);
    float d1 = dot(vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 0.0));

    float dot = abs(d0*d1/d1*d1);

    vec4 f = c0*(1.0-dot) + c1*(dot);

	gl_FragColor = f;
}
