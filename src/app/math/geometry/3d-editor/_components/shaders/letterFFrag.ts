const letterFFragmentShader = `#version 300 es

precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}
`

export default letterFFragmentShader

export const letterFFragment3dShader = `#version 300 es

precision highp float;

// the varied color passed from the vertex shader
in vec4 v_color;
out vec4 outColor;

void main() {
  outColor = v_color;
}
`

export const withTextureFragment3dShader = `#version 300 es

precision highp float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord);
}
`
