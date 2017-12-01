precision mediump float;
precision mediump int;

uniform sampler2D texture;
uniform sampler2D matcap;
uniform sampler2D maskTexture;

varying vec3 eye;
varying vec2 vuv;

float dd = 0.001;
float ap = 10.0;

void main() {

	vec4 depth = texture2D(texture, vuv);
	vec4 mask  = texture2D(maskTexture, vuv);

	if(mask.x != 1.0) discard;
	if(depth.w <= 0.0) discard;

	vec4 z1 = texture2D(texture, vuv+vec2(dd,0.0)) - texture2D(texture, vuv-vec2(dd,0.0));
	vec4 z2 = texture2D(texture, vuv+vec2(0.0,dd)) - texture2D(texture, vuv-vec2(0.0,dd));


	vec3 A = vec3(1.0, 0.0, z1.x*ap);
    vec3 B = vec3(0.0, 1.0, z2.x*ap);

    vec3 N = cross(A, B);
    N = normalize(N);

    vec3 E = vec3(0,0,depth.x*100.0);

    vec3 r = reflect(E, N);
    float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );

    vec2 vN = r.xy / m + 0.5;

    vec3 base = texture2D( matcap, vN ).rgb;


    //gl_FragColor = depth;
    gl_FragColor = vec4(base, depth.w*0.8);

}