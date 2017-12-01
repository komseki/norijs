precision mediump float;
precision mediump int;

attribute vec3 position;
attribute float locID;

uniform int width;
uniform int height;

varying vec4 vtx_out;

vec2 conv1Dto2D(int idx, int w, int h) {

    int y = idx/(w);
    int x = idx-((w)*y);

    return vec2(float(x)/float(w), float(y)/float(h));
}

void main(void) {

    vec2 xy_idx = conv1Dto2D(int(locID), width, height);
    xy_idx = xy_idx * vec2(2.0) - vec2(1.0);

    gl_PointSize = 0.0;
    gl_Position = vec4(xy_idx, 0.0, 1.0);

    // assign values

    vtx_out = vec4(position, 1.0);
}
