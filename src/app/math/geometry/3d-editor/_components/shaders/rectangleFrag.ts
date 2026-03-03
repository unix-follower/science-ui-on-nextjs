const smallRectangleFragmentShader = `#version 300 es

precision highp float;
out vec4 outColor;

void main() {
  // redish-purple
  outColor = vec4(1, 0, 0.5, 1);
}
`

export default smallRectangleFragmentShader

export const rectangleFragmentShader = `#version 300 es

precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}
`
