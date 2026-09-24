/**
 * Mathematical utilities & inline GLSL noise shaders.
 * Includes 3D Simplex noise, 3D analytical Curl Noise, and CPU 3-octave terrain generators.
 */

// Procedural stream path: X coordinate as a function of Z
export function getRiverCenter(z: number): number {
  return Math.sin(z * 0.07) * 3.8 + Math.cos(z * 0.032) * 1.6 - 0.4;
}

export function getRiverWidth(z: number): number {
  return 3.4 + Math.sin(z * 0.11) * 0.7;
}

// Simple CPU Simplex / 3-octave noise approximation for terrain elevation
function hash21(x: number, z: number): number {
  const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, z: number): number {
  const iX = Math.floor(x);
  const iZ = Math.floor(z);
  const fX = x - iX;
  const fZ = z - iZ;

  // Cubic Hermite curve
  const u = fX * fX * (3.0 - 2.0 * fX);
  const v = fZ * fZ * (3.0 - 2.0 * fZ);

  const a = hash21(iX, iZ);
  const b = hash21(iX + 1, iZ);
  const c = hash21(iX, iZ + 1);
  const d = hash21(iX + 1, iZ + 1);

  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

export function getTerrainHeight(x: number, z: number): number {
  const riverX = getRiverCenter(z);
  const riverW = getRiverWidth(z);
  const distToRiver = Math.abs(x - riverX);

  // Riverbed depression: smooth trough down to -0.42 below water surface (water at y = 0.0)
  let baseHeight = 0;
  if (distToRiver < riverW) {
    const t = distToRiver / riverW;
    const smoothT = t * t * (3 - 2 * t);
    baseHeight = -0.42 + smoothT * 0.52;
  } else {
    baseHeight = 0.12;
  }

  // 3-Octave Noise displacement
  const oct1 = smoothNoise(x * 0.08, z * 0.08) * 2.2;
  const oct2 = smoothNoise(x * 0.18 + 1.2, z * 0.18 + 2.4) * 0.9;
  const oct3 = smoothNoise(x * 0.42 + 3.1, z * 0.42 + 0.8) * 0.35;

  const totalNoise = (oct1 + oct2 + oct3) - 1.5;

  // Dampen hills right beside the river so banks are natural
  const riverBankFade = Math.min(1.0, Math.max(0.0, (distToRiver - riverW * 0.85) / 3.5));
  return baseHeight + totalNoise * riverBankFade;
}

// GLSL 3D Simplex Noise snippet
export const glslNoise3D = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}
`;

// GLSL 3D Curl Noise snippet (divergence-free fluid flow field)
export const glslCurlNoise3D = /* glsl */ `
${glslNoise3D}

vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  float n1 = snoise(vec3(p.x, p.y + e, p.z));
  float n2 = snoise(vec3(p.x, p.y - e, p.z));
  float n3 = snoise(vec3(p.x, p.y, p.z + e));
  float n4 = snoise(vec3(p.x, p.y, p.z - e));
  float n5 = snoise(vec3(p.x + e, p.y, p.z));
  float n6 = snoise(vec3(p.x - e, p.y, p.z));

  float x = (n1 - n2) - (n3 - n4);
  float y = (n3 - n4) - (n5 - n6);
  float z = (n5 - n6) - (n1 - n2);

  return normalize(vec3(x, y, z));
}
`;
