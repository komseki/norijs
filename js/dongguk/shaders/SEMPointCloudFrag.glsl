precision mediump float;
 precision mediump int;

 uniform vec3 color;
 uniform sampler2D texture;
 uniform float maxLife;
 uniform float alpha;

 varying float vRotate;
 varying float vLife;

 varying vec3 eye;

 void main() {

     if(vLife < 0.0) discard;


     float co = cos(vRotate);
     float si = sin(vRotate);

     vec3 nor = vec3(gl_PointCoord.x-0.5, gl_PointCoord.y-0.5, 0.5);
     nor = normalize(nor);

     float len = length(vec2(gl_PointCoord.x-0.5, gl_PointCoord.y-0.5));

     if(len > 0.5) discard;

     vec3 r = reflect(eye, nor);
     float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );

     vec2 vN = r.xy / m + .5;

     vec3 base = texture2D( texture, vN ).rgb;


     float a = alpha;

     if(a <= 0.0) a = (vLife/maxLife);
     if(a <  0.0) a = 0.0;

     gl_FragColor = vec4(base, 1.0);
 }