
// precision mediump float;
precision highp float;

uniform sampler2D u_grid;
uniform sampler2D u_flags;
uniform sampler2D u_sprite;
uniform vec2 u_flags_resolution;

uniform vec2 u_scroll;
uniform float u_showBombs;

// uniform float u_backgroundTop;
// uniform float u_damaged;
// uniform float u_effectsSize;
// uniform float u_time;
// uniform vec2 u_textureSize;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;
varying vec2 v_resolution;

vec4 gridLayerColor() {
  vec2 repeatOffset = 20.0 / v_resolution;
  vec2 pixelOffset = v_texCoord + (u_scroll / v_resolution);

  vec2 cord = pixelOffset / repeatOffset;
  vec4 uiColor = texture2D(u_grid, fract(cord + repeatOffset));

  return uiColor;
}

const float EMPTY = 1.0;
const float TYPE_1 = 2.0;
const float TYPE_2 = 3.0;
const float TYPE_3 = 4.0;
const float TYPE_4 = 5.0;
const float TYPE_5 = 6.0;
const float TYPE_6 = 7.0;
const float TYPE_7 = 8.0;
const float TYPE_8 = 9.0;

bool is_color(float first, float second) {
  return floor(first * 10.0) == second;
}

vec2 sprite_coords(vec2 coords) {
  vec2 pixelOffset = v_texCoord + (u_scroll / v_resolution);
  float sprite_resolution_ratio = 6.25;
  vec2 base = mod(pixelOffset * sprite_resolution_ratio, 0.25);

  return vec2(
    base + (0.25 * coords)
  );
}

vec4 flagsLayerColor() {
  vec2 pixelOffset = v_texCoord + (u_scroll / v_resolution);
  vec2 flagsLayerRatio = u_flags_resolution / v_resolution;
  float sprite_resolution_ratio = 6.25;

  vec4 flags = texture2D(u_flags, pixelOffset / ((20.0) * flagsLayerRatio));

  // Bombs
  if (is_color(flags.b, 10.0) && u_showBombs == 1.0) {
    return texture2D(u_sprite, sprite_coords(vec2(2, 3)));
  }

  // Flags
  if (is_color(flags.g, 10.0)) {
    return texture2D(u_sprite, sprite_coords(vec2(3, 2))) * vec4(0.8, 2.0, 0.8, 1.0);
  }

  if (is_color(flags.r, EMPTY)) {
    return texture2D(u_sprite, sprite_coords(vec2(0, 0)));
  }

  if (is_color(flags.r, TYPE_1)) {
    return texture2D(u_sprite, sprite_coords(vec2(1, 0)));
  }

  if (is_color(flags.r, TYPE_2)) {
    return texture2D(u_sprite, sprite_coords(vec2(2, 0)));
  }

  if (is_color(flags.r, TYPE_3)) {
    return texture2D(u_sprite, sprite_coords(vec2(3, 0)));
  }

  if (is_color(flags.r, TYPE_4)) {
    return texture2D(u_sprite, sprite_coords(vec2(0, 1)));
  }

  if (is_color(flags.r, TYPE_5)) {
    return texture2D(u_sprite, sprite_coords(vec2(1, 1)));
  }

  if (is_color(flags.r, TYPE_6)) {
    return texture2D(u_sprite, sprite_coords(vec2(2, 1)));
  }

  if (is_color(flags.r, TYPE_7)) {
    return texture2D(u_sprite, sprite_coords(vec2(3, 1)));
  }

  if (is_color(flags.r, TYPE_8)) {
    return texture2D(u_sprite, sprite_coords(vec2(0, 2)));
  }

  return vec4(0.0);
}

vec4 overlay(vec4 color1, vec4 color2) {
  return color2 * color2.a + color1 * (1.0 - color2.a);
}

void main() {
  vec4 grid = gridLayerColor();
  vec4 flags = flagsLayerColor();
  vec4 ui = vec4(0.0, 0.0, 0.0, 0.0);

  vec2 bar_size = v_resolution / u_flags_resolution / 20.0;
  vec2 bar_pos = (u_scroll / v_resolution) * bar_size;

  if (v_texCoord.x > 0.99) {
    if (v_texCoord.y > bar_pos.y && v_texCoord.y < bar_pos.y + bar_size.y) {
      ui = vec4(0.0, 0.0, 0.0, 0.8);
    }
  }

  if (v_texCoord.y > 0.99) {
    if (v_texCoord.x > bar_pos.x && v_texCoord.x < bar_pos.x + bar_size.x) {
      ui = vec4(0.0, 0.0, 0.0, 0.8);
    }
  }

  gl_FragColor = overlay(overlay(grid, flags), ui);
}