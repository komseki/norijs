
precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform sampler2D texPosition;

attribute vec4 position;
attribute float locID;

uniform int width;
uniform int height;

vec2 conv1Dto2D(int idx, int w, int h) {

    int y = idx/(w);
    int x = idx-((w)*y);

    return vec2(float(x)/float(w), float(y)/float(h));
}

void main() {

    vec2 loc = conv1Dto2D(int(locID), width, height);
    vec4 pos = texture2D(texPosition, vec2(loc.x, 1.0-loc.y));

    if(pos.w == 2.0) {
        gl_PointSize = 5.0;
    }
    else {
        gl_PointSize = 1.0;
    }

  //  if(locID > 100.0) gl_PointSize = 100.0;


    //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * pos;

}