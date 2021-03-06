#extension GL_EXT_frag_depth : require

uniform mediump vec2 resolution;
uniform sampler2D textureSamplers[2];
varying mediump vec2 var_textureCoord;

mediump vec4 T(mediump float s, mediump float t) {
  return texture2D(textureSamplers[0], var_textureCoord + vec2(s / resolution.s, t / resolution.t));
}

void main(void) {
  gl_FragDepthEXT = texture2D(textureSamplers[1], var_textureCoord).x;
  gl_FragColor = (1. * T(-1.,  1.) + 2. * T(0.,  1.) + 1. * T(1.,  1.) +
                  2. * T(-1.,  0.) + 4. * T(0.,  0.) + 2. * T(1.,  0.) +
                  1. * T(-1., -1.) + 2. * T(0., -1.) + 1. * T(1., -1.)) / 16.;
}
