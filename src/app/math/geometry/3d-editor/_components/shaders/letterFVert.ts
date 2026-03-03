const letterFVertexShader = `#version 300 es

in vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform vec2 u_rotation;
uniform vec2 u_scale;

void main() {
  vec2 scaledPosition = a_position * u_scale;

  vec2 rotatedPosition = vec2(
     scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
     scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x);

  vec2 position = rotatedPosition + u_translation;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}`

export default letterFVertexShader

export const letterFWithTransformedMatrixVertexShader = `#version 300 es

in vec2 a_position;
 
uniform mat3 u_matrix;
 
void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}`

export const letterFWithTransformedMatrixVertex3dShader = `#version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

// a varying the color to the fragment shader
out vec4 v_color;

void main() {
  gl_Position = u_matrix * a_position;
  
  v_color = a_color;
}`

export const withTextureVertex3dShader = `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_matrix;

out vec2 v_texcoord;

void main() {
  gl_Position = u_matrix * a_position;

  v_texcoord = a_texcoord;
}
`
