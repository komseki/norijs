
varying vec2 vUv;
uniform sampler2D texture;
uniform sampler2D textTexture;
uniform float textUsed;

void main() {

    vec4 c = texture2D(texture, vUv);

    if(textUsed == 1.0) {

        vec4 t = texture2D(textTexture, vUv);

        gl_FragColor = vec4(t.xyz * t.w + c.xyz * (1.0-t.w), c.w+t.w);
    }

    else {

        gl_FragColor = c;
    }
}
